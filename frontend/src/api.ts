const DEFAULT_API_URL = 'https://doorstep-mobile.onrender.com';

export const API_BASE_URL =
  import.meta.env.VITE_DOORSTEP_API_URL || DEFAULT_API_URL;

type RequestOptions = {
  body?: unknown;
  method?: 'GET' | 'POST';
  token?: string | null;
};

export type ApiHealth = {
  service: string;
  status: string;
  timestamp: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  etaMinutes: number;
  serviceFee?: number;
  accent?: string;
};

export type Partner = {
  id: string;
  name: string;
  categoryId: string;
  rating: number;
  deliveryMinutes: number;
  open: boolean;
  distanceKm: number;
};

export type CatalogHome = {
  categories: Category[];
  partners: Partner[];
  deliveryWindows: string[];
  operations?: {
    activeCities: number;
    onTimeRate: number;
    avgHandoffMinutes: number;
  };
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  defaultAddress: string;
  verifiedAt: string | null;
};

export type AuthResponse = {
  token?: string;
  user: AuthUser;
  verificationId?: string;
  requiresVerification?: boolean;
  debug?: {
    otp: string;
    expiresAt: string;
  };
};

export type ApiDocs = {
  service: string;
  version: string;
  baseUrl: string;
  endpoints: Array<{
    method: string;
    path: string;
    auth: boolean;
    description: string;
  }>;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as T & {
    error?: {message?: string};
  };

  if (!response.ok) {
    throw new Error(payload.error?.message || 'DoorStep API request failed');
  }

  return payload;
};

const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.token ? {Authorization: `Bearer ${options.token}`} : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return parseResponse<T>(response);
};

export const doorstepApi = {
  docs: () => request<ApiDocs>('/docs'),
  health: () => request<ApiHealth>('/health'),
  home: () => request<CatalogHome>('/catalog/home'),
  login: (body: {email: string; password: string}) =>
    request<AuthResponse>('/auth/login', {method: 'POST', body}),
  register: (body: {
    name: string;
    email: string;
    phone: string;
    password: string;
    defaultAddress: string;
  }) => request<AuthResponse>('/auth/register', {method: 'POST', body}),
  verifyOtp: (body: {verificationId: string; code: string}) =>
    request<AuthResponse>('/auth/verify-otp', {method: 'POST', body}),
};
