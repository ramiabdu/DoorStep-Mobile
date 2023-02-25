import {createContext} from 'react';

import type {Cart} from '../api/types';

export interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (menuItemId: string, quantity?: number) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

