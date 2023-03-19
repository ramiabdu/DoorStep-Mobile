import bcrypt from 'bcryptjs';
import {randomUUID} from 'node:crypto';

import {categories, coupons, demoAddresses, demoNotifications, demoPayments, products, reviews, stores} from '../shared/marketplaceData.js';
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

const now = () => new Date().toISOString();

const toPublicUser = (user: StoredUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt
});

const matchesText = (value: string, query?: string) =>
  !query || value.toLowerCase().includes(query.toLowerCase());

export class MemoryRepository implements DoorstepRepository {
  private readonly users = new Map<string, StoredUser>();
  private readonly carts = new Map<string, CartItem[]>();
  private readonly orders = new Map<string, Order>();
  private readonly addresses = new Map<string, Address[]>();
  private readonly payments = new Map<string, PaymentMethod[]>();
  private readonly notifications = new Map<string, Notification[]>();
  private readonly reviewList: Review[] = [...reviews];

  constructor() {
    const createdAt = now();
    const passwordHash = bcrypt.hashSync('Doorstep123!', 10);

    [
      {
        id: 'user-admin',
        name: 'Ava Admin',
        email: 'admin@doorstep.dev',
        role: 'admin' as const,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'
      },
      {
        id: 'user-driver',
        name: 'Drew Driver',
        email: 'driver@doorstep.dev',
        role: 'driver' as const,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
      },
      {
        id: 'user-customer',
        name: 'Casey Customer',
        email: 'customer@doorstep.dev',
        role: 'customer' as const,
        phone: '+49 30 5550 1144',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
      }
    ].forEach((user) => {
      this.users.set(user.id, {
        ...user,
        passwordHash,
        createdAt
      });
    });

    this.addresses.set('user-customer', [...demoAddresses]);
    this.payments.set('user-customer', [...demoPayments]);
    this.notifications.set('user-customer', [...demoNotifications]);
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
    this.addresses.set(user.id, []);
    this.notifications.set(user.id, [
      {
        id: randomUUID(),
        userId: user.id,
        title: 'Welcome to DoorStep',
        body: 'Your account is ready for restaurant and grocery delivery.',
        type: 'system',
        isRead: false,
        createdAt: now()
      }
    ]);
    return toPublicUser(user);
  }

  async findUserByEmail(email: string): Promise<StoredUser | null> {
    return [...this.users.values()].find((user) => user.email === email.toLowerCase()) ?? null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? toPublicUser(user) : null;
  }

