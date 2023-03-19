import type {Pool, PoolClient, QueryResultRow} from 'pg';

import type {
  Address,
  AdminOverview,
  AnalyticsOverview,
  Cart,
  CartItem,
  Category,
  Coupon,
  MenuItem,
  Notification,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductFilters,
  Restaurant,
  Review,
  Store,
  StoreFilters,
  StoredUser,
  User
} from '../types/domain.js';
import {badRequest, conflict, notFound} from '../utils/errors.js';
import type {CreateAddressInput, CreateReviewInput, CreateUserInput, DoorstepRepository} from './repository.js';

interface UserRow extends QueryResultRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: StoredUser['role'];
  phone: string | null;
  avatar_url: string | null;
  created_at: Date;
}

interface CategoryRow extends QueryResultRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  type: Category['type'];
  description: string;
}

interface StoreRow extends QueryResultRow {
  id: string;
  slug: string;
  name: string;
  type: Store['type'];
  cuisine: string;
  category: string;
  description: string;
  logo_url: string;
  hero_image_url: string;
  cover_image_url: string;
  rating: string;
  review_count: number;
  delivery_time_minutes: number;
  delivery_fee_cents: number;
  minimum_order_cents: number;
  distance_km: string;
  price_level: Store['priceLevel'];
  tags: string[];
  is_featured: boolean;
  is_open: boolean;
  created_at: Date;
}

interface ProductRow extends QueryResultRow {
  id: string;
  store_id: string;
  category_id: string;
  category: string;
  name: string;
  description: string;
  price_cents: number;
  original_price_cents: number | null;
  discount_percent: number | null;
  image_url: string;
  calories: number | null;
  weight: string | null;
  rating: string;
  is_available: boolean;
  is_popular: boolean;
}

interface OrderRow extends QueryResultRow {
  id: string;
  customer_id: string;
  driver_id: string | null;
  store_id: string;
  store_name: string;
  status: OrderStatus;
  delivery_address: string;
  subtotal_cents: number;
  delivery_fee_cents: number;
  service_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  eta_minutes: number;
  created_at: Date;
  updated_at: Date;
}

interface OrderItemRow extends QueryResultRow {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price_cents: number;
}

interface AddressRow extends QueryResultRow {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  postal_code: string;
  instructions: string | null;
  is_default: boolean;
}

interface PaymentMethodRow extends QueryResultRow {
  id: string;
  user_id: string;
  brand: PaymentMethod['brand'];
  last4: string;
  label: string;
  is_default: boolean;
}

interface NotificationRow extends QueryResultRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: Notification['type'];
  is_read: boolean;
  created_at: Date;
}

interface CouponRow extends QueryResultRow {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_percent: number;
  minimum_order_cents: number;
  expires_at: Date;
  is_active: boolean;
}

interface ReviewRow extends QueryResultRow {
  id: string;
  store_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  body: string;
  created_at: Date;
}

const mapUser = (row: UserRow): StoredUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  phone: row.phone ?? undefined,
  avatarUrl: row.avatar_url ?? undefined,
  createdAt: row.created_at.toISOString()
});

const publicUser = (row: UserRow): User => {
  const user = mapUser(row);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt
  };
};

const mapCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  icon: row.icon,
  color: row.color,
  type: row.type,
  description: row.description
});

const mapStore = (row: StoreRow): Store => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  type: row.type,
  cuisine: row.cuisine,
  category: row.category,
  description: row.description,
  logoUrl: row.logo_url,
  heroImageUrl: row.hero_image_url,
  coverImageUrl: row.cover_image_url,
  rating: Number(row.rating),
  reviewCount: row.review_count,
  deliveryTimeMinutes: row.delivery_time_minutes,
  deliveryFeeCents: row.delivery_fee_cents,
  minimumOrderCents: row.minimum_order_cents,
  distanceKm: Number(row.distance_km),
  priceLevel: row.price_level,
  tags: row.tags,
  isFeatured: row.is_featured,
  isOpen: row.is_open,
  createdAt: row.created_at.toISOString()
});

