import type {
  AdminOverview,
  AuthResponse,
  Cart,
  MenuItem,
  Order,
  OrderStatus,
  Restaurant,
  User,
  UserRole
} from './types';

const API_URL = import.meta.env.VITE_DOORSTEP_API_URL ?? 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

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

  async adminOverview(token: string): Promise<{overview: AdminOverview}> {
    return this.request('/api/admin/overview', {token});
  }

  async assignableOrders(token: string): Promise<{orders: Order[]}> {
    return this.request('/api/admin/orders', {token});
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