  async listUsers(): Promise<User[]> {
    return [...this.users.values()].map(toPublicUser).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listCategories(): Promise<Category[]> {
    return categories;
  }

  async listStores(filters: StoreFilters = {}): Promise<Store[]> {
    return stores
      .filter((store) => (filters.type ? store.type === filters.type : true))
      .filter((store) => (filters.featured === undefined ? true : store.isFeatured === filters.featured))
      .filter((store) => (filters.category ? store.category.toLowerCase() === filters.category.toLowerCase() : true))
      .filter((store) =>
        filters.query
          ? [store.name, store.cuisine, store.category, store.description, ...store.tags].some((value) =>
              matchesText(value, filters.query)
            )
          : true
      )
      .sort((a, b) => Number(b.isOpen) - Number(a.isOpen) || Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating);
  }

  async getStore(idOrSlug: string): Promise<Store | null> {
    return stores.find((store) => store.id === idOrSlug || store.slug === idOrSlug) ?? null;
  }

  async listProducts(filters: ProductFilters = {}): Promise<Product[]> {
    return products
      .filter((product) => (filters.storeId ? product.storeId === filters.storeId : true))
      .filter((product) => (filters.categoryId ? product.categoryId === filters.categoryId : true))
      .filter((product) => (filters.deal ? Boolean(product.discountPercent) : true))
      .filter((product) => (filters.popular ? product.isPopular : true))
      .filter((product) =>
        filters.query
          ? [product.name, product.description, product.category].some((value) => matchesText(value, filters.query))
          : true
      )
      .sort((a, b) => Number(b.isPopular) - Number(a.isPopular) || b.rating - a.rating);
  }

  async getProduct(id: string): Promise<Product | null> {
    return products.find((product) => product.id === id) ?? null;
  }

  async listRestaurants(): Promise<Restaurant[]> {
    return this.listStores({type: 'restaurant'});
  }

  async getRestaurant(id: string): Promise<Restaurant | null> {
    const store = await this.getStore(id);
    return store?.type === 'restaurant' ? store : store ?? null;
  }

  async listMenuItems(restaurantId: string): Promise<MenuItem[]> {
    return this.listProducts({storeId: restaurantId});
  }

  async getMenuItem(id: string): Promise<MenuItem | null> {
    return this.getProduct(id);
  }

  async getCart(userId: string): Promise<Cart> {
    const items = this.carts.get(userId) ?? [];
    return this.buildCart(userId, items);
  }

  async addCartItem(userId: string, menuItemId: string, quantity: number): Promise<Cart> {
    const product = await this.getProduct(menuItemId);
    if (!product || !product.isAvailable) {
      throw notFound('Product is not available');
    }

    const store = await this.getStore(product.storeId);
    if (!store || !store.isOpen) {
      throw badRequest('Store is currently closed');
    }

    const items = this.carts.get(userId) ?? [];
    const cartStoreIds = new Set(items.map((item) => item.storeId));
    if (cartStoreIds.size > 0 && !cartStoreIds.has(store.id)) {
      throw badRequest('Cart can only contain items from one store per order');
    }

    const existing = items.find((item) => item.productId === menuItemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: randomUUID(),
        menuItemId,
        productId: menuItemId,
        restaurantId: store.id,
        storeId: store.id,
        restaurantName: store.name,
        storeName: store.name,
        name: product.name,
        imageUrl: product.imageUrl,
        priceCents: product.priceCents,
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

    const storeIds = new Set(cart.items.map((item) => item.storeId));
    if (storeIds.size > 1) {
      throw badRequest('Cart can only contain items from one store per order');
    }

    const firstItem = cart.items[0];
    const store = await this.getStore(firstItem.storeId);
    const orderItems: OrderItem[] = cart.items.map((item) => ({
      id: randomUUID(),
      menuItemId: item.menuItemId,
      productId: item.productId,
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
      storeId: firstItem.storeId,
      restaurantName: firstItem.restaurantName,
      storeName: firstItem.storeName,
      status: 'placed',
      deliveryAddress,
      subtotalCents: cart.subtotalCents,
      deliveryFeeCents: cart.deliveryFeeCents,
      serviceFeeCents: cart.serviceFeeCents,
      discountCents: cart.discountCents,
      totalCents: cart.totalCents,
      etaMinutes: store?.deliveryTimeMinutes ?? 28,
      items: orderItems,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.orders.set(order.id, order);
    await this.clearCart(userId);
    return order;
  }

  async listOrdersForUser(userId: string): Promise<Order[]> {
    return [...this.orders.values()]
      .filter((order) => order.customerId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listOrdersForDriver(driverId: string): Promise<Order[]> {
    return [...this.orders.values()]
      .filter((order) => order.driverId === driverId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listAllOrders(): Promise<Order[]> {
    return [...this.orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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

  async listAddresses(userId: string): Promise<Address[]> {
    return this.addresses.get(userId) ?? [];
  }

  async createAddress(userId: string, input: CreateAddressInput): Promise<Address> {
    const current = this.addresses.get(userId) ?? [];
    const address: Address = {
      id: randomUUID(),
      userId,
      label: input.label,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      postalCode: input.postalCode,
      instructions: input.instructions,
      isDefault: input.isDefault ?? current.length === 0
    };
    const next = address.isDefault ? current.map((item) => ({...item, isDefault: false})) : current;
    this.addresses.set(userId, [...next, address]);
    return address;
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    this.addresses.set(
      userId,
      (this.addresses.get(userId) ?? []).filter((address) => address.id !== addressId)
    );
  }

  async listPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return this.payments.get(userId) ?? [];
  }

  async listNotifications(userId: string): Promise<Notification[]> {
    return this.notifications.get(userId) ?? [];
  }

  async markNotificationRead(userId: string, notificationId: string): Promise<Notification> {
    const current = this.notifications.get(userId) ?? [];
    const notification = current.find((item) => item.id === notificationId);
    if (!notification) {
      throw notFound('Notification not found');
    }

    const updated = {...notification, isRead: true};
    this.notifications.set(
      userId,
      current.map((item) => (item.id === notificationId ? updated : item))
    );
    return updated;
  }

  async listCoupons(): Promise<Coupon[]> {
    return coupons.filter((coupon) => coupon.isActive);
  }

  async listReviews(storeId: string): Promise<Review[]> {
    return this.reviewList.filter((review) => review.storeId === storeId);
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    const user = await this.findUserById(input.userId);
    const review: Review = {
      id: randomUUID(),
      storeId: input.storeId,
      userId: input.userId,
      userName: user?.name ?? 'DoorStep customer',
      rating: input.rating,
      body: input.body,
      createdAt: now()
    };
    this.reviewList.unshift(review);
    return review;
  }

  async adminOverview(): Promise<AdminOverview> {
    const orderList = [...this.orders.values()];
    const delivered = orderList.filter((order) => order.status === 'delivered');
    const revenueCents = delivered.reduce((total, order) => total + order.totalCents, 0);
    const averageOrderValueCents = delivered.length > 0 ? Math.round(revenueCents / delivered.length) : 0;

    return {
      openOrders: orderList.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length,
      activeDrivers: [...this.users.values()].filter((user) => user.role === 'driver').length,
      revenueCents,
      restaurantsOnline: stores.filter((store) => store.type === 'restaurant' && store.isOpen).length,
      storesOnline: stores.filter((store) => store.isOpen).length,
      customers: [...this.users.values()].filter((user) => user.role === 'customer').length,
      products: products.length,
      conversionRate: 8.7,
      averageOrderValueCents
    };
  }

  async analyticsOverview(): Promise<AnalyticsOverview> {
    const orderList = [...this.orders.values()];
    const revenueCents = orderList.reduce((total, order) => total + order.totalCents, 0);
    return {
      revenueCents,
      orders: orderList.length,
      averageOrderValueCents: orderList.length > 0 ? Math.round(revenueCents / orderList.length) : 2260,
      activeCustomers: [...this.users.values()].filter((user) => user.role === 'customer').length,
      repeatPurchaseRate: 41,
      fulfillmentRate: 97,
      topStores: stores.slice(0, 5).map((store, index) => ({
        storeId: store.id,
        name: store.name,
        revenueCents: 184000 - index * 21250,
        orders: 128 - index * 13
      })),
      orderVolume: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
        day,
        orders: 34 + index * 7,
        revenueCents: 62000 + index * 9800
      }))
    };
  }

  private buildCart(userId: string, items: CartItem[]): Cart {
    const subtotalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);
    const store = items[0] ? stores.find((current) => current.id === items[0]?.storeId) : undefined;
    const deliveryFeeCents = items.length > 0 ? store?.deliveryFeeCents ?? 0 : 0;
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
}
