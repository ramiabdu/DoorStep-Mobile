export type UserRole = 'customer' | 'driver' | 'admin';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTimeMinutes: number;
  deliveryFeeCents: number;
  heroImageUrl: string;
  isOpen: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  customerId: string;
  driverId: string | null;
  restaurantId: string;
  restaurantName: string;
  status: OrderStatus;
  deliveryAddress: string;
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminOverview {
  openOrders: number;
  activeDrivers: number;
  revenueCents: number;
  restaurantsOnline: number;
}