const mapProduct = (row: ProductRow): Product => ({
  id: row.id,
  storeId: row.store_id,
  restaurantId: row.store_id,
  categoryId: row.category_id,
  category: row.category,
  name: row.name,
  description: row.description,
  priceCents: row.price_cents,
  originalPriceCents: row.original_price_cents ?? undefined,
  discountPercent: row.discount_percent ?? undefined,
  imageUrl: row.image_url,
  calories: row.calories ?? undefined,
  weight: row.weight ?? undefined,
  rating: Number(row.rating),
  isAvailable: row.is_available,
  isPopular: row.is_popular
});

const mapAddress = (row: AddressRow): Address => ({
  id: row.id,
  userId: row.user_id,
  label: row.label,
  line1: row.line1,
  line2: row.line2 ?? undefined,
  city: row.city,
  postalCode: row.postal_code,
  instructions: row.instructions ?? undefined,
  isDefault: row.is_default
});

const mapPayment = (row: PaymentMethodRow): PaymentMethod => ({
  id: row.id,
  userId: row.user_id,
  brand: row.brand,
  last4: row.last4,
  label: row.label,
  isDefault: row.is_default
});

const mapNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  body: row.body,
  type: row.type,
  isRead: row.is_read,
  createdAt: row.created_at.toISOString()
});

const mapCoupon = (row: CouponRow): Coupon => ({
  id: row.id,
  code: row.code,
  title: row.title,
  description: row.description,
  discountPercent: row.discount_percent,
  minimumOrderCents: row.minimum_order_cents,
  expiresAt: row.expires_at.toISOString(),
  isActive: row.is_active
});

const mapReview = (row: ReviewRow): Review => ({
  id: row.id,
  storeId: row.store_id,
  userId: row.user_id,
  userName: row.user_name,
  rating: row.rating,
  body: row.body,
  createdAt: row.created_at.toISOString()
});

