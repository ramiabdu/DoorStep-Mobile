import type {Pool, PoolClient, QueryResultRow} from 'pg';

import type {
  AdminOverview,
  Cart,
  CartItem,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  Restaurant,
  StoredUser,
  User
} from '../types/domain.js';
import {badRequest, conflict, notFound} from '../utils/errors.js';
import type {CreateUserInput, DoorstepRepository} from './repository.js';

interface UserRow extends QueryResultRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: StoredUser['role'];
  created_at: Date;
}

interface RestaurantRow extends QueryResultRow {
  id: string;
  name: string;
  cuisine: string;
  rating: string;
  delivery_time_minutes: number;
  delivery_fee_cents: number;
  hero_image_url: string;
  is_open: boolean;
}

interface MenuItemRow extends QueryResultRow {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  is_available: boolean;
}

interface OrderRow extends QueryResultRow {
  id: string;
  customer_id: string;
  driver_id: string | null;
  restaurant_id: string;
  restaurant_name: string;
  status: OrderStatus;
  delivery_address: string;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemRow extends QueryResultRow {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price_cents: number;
}

const mapUser = (row: UserRow): StoredUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  createdAt: row.created_at.toISOString()
});

const publicUser = (row: UserRow): User => {
  const user = mapUser(row);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
};

const mapRestaurant = (row: RestaurantRow): Restaurant => ({
  id: row.id,
  name: row.name,
  cuisine: row.cuisine,
  rating: Number(row.rating),
  deliveryTimeMinutes: row.delivery_time_minutes,
  deliveryFeeCents: row.delivery_fee_cents,
  heroImageUrl: row.hero_image_url,
  isOpen: row.is_open
});

const mapMenuItem = (row: MenuItemRow): MenuItem => ({
  id: row.id,
  restaurantId: row.restaurant_id,
  name: row.name,
  description: row.description,
  priceCents: row.price_cents,
  imageUrl: row.image_url,
  isAvailable: row.is_available
});

export class PostgresRepository implements DoorstepRepository {
  constructor(private readonly pool: Pool) {}

