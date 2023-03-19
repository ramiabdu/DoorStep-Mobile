export type UserRole = 'customer' | 'driver' | 'admin';

export type StoreType = 'restaurant' | 'supermarket' | 'convenience';

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
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  type: StoreType | 'all';
  description: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  type: StoreType;
  cuisine: string;
  category: string;
  description: string;
  logoUrl: string;
  heroImageUrl: string;
  coverImageUrl: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMinutes: number;
  deliveryFeeCents: number;
  minimumOrderCents: number;
  distanceKm: number;
  priceLevel: '$' | '$$' | '$$$';
  tags: string[];
  isFeatured: boolean;
  isOpen: boolean;
  createdAt?: string;
}

export type Restaurant = Store;

export interface Product {
  id: string;
  storeId: string;
  restaurantId: string;
  categoryId: string;
  category: string;
  name: string;
  description: string;
  priceCents: number;
  originalPriceCents?: number;
  discountPercent?: number;
  imageUrl: string;
  calories?: number;
  weight?: string;
  rating: number;
  isAvailable: boolean;
  isPopular: boolean;
}

export type MenuItem = Product;

export interface CartItem {
  id: string;
  menuItemId: string;
  productId: string;
  restaurantId: string;
  storeId: string;
  restaurantName: string;
  storeName: string;
  name: string;
  imageUrl?: string;
  priceCents: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  serviceFeeCents: number;
  discountCents: number;
  totalCents: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  customerId: string;
  driverId: string | null;
  restaurantId: string;
  storeId: string;
  restaurantName: string;
  storeName: string;
  status: OrderStatus;
  deliveryAddress: string;
  subtotalCents: number;
  deliveryFeeCents: number;
  serviceFeeCents: number;
  discountCents: number;
  totalCents: number;
  etaMinutes: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  instructions?: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  minimumOrderCents: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order' | 'offer' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  brand: 'Visa' | 'Mastercard' | 'Apple Pay' | 'PayPal';
  last4: string;
  label: string;
  isDefault: boolean;
}

export interface AdminOverview {
  openOrders: number;
  activeDrivers: number;
  revenueCents: number;
  restaurantsOnline: number;
  storesOnline: number;
  customers: number;
  products: number;
  conversionRate: number;
  averageOrderValueCents: number;
}

export interface AnalyticsOverview {
  revenueCents: number;
  orders: number;
  averageOrderValueCents: number;
  activeCustomers: number;
  repeatPurchaseRate: number;
  fulfillmentRate: number;
  topStores: Array<{storeId: string; name: string; revenueCents: number; orders: number}>;
  orderVolume: Array<{day: string; orders: number; revenueCents: number}>;
}

export interface StoreFilters {
  type?: StoreType;
  query?: string;
  category?: string;
  featured?: boolean;
}

export interface ProductFilters {
  storeId?: string;
  categoryId?: string;
  query?: string;
  deal?: boolean;
  popular?: boolean;
}
