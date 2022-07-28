import type {
  AdminOverview,
  Cart,
  MenuItem,
  Order,
  OrderStatus,
  Restaurant,
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

export interface DoorstepRepository {
  createUser(input: CreateUserInput): Promise<User>;
  findUserByEmail(email: string): Promise<StoredUser | null>;
  findUserById(id: string): Promise<User | null>;
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
  getOrder(id: string): Promise<Order | null>;
  listAssignableOrders(): Promise<Order[]>;
  assignOrder(orderId: string, driverId: string): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  adminOverview(): Promise<AdminOverview>;
}

