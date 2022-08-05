import bcrypt from 'bcryptjs';
import {randomUUID} from 'node:crypto';

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

const now = () => new Date().toISOString();

const restaurants: Restaurant[] = [
  {
    id: 'rest-green-bowl',
    name: 'Green Bowl Kitchen',
    cuisine: 'Healthy bowls',
    rating: 4.8,
    deliveryTimeMinutes: 24,
    deliveryFeeCents: 299,
    heroImageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    isOpen: true
  },
  {
    id: 'rest-urban-pizza',
    name: 'Urban Pizza Works',
    cuisine: 'Wood-fired pizza',
    rating: 4.7,
    deliveryTimeMinutes: 31,
    deliveryFeeCents: 349,
    heroImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80',
    isOpen: true
  },
  {
    id: 'rest-noodle-lab',
    name: 'Noodle Lab',
    cuisine: 'Asian fusion',
    rating: 4.9,
    deliveryTimeMinutes: 28,
    deliveryFeeCents: 399,
    heroImageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
    isOpen: true
  }
];

const menuItems: MenuItem[] = [
  {
    id: 'item-harvest-bowl',
    restaurantId: 'rest-green-bowl',
    name: 'Harvest Protein Bowl',
    description: 'Quinoa, roasted vegetables, herb chicken, avocado, and citrus tahini.',
    priceCents: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
    isAvailable: true
  },
  {
    id: 'item-salmon-bowl',
    restaurantId: 'rest-green-bowl',
    name: 'Salmon Market Bowl',
    description: 'Seared salmon, brown rice, cucumber, edamame, and ginger dressing.',
    priceCents: 1799,
    imageUrl: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=900&q=80',
    isAvailable: true
  },
  {
    id: 'item-margherita',
    restaurantId: 'rest-urban-pizza',
    name: 'Margherita Classica',
    description: 'San Marzano tomato, mozzarella, basil, and olive oil.',
    priceCents: 1399,
    imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=900&q=80',
    isAvailable: true
  },
  {
    id: 'item-truffle-pizza',
    restaurantId: 'rest-urban-pizza',
    name: 'Truffle Mushroom Pie',
    description: 'Wild mushrooms, truffle cream, aged mozzarella, and thyme.',
    priceCents: 1899,
    imageUrl: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=80',
    isAvailable: true
  },
  {
    id: 'item-ramen',
    restaurantId: 'rest-noodle-lab',
    name: 'Shoyu Ramen',
    description: 'Chicken broth, ramen noodles, egg, nori, scallions, and bamboo shoots.',
    priceCents: 1599,
    imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80',
    isAvailable: true
  },
  {
    id: 'item-dan-dan',
    restaurantId: 'rest-noodle-lab',
    name: 'Dan Dan Noodles',
    description: 'Sesame chili sauce, minced chicken, bok choy, and crushed peanuts.',
    priceCents: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=80',
    isAvailable: true
  }
];