  async createUser(input: CreateUserInput): Promise<User> {
    try {
      const result = await this.pool.query<UserRow>(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, LOWER($2), $3, $4)
         RETURNING *`,
        [input.name, input.email, input.passwordHash, input.role]
      );
      return publicUser(result.rows[0]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw conflict('A user with this email already exists');
      }

      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<StoredUser | null> {
    const result = await this.pool.query<UserRow>('SELECT * FROM users WHERE email = LOWER($1)', [email]);
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? publicUser(result.rows[0]) : null;
  }

  async listRestaurants(): Promise<Restaurant[]> {
    const result = await this.pool.query<RestaurantRow>(
      'SELECT * FROM restaurants ORDER BY is_open DESC, rating DESC, name ASC'
    );
    return result.rows.map(mapRestaurant);
  }

  async getRestaurant(id: string): Promise<Restaurant | null> {
    const result = await this.pool.query<RestaurantRow>('SELECT * FROM restaurants WHERE id = $1', [id]);
    return result.rows[0] ? mapRestaurant(result.rows[0]) : null;
  }

  async listMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const result = await this.pool.query<MenuItemRow>(
      'SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY name ASC',
      [restaurantId]
    );
    return result.rows.map(mapMenuItem);
  }

  async getMenuItem(id: string): Promise<MenuItem | null> {
    const result = await this.pool.query<MenuItemRow>('SELECT * FROM menu_items WHERE id = $1', [id]);
    return result.rows[0] ? mapMenuItem(result.rows[0]) : null;
  }

  async getCart(userId: string): Promise<Cart> {
    const cartId = await this.ensureCart(userId);
    const items = await this.getCartItems(cartId);
    return this.buildCart(userId, items);
  }

  async addCartItem(userId: string, menuItemId: string, quantity: number): Promise<Cart> {
    const menuItem = await this.getMenuItem(menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      throw notFound('Menu item is not available');
    }

    const cartId = await this.ensureCart(userId);
    await this.pool.query(
      `INSERT INTO cart_items (cart_id, menu_item_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, menu_item_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [cartId, menuItemId, quantity]
    );

    return this.getCart(userId);
  }

  async updateCartItem(userId: string, cartItemId: string, quantity: number): Promise<Cart> {
    const cartId = await this.ensureCart(userId);

    if (quantity <= 0) {
      await this.pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND id = $2', [cartId, cartItemId]);
      return this.getCart(userId);
    }

    await this.pool.query('UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND id = $3', [
      quantity,
      cartId,
      cartItemId
    ]);
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cartId = await this.ensureCart(userId);
    await this.pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  }

  async createOrderFromCart(userId: string, deliveryAddress: string): Promise<Order> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const cartId = await this.ensureCart(userId, client);
      const items = await this.getCartItems(cartId, client);
      if (items.length === 0) {
        throw badRequest('Cart is empty');
      }

      const restaurantIds = new Set(items.map((item) => item.restaurantId));
      if (restaurantIds.size > 1) {
        throw badRequest('Cart can only contain items from one restaurant per order');
      }

      const cart = await this.buildCart(userId, items);
      const firstItem = items[0];
      const orderResult = await client.query<OrderRow>(
        `INSERT INTO orders (
          customer_id,
          restaurant_id,
          delivery_address,
          subtotal_cents,
          delivery_fee_cents,
          total_cents
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING orders.*, (SELECT name FROM restaurants WHERE id = orders.restaurant_id) AS restaurant_name`,
        [
          userId,
          firstItem.restaurantId,
          deliveryAddress,
          cart.subtotalCents,
          cart.deliveryFeeCents,
          cart.totalCents
        ]
      );

      const orderId = orderResult.rows[0].id;
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price_cents)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.menuItemId, item.name, item.quantity, item.priceCents]
        );
      }

      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
      await client.query('COMMIT');

      const order = await this.getOrder(orderId);
      if (!order) {
        throw notFound('Order not found after checkout');
      }

      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listOrdersForUser(userId: string): Promise<Order[]> {
    return this.listOrders('orders.customer_id = $1', [userId]);
  }

  async listOrdersForDriver(driverId: string): Promise<Order[]> {
    return this.listOrders('orders.driver_id = $1', [driverId]);
  }

  async getOrder(id: string): Promise<Order | null> {
    const orders = await this.listOrders('orders.id = $1', [id]);
    return orders[0] ?? null;
  }

  async listAssignableOrders(): Promise<Order[]> {
    return this.listOrders("orders.driver_id IS NULL AND orders.status NOT IN ('delivered', 'cancelled')", []);
  }

  async assignOrder(orderId: string, driverId: string): Promise<Order> {
    const driver = await this.findUserById(driverId);
    if (!driver || driver.role !== 'driver') {
      throw badRequest('Driver account was not found');
    }

    const result = await this.pool.query<OrderRow>(
      `UPDATE orders
       SET driver_id = $2, status = 'assigned', updated_at = NOW()
       WHERE id = $1
       RETURNING orders.*, (SELECT name FROM restaurants WHERE id = orders.restaurant_id) AS restaurant_name`,
      [orderId, driverId]
    );

    if (!result.rows[0]) {
      throw notFound('Order not found');
    }

    const order = await this.getOrder(orderId);
    if (!order) {
      throw notFound('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const result = await this.pool.query(
      'UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1',
      [orderId, status]
    );
    if (result.rowCount === 0) {
      throw notFound('Order not found');
    }

    const order = await this.getOrder(orderId);
    if (!order) {
      throw notFound('Order not found');
    }

    return order;
  }

  async adminOverview(): Promise<AdminOverview> {
    const result = await this.pool.query<{
      open_orders: string;
      active_drivers: string;
      revenue_cents: string;
      restaurants_online: string;
    }>(
      `SELECT
        (SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered', 'cancelled')) AS open_orders,
        (SELECT COUNT(*) FROM users WHERE role = 'driver') AS active_drivers,
        (SELECT COALESCE(SUM(total_cents), 0) FROM orders WHERE status = 'delivered') AS revenue_cents,
        (SELECT COUNT(*) FROM restaurants WHERE is_open = TRUE) AS restaurants_online`
    );
    const row = result.rows[0];

    return {
      openOrders: Number(row.open_orders),
      activeDrivers: Number(row.active_drivers),
      revenueCents: Number(row.revenue_cents),
      restaurantsOnline: Number(row.restaurants_online)
    };
  }

  private async ensureCart(userId: string, client: Pool | PoolClient = this.pool): Promise<string> {
    const result = await client.query<{id: string}>(
      `INSERT INTO carts (user_id)
       VALUES ($1)
       ON CONFLICT (user_id)
       DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING id`,
      [userId]
    );
    return result.rows[0].id;
  }

  private async getCartItems(cartId: string, client: Pool | PoolClient = this.pool): Promise<CartItem[]> {
    const result = await client.query<{
      id: string;
      menu_item_id: string;
      restaurant_id: string;
      restaurant_name: string;
      name: string;
      price_cents: number;
      quantity: number;
    }>(
      `SELECT
        cart_items.id,
        menu_items.id AS menu_item_id,
        restaurants.id AS restaurant_id,
        restaurants.name AS restaurant_name,
        menu_items.name,
        menu_items.price_cents,
        cart_items.quantity
       FROM cart_items
       JOIN menu_items ON menu_items.id = cart_items.menu_item_id
       JOIN restaurants ON restaurants.id = menu_items.restaurant_id
       WHERE cart_items.cart_id = $1
       ORDER BY cart_items.created_at ASC`,
      [cartId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      menuItemId: row.menu_item_id,
      restaurantId: row.restaurant_id,
      restaurantName: row.restaurant_name,
      name: row.name,
      priceCents: row.price_cents,
      quantity: row.quantity
    }));
  }

  private async buildCart(userId: string, items: CartItem[]): Promise<Cart> {
    const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
    const restaurant = items[0] ? await this.getRestaurant(items[0].restaurantId) : null;
    const deliveryFeeCents = items.length > 0 ? restaurant?.deliveryFeeCents ?? 0 : 0;

    return {
      userId,
      items,
      subtotalCents,
      deliveryFeeCents,
      totalCents: subtotalCents + deliveryFeeCents
    };
  }

  private async listOrders(whereClause: string, values: unknown[]): Promise<Order[]> {
    const orderResult = await this.pool.query<OrderRow>(
      `SELECT orders.*, restaurants.name AS restaurant_name
       FROM orders
       JOIN restaurants ON restaurants.id = orders.restaurant_id
       WHERE ${whereClause}
       ORDER BY orders.created_at DESC`,
      values
    );

    const orders = await Promise.all(
      orderResult.rows.map(async (row) => ({
        id: row.id,
        customerId: row.customer_id,
        driverId: row.driver_id,
        restaurantId: row.restaurant_id,
        restaurantName: row.restaurant_name,
        status: row.status,
        deliveryAddress: row.delivery_address,
        subtotalCents: row.subtotal_cents,
        deliveryFeeCents: row.delivery_fee_cents,
        totalCents: row.total_cents,
        items: await this.getOrderItems(row.id),
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }))
    );

    return orders;
  }

  private async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const result = await this.pool.query<OrderItemRow>(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC',
      [orderId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      menuItemId: row.menu_item_id,
      name: row.name,
      quantity: row.quantity,
      unitPriceCents: row.unit_price_cents
    }));
  }
}
