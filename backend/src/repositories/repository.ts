import type {
  Address,
  AdminOverview,
  AnalyticsOverview,
  Cart,
  Category,
  Coupon,
  MenuItem,
  Notification,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductFilters,
  Restaurant,
  Review,
  Store,
  StoreFilters,
  StoredUser,
  User,
  UserRole
} from '../types/domain.js';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface CreateAddressInput {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface CreateReviewInput {
  storeId: string;
  userId: string;
  rating: number;
  body: string;
}

export interface DoorstepRepository {
  createUser(input: CreateUserInput): Promise<User>;
  findUserByEmail(email: string): Promise<StoredUser | null>;
  findUserById(id: string): Promise<User | null>;
  listUsers(): Promise<User[]>;
  listCategories(): Promise<Category[]>;
  listStores(filters?: StoreFilters): Promise<Store[]>;
  getStore(idOrSlug: string): Promise<Store | null>;
  listProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  listRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | null>;
  listMenuItems(restaurantId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | null>;
  getCart(userId: string): Promise<Cart>;
  addCartItem(userId: string, menuItemId: string, quantity: number): Promise<Cart>;
  updateCartItem(userId: string, cartItemId: string, quantity: number): Promise<Cart>;
  clearCart(userId: string): Promise<void>;
  createOrderFromCart(userId: string, deliveryAddress: string): Promise<Order>;
  listOrdersForUser(userId: string): Promise<Order[]>;
  listOrdersForDriver(driverId: string): Promise<Order[]>;
  listAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  listAssignableOrders(): Promise<Order[]>;
  assignOrder(orderId: string, driverId: string): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  listAddresses(userId: string): Promise<Address[]>;
  createAddress(userId: string, input: CreateAddressInput): Promise<Address>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  listPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  listNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(userId: string, notificationId: string): Promise<Notification>;
  listCoupons(): Promise<Coupon[]>;
  listReviews(storeId: string): Promise<Review[]>;
  createReview(input: CreateReviewInput): Promise<Review>;
  adminOverview(): Promise<AdminOverview>;
  analyticsOverview(): Promise<AnalyticsOverview>;
}