const toPublicUser = (user: StoredUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

export class MemoryRepository implements DoorstepRepository {
  private readonly users = new Map<string, StoredUser>();
  private readonly carts = new Map<string, CartItem[]>();
  private readonly orders = new Map<string, Order>();

  constructor() {
    const createdAt = now();
    const passwordHash = bcrypt.hashSync('Doorstep123!', 10);

    [
      {id: 'user-admin', name: 'Ava Admin', email: 'admin@doorstep.dev', role: 'admin' as const},
      {id: 'user-driver', name: 'Drew Driver', email: 'driver@doorstep.dev', role: 'driver' as const},
      {id: 'user-customer', name: 'Casey Customer', email: 'customer@doorstep.dev', role: 'customer' as const}
    ].forEach((user) => {
      this.users.set(user.id, {
        ...user,
        passwordHash,
        createdAt
      });
    });
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const email = input.email.toLowerCase();
    if ([...this.users.values()].some((user) => user.email === email)) {
      throw conflict('A user with this email already exists');
    }

    const user: StoredUser = {
      id: randomUUID(),
      name: input.name,
      email,
      role: input.role,
      passwordHash: input.passwordHash,
      createdAt: now()
    };
    this.users.set(user.id, user);
    return toPublicUser(user);
  }

  async findUserByEmail(email: string): Promise<StoredUser | null> {
    return [...this.users.values()].find((user) => user.email === email.toLowerCase()) ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? toPublicUser(user) : null;
  }

  async listRestaurants(): Promise<Restaurant[]> {
    return restaurants;
  }

  async getRestaurant(id: string): Promise<Restaurant | null> {
    return restaurants.find((restaurant) => restaurant.id === id) ?? null;
  }

  async listMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return menuItems.filter((item) => item.restaurantId === restaurantId);
  }

  async getMenuItem(id: string): Promise<MenuItem | null> {
    return menuItems.find((item) => item.id === id) ?? null;
  }

  async getCart(userId: string): Promise<Cart> {
    const items = this.carts.get(userId) ?? [];
    return this.buildCart(userId, items);
  }

  async addCartItem(userId: string, menuItemId: string, quantity: number): Promise<Cart> {
    const menuItem = await this.getMenuItem(menuItemId);
    if (!menuItem || !menuItem.isAvailable) {
      throw notFound('Menu item is not available');
    }

    const restaurant = await this.getRestaurant(menuItem.restaurantId);
    if (!restaurant || !restaurant.isOpen) {
      throw badRequest('Restaurant is currently closed');
    }

    const items = this.carts.get(userId) ?? [];
    const existing = items.find((item) => item.menuItemId === menuItemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: randomUUID(),
        menuItemId,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        name: menuItem.name,
        priceCents: menuItem.priceCents,
        quantity
      });
    }

    this.carts.set(userId, items);
    return this.getCart(userId);
  }

  async updateCartItem(userId: string, cartItemId: string, quantity: number): Promise<Cart> {
    const current = this.carts.get(userId) ?? [];
    const items =
      quantity <= 0
        ? current.filter((item) => item.id !== cartItemId)
        : current.map((item) => (item.id === cartItemId ? {...item, quantity} : item));
    this.carts.set(userId, items);
    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    this.carts.set(userId, []);
  }

  async createOrderFromCart(userId: string, deliveryAddress: string): Promise<Order> {
    const cart = await this.getCart(userId);
    if (cart.items.length === 0) {
      throw badRequest('Cart is empty');
    }

    const restaurantIds = new Set(cart.items.map((item) => item.restaurantId));
    if (restaurantIds.size > 1) {
      throw badRequest('Cart can only contain items from one restaurant per order');
    }

    const firstItem = cart.items[0];
    const orderItems: OrderItem[] = cart.items.map((item) => ({
      id: randomUUID(),
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      unitPriceCents: item.priceCents
    }));

    const timestamp = now();
    const order: Order = {
      id: randomUUID(),
      customerId: userId,
      driverId: null,
      restaurantId: firstItem.restaurantId,
      restaurantName: firstItem.restaurantName,
      status: 'placed',
      deliveryAddress,
      subtotalCents: cart.subtotalCents,
      deliveryFeeCents: cart.deliveryFeeCents,
      totalCents: cart.totalCents,
      items: orderItems,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.orders.set(order.id, order);
    await this.clearCart(userId);
    return order;
  }

  async listOrdersForUser(userId: string): Promise<Order[]> {
    return [...this.orders.values()].filter((order) => order.customerId === userId);
  }

  async listOrdersForDriver(driverId: string): Promise<Order[]> {
    return [...this.orders.values()].filter((order) => order.driverId === driverId);
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async listAssignableOrders(): Promise<Order[]> {
    return [...this.orders.values()].filter((order) => !order.driverId && order.status !== 'cancelled');
  }

  async assignOrder(orderId: string, driverId: string): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw notFound('Order not found');
    }

    const driver = this.users.get(driverId);
    if (!driver || driver.role !== 'driver') {
      throw badRequest('Driver account was not found');
    }

    const updated: Order = {
      ...order,
      driverId,
      status: 'assigned',
      updatedAt: now()
    };
    this.orders.set(orderId, updated);
    return updated;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw notFound('Order not found');
    }

    const updated: Order = {
      ...order,
      status,
      updatedAt: now()
    };
    this.orders.set(orderId, updated);
    return updated;
  }

  async adminOverview(): Promise<AdminOverview> {
    const orders = [...this.orders.values()];
    return {
      openOrders: orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length,
      activeDrivers: [...this.users.values()].filter((user) => user.role === 'driver').length,
      revenueCents: orders
        .filter((order) => order.status === 'delivered')
        .reduce((total, order) => total + order.totalCents, 0),
      restaurantsOnline: restaurants.filter((restaurant) => restaurant.isOpen).length
    };
  }

  private buildCart(userId: string, items: CartItem[]): Cart {
    const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
    const restaurant = items[0]
      ? restaurants.find((current) => current.id === items[0]?.restaurantId)
      : undefined;
    const deliveryFeeCents = items.length > 0 ? restaurant?.deliveryFeeCents ?? 0 : 0;

    return {
      userId,
      items,
      subtotalCents,
      deliveryFeeCents,
      totalCents: subtotalCents + deliveryFeeCents
    };
  }
}
