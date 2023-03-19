import type {
  Address,
  AdminOverview,
  AnalyticsOverview,
  AuthResponse,
  Cart,
  Category,
  Coupon,
  MenuItem,
  Notification,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  Restaurant,
  Review,
  Store,
  StoreType,
  User,
  UserRole
} from './types';

const API_URL = import.meta.env.VITE_DOORSTEP_API_URL ?? 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

interface StoreQuery {
  type?: StoreType;
  q?: string;
  category?: string;
  featured?: boolean;
}

interface ProductQuery {
  storeId?: string;
  categoryId?: string;
  q?: string;
  deal?: boolean;
  popular?: boolean;
}

const toQueryString = (params: Array<[string, string | boolean | undefined]>) => {
  const query = new URLSearchParams();
  params.forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : '';
};

class ApiClient {
  constructor(private readonly baseUrl: string) {}

  get apiUrl() {
    return this.baseUrl;
  }

  async health(): Promise<{status: string; service: string; timestamp: string}> {
    return this.request('/health');
  }

  async signup(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<AuthResponse> {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async login(input: {email: string; password: string}): Promise<AuthResponse> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async me(token: string): Promise<{user: User}> {
    return this.request('/api/auth/me', {token});
  }

  async categories(): Promise<{categories: Category[]}> {
    return this.request('/api/categories');
  }

  async stores(query: StoreQuery = {}): Promise<{stores: Store[]}> {
    return this.request(
      `/api/stores${toQueryString([
        ['type', query.type],
        ['q', query.q],
        ['category', query.category],
        ['featured', query.featured]
      ])}`
    );
  }

  async store(id: string): Promise<{store: Store; products: Product[]; reviews: Review[]}> {
    return this.request(`/api/stores/${id}`);
  }

  async products(query: ProductQuery = {}): Promise<{products: Product[]}> {
    return this.request(
      `/api/products${toQueryString([
        ['storeId', query.storeId],
        ['categoryId', query.categoryId],
        ['q', query.q],
        ['deal', query.deal],
        ['popular', query.popular]
      ])}`
    );
  }

  async product(id: string): Promise<{product: Product}> {
    return this.request(`/api/products/${id}`);
  }

  async restaurants(): Promise<{restaurants: Restaurant[]}> {
    return this.request('/api/restaurants');
  }

  async restaurant(id: string): Promise<{restaurant: Restaurant; menuItems: MenuItem[]}> {
    return this.request(`/api/restaurants/${id}`);
  }

  async cart(token: string): Promise<{cart: Cart}> {
    return this.request('/api/cart', {token});
  }

  async addCartItem(token: string, menuItemId: string, quantity: number): Promise<{cart: Cart}> {
    return this.request('/api/cart/items', {
      method: 'POST',
      token,
      body: JSON.stringify({menuItemId, quantity})
    });
  }

  async updateCartItem(token: string, itemId: string, quantity: number): Promise<{cart: Cart}> {
    return this.request(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({quantity})
    });
  }

  async clearCart(token: string): Promise<void> {
    return this.request('/api/cart', {method: 'DELETE', token});
  }

  async checkout(token: string, deliveryAddress: string): Promise<{order: Order}> {
    return this.request('/api/orders', {
      method: 'POST',
      token,
      body: JSON.stringify({deliveryAddress})
    });
  }

  async orders(token: string): Promise<{orders: Order[]}> {
    return this.request('/api/orders', {token});
  }

  async order(token: string, orderId: string): Promise<{order: Order}> {
    return this.request(`/api/orders/${orderId}`, {token});
  }

  async addresses(token: string): Promise<{addresses: Address[]}> {
    return this.request('/api/addresses', {token});
  }

  async payments(token: string): Promise<{payments: PaymentMethod[]}> {
    return this.request('/api/payments', {token});
  }

  async notifications(token: string): Promise<{notifications: Notification[]}> {
    return this.request('/api/notifications', {token});
  }

  async markNotificationRead(token: string, notificationId: string): Promise<{notification: Notification}> {
    return this.request(`/api/notifications/${notificationId}/read`, {method: 'PATCH', token});
  }

  async coupons(): Promise<{coupons: Coupon[]}> {
    return this.request('/api/coupons');
  }

  async adminOverview(token: string): Promise<{overview: AdminOverview}> {
    return this.request('/api/admin/overview', {token});
  }

  async assignableOrders(token: string): Promise<{orders: Order[]}> {
    return this.request('/api/admin/orders', {token});
  }

  async adminOrders(token: string): Promise<{orders: Order[]}> {
    return this.request('/api/admin/orders/all', {token});
  }

  async adminStores(token: string): Promise<{stores: Store[]}> {
    return this.request('/api/admin/stores', {token});
  }

  async adminProducts(token: string): Promise<{products: Product[]}> {
    return this.request('/api/admin/products', {token});
  }

  async adminUsers(token: string): Promise<{users: User[]}> {
    return this.request('/api/admin/users', {token});
  }

  async analytics(token: string): Promise<{analytics: AnalyticsOverview}> {
    return this.request('/api/admin/analytics', {token});
  }

  async assignOrder(token: string, orderId: string, driverId: string): Promise<{order: Order}> {
    return this.request(`/api/admin/orders/${orderId}/assign`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({driverId})
    });
  }

  async driverOrders(token: string): Promise<{orders: Order[]}> {
    return this.request('/api/driver/orders', {token});
  }

  async updateOrderStatus(
    token: string,
    orderId: string,
    status: Exclude<OrderStatus, 'placed' | 'assigned'>
  ): Promise<{order: Order}> {
    return this.request(`/api/driver/orders/${orderId}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({status})
    });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (options.token) {
      headers.set('Authorization', `Bearer ${options.token}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | {error?: {message?: string}}
        | null;
      throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}

export const api = new ApiClient(API_URL);
export {API_URL};