const isDuplicateKey = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as {code?: string}).code === '23505';

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
      if (isDuplicateKey(error)) {
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

  async listUsers(): Promise<User[]> {
    const result = await this.pool.query<UserRow>('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows.map(publicUser);
  }

  async listCategories(): Promise<Category[]> {
    const result = await this.pool.query<CategoryRow>('SELECT * FROM categories ORDER BY name ASC');
    return result.rows.map(mapCategory);
  }

  async listStores(filters: StoreFilters = {}): Promise<Store[]> {
    const values: Array<string | boolean> = [];
    const where: string[] = [];

    if (filters.type) {
      values.push(filters.type);
      where.push(`type = $${values.length}`);
    }

    if (filters.featured !== undefined) {
      values.push(filters.featured);
      where.push(`is_featured = $${values.length}`);
    }

    if (filters.category) {
      values.push(filters.category);
      where.push(`LOWER(category) = LOWER($${values.length})`);
    }

    if (filters.query) {
      values.push(`%${filters.query}%`);
      where.push(`(name ILIKE $${values.length} OR cuisine ILIKE $${values.length} OR description ILIKE $${values.length})`);
    }

    const result = await this.pool.query<StoreRow>(
      `SELECT * FROM stores
       ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY is_open DESC, is_featured DESC, rating DESC, name ASC`,
      values
    );
    return result.rows.map(mapStore);
  }

  async getStore(idOrSlug: string): Promise<Store | null> {
    const result = await this.pool.query<StoreRow>('SELECT * FROM stores WHERE id = $1 OR slug = $1', [idOrSlug]);
    return result.rows[0] ? mapStore(result.rows[0]) : null;
  }

  async listProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const values: Array<string | boolean> = [];
    const where: string[] = [];

    if (filters.storeId) {
      values.push(filters.storeId);
      where.push(`products.store_id = $${values.length}`);
    }

    if (filters.categoryId) {
      values.push(filters.categoryId);
      where.push(`products.category_id = $${values.length}`);
    }

    if (filters.query) {
      values.push(`%${filters.query}%`);
      where.push(`(products.name ILIKE $${values.length} OR products.description ILIKE $${values.length})`);
    }

    if (filters.deal) {
      where.push('products.discount_percent IS NOT NULL');
    }

    if (filters.popular) {
      where.push('products.is_popular = TRUE');
    }

    const result = await this.pool.query<ProductRow>(
      `SELECT products.*, categories.name AS category
       FROM products
       JOIN categories ON categories.id = products.category_id
       ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY products.is_popular DESC, products.rating DESC, products.name ASC`,
      values
    );
    return result.rows.map(mapProduct);
  }

  async getProduct(id: string): Promise<Product | null> {
    const result = await this.pool.query<ProductRow>(
      `SELECT products.*, categories.name AS category
       FROM products
       JOIN categories ON categories.id = products.category_id
       WHERE products.id = $1`,
      [id]
    );
    return result.rows[0] ? mapProduct(result.rows[0]) : null;
  }

  async listRestaurants(): Promise<Restaurant[]> {
    return this.listStores({type: 'restaurant'});
  }

  async getRestaurant(id: string): Promise<Restaurant | null> {
    return this.getStore(id);
  }

  async listMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return this.listProducts({storeId: restaurantId});
  }

  async getMenuItem(id: string): Promise<MenuItem | null> {
    return this.getProduct(id);
  }

  async getCart(userId: string): Promise<Cart> {
    const cartId = await this.ensureCart(userId);
    const items = await this.getCartItems(cartId);
    return this.buildCart(userId, items);
  }

  async addCartItem(userId: string, menuItemId: string, quantity: number): Promise<Cart> {
    const product = await this.getProduct(menuItemId);
    if (!product || !product.isAvailable) {
      throw notFound('Product is not available');
    }

    const cartId = await this.ensureCart(userId);
    const items = await this.getCartItems(cartId);
    const cartStoreIds = new Set(items.map((item) => item.storeId));
    if (cartStoreIds.size > 0 && !cartStoreIds.has(product.storeId)) {
      throw badRequest('Cart can only contain items from one store per order');
    }

    await this.pool.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
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

      const storeIds = new Set(items.map((item) => item.storeId));
      if (storeIds.size > 1) {
        throw badRequest('Cart can only contain items from one store per order');
      }

      const cart = this.buildCart(userId, items);
      const firstItem = items[0];
      const store = await this.getStore(firstItem.storeId);
      const orderResult = await client.query<OrderRow>(
        `INSERT INTO orders (
          customer_id,
          store_id,
          delivery_address,
          subtotal_cents,
          delivery_fee_cents,
          service_fee_cents,
          discount_cents,
          total_cents,
          eta_minutes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING orders.*, (SELECT name FROM stores WHERE id = orders.store_id) AS store_name`,
        [
          userId,
          firstItem.storeId,
          deliveryAddress,
          cart.subtotalCents,
          cart.deliveryFeeCents,
          cart.serviceFeeCents,
          cart.discountCents,
          cart.totalCents,
          store?.deliveryTimeMinutes ?? 28
        ]
      );

      const orderId = orderResult.rows[0].id;
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, name, quantity, unit_price_cents)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.productId, item.name, item.quantity, item.priceCents]
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

  async listAllOrders(): Promise<Order[]> {
    return this.listOrders('TRUE', []);
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

    const result = await this.pool.query(
      `UPDATE orders
       SET driver_id = $2, status = 'assigned', updated_at = NOW()
       WHERE id = $1`,
      [orderId, driverId]
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

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const result = await this.pool.query('UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1', [
      orderId,
      status
    ]);
    if (result.rowCount === 0) {
      throw notFound('Order not found');
    }

    const order = await this.getOrder(orderId);
    if (!order) {
      throw notFound('Order not found');
    }

    return order;
  }

  async listAddresses(userId: string): Promise<Address[]> {
    const result = await this.pool.query<AddressRow>('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, label ASC', [
      userId
    ]);
    return result.rows.map(mapAddress);
  }

  async createAddress(userId: string, input: CreateAddressInput): Promise<Address> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      if (input.isDefault) {
        await client.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
      }
      const result = await client.query<AddressRow>(
        `INSERT INTO addresses (user_id, label, line1, line2, city, postal_code, instructions, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, NOT EXISTS (SELECT 1 FROM addresses WHERE user_id = $1)))
         RETURNING *`,
        [
          userId,
          input.label,
          input.line1,
          input.line2 ?? null,
          input.city,
          input.postalCode,
          input.instructions ?? null,
          input.isDefault ?? null
        ]
      );
      await client.query('COMMIT');
      return mapAddress(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.pool.query('DELETE FROM addresses WHERE user_id = $1 AND id = $2', [userId, addressId]);
  }

  async listPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const result = await this.pool.query<PaymentMethodRow>(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY is_default DESC, brand ASC',
      [userId]
    );
    return result.rows.map(mapPayment);
  }

  async listNotifications(userId: string): Promise<Notification[]> {
    const result = await this.pool.query<NotificationRow>(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(mapNotification);
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<Notification> {
    const result = await this.pool.query<NotificationRow>(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND id = $2
       RETURNING *`,
      [userId, notificationId]
    );
    if (!result.rows[0]) {
      throw notFound('Notification not found');
    }
    return mapNotification(result.rows[0]);
  }

  async listCoupons(): Promise<Coupon[]> {
    const result = await this.pool.query<CouponRow>(
      'SELECT * FROM coupons WHERE is_active = TRUE AND expires_at > NOW() ORDER BY discount_percent DESC'
    );
    return result.rows.map(mapCoupon);
  }

  async listReviews(storeId: string): Promise<Review[]> {
    const result = await this.pool.query<ReviewRow>(
      `SELECT reviews.*, users.name AS user_name
       FROM reviews
       JOIN users ON users.id = reviews.user_id
       WHERE reviews.store_id = $1
       ORDER BY reviews.created_at DESC`,
      [storeId]
    );
    return result.rows.map(mapReview);
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    const result = await this.pool.query<ReviewRow>(
      `INSERT INTO reviews (store_id, user_id, rating, body)
       VALUES ($1, $2, $3, $4)
       RETURNING reviews.*, (SELECT name FROM users WHERE id = reviews.user_id) AS user_name`,
      [input.storeId, input.userId, input.rating, input.body]
    );
    return mapReview(result.rows[0]);
  }

  async adminOverview(): Promise<AdminOverview> {
    const result = await this.pool.query<{
      open_orders: string;
      active_drivers: string;
      revenue_cents: string;
      restaurants_online: string;
      stores_online: string;
      customers: string;
      products: string;
      average_order_value_cents: string;
    }>(
      `SELECT
        (SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered', 'cancelled')) AS open_orders,
        (SELECT COUNT(*) FROM users WHERE role = 'driver') AS active_drivers,
        (SELECT COALESCE(SUM(total_cents), 0) FROM orders WHERE status = 'delivered') AS revenue_cents,
        (SELECT COUNT(*) FROM stores WHERE type = 'restaurant' AND is_open = TRUE) AS restaurants_online,
        (SELECT COUNT(*) FROM stores WHERE is_open = TRUE) AS stores_online,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers,
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT COALESCE(ROUND(AVG(total_cents)), 0) FROM orders) AS average_order_value_cents`
    );
    const row = result.rows[0];

    return {
      openOrders: Number(row.open_orders),
      activeDrivers: Number(row.active_drivers),
      revenueCents: Number(row.revenue_cents),
      restaurantsOnline: Number(row.restaurants_online),
      storesOnline: Number(row.stores_online),
      customers: Number(row.customers),
      products: Number(row.products),
      conversionRate: 8.7,
      averageOrderValueCents: Number(row.average_order_value_cents)
    };
  }

  async analyticsOverview(): Promise<AnalyticsOverview> {
    const [overview, topStoresResult] = await Promise.all([
      this.adminOverview(),
      this.pool.query<{store_id: string; name: string; revenue_cents: string; orders: string}>(
        `SELECT stores.id AS store_id, stores.name, COALESCE(SUM(orders.total_cents), 0) AS revenue_cents, COUNT(orders.id) AS orders
         FROM stores
         LEFT JOIN orders ON orders.store_id = stores.id
         GROUP BY stores.id, stores.name
         ORDER BY revenue_cents DESC, stores.rating DESC
         LIMIT 5`
      )
    ]);

    return {
      revenueCents: overview.revenueCents,
      orders: overview.openOrders,
      averageOrderValueCents: overview.averageOrderValueCents,
      activeCustomers: overview.customers,
      repeatPurchaseRate: 41,
      fulfillmentRate: 97,
      topStores: topStoresResult.rows.map((row) => ({
        storeId: row.store_id,
        name: row.name,
        revenueCents: Number(row.revenue_cents),
        orders: Number(row.orders)
      })),
      orderVolume: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
        day,
        orders: 34 + index * 7,
        revenueCents: 62000 + index * 9800
      }))
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
      product_id: string;
      store_id: string;
      store_name: string;
      name: string;
      image_url: string;
      price_cents: number;
      quantity: number;
    }>(
      `SELECT
        cart_items.id,
        products.id AS product_id,
        stores.id AS store_id,
        stores.name AS store_name,
        products.name,
        products.image_url,
        products.price_cents,
        cart_items.quantity
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id
       JOIN stores ON stores.id = products.store_id
       WHERE cart_items.cart_id = $1
       ORDER BY cart_items.created_at ASC`,
      [cartId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      menuItemId: row.product_id,
      productId: row.product_id,
      restaurantId: row.store_id,
      storeId: row.store_id,
      restaurantName: row.store_name,
      storeName: row.store_name,
      name: row.name,
      imageUrl: row.image_url,
      priceCents: row.price_cents,
      quantity: row.quantity
    }));
  }

  private buildCart(userId: string, items: CartItem[]): Cart {
    const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
    const deliveryFeeCents = items.length > 0 ? 249 : 0;
    const serviceFeeCents = items.length > 0 ? Math.max(99, Math.round(subtotalCents * 0.06)) : 0;
    const discountCents = subtotalCents >= 3000 ? 500 : 0;

    return {
      userId,
      items,
      subtotalCents,
      deliveryFeeCents,
      serviceFeeCents,
      discountCents,
      totalCents: Math.max(0, subtotalCents + deliveryFeeCents + serviceFeeCents - discountCents)
    };
  }

  private async listOrders(whereClause: string, values: unknown[]): Promise<Order[]> {
    const orderResult = await this.pool.query<OrderRow>(
      `SELECT orders.*, stores.name AS store_name
       FROM orders
       JOIN stores ON stores.id = orders.store_id
       WHERE ${whereClause}
       ORDER BY orders.created_at DESC`,
      values
    );

    return Promise.all(
      orderResult.rows.map(async (row) => ({
        id: row.id,
        customerId: row.customer_id,
        driverId: row.driver_id,
        restaurantId: row.store_id,
        storeId: row.store_id,
        restaurantName: row.store_name,
        storeName: row.store_name,
        status: row.status,
        deliveryAddress: row.delivery_address,
        subtotalCents: row.subtotal_cents,
        deliveryFeeCents: row.delivery_fee_cents,
        serviceFeeCents: row.service_fee_cents,
        discountCents: row.discount_cents,
        totalCents: row.total_cents,
        etaMinutes: row.eta_minutes,
        items: await this.getOrderItems(row.id),
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString()
      }))
    );
  }

  private async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const result = await this.pool.query<OrderItemRow>('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC', [
      orderId
    ]);

    return result.rows.map((row) => ({
      id: row.id,
      menuItemId: row.product_id,
      productId: row.product_id,
      name: row.name,
      quantity: row.quantity,
      unitPriceCents: row.unit_price_cents
    }));
  }
}
