import {useCallback, useMemo, useState} from 'react';
import type {ReactNode} from 'react';

import {api} from '../api/client';
import type {Cart} from '../api/types';
import {CartContext} from './cartContext';
import {useAuth} from './useAuth';

export const CartProvider = ({children}: {children: ReactNode}) => {
  const {token, user} = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!token || user?.role !== 'customer') {
      setCart(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.cart(token);
      setCart(response.cart);
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.role]);

  const addItem = useCallback(
    async (menuItemId: string, quantity = 1) => {
      if (!token) {
        throw new Error('Please sign in before adding items to the cart.');
      }

      const response = await api.addCartItem(token, menuItemId, quantity);
      setCart(response.cart);
    },
    [token]
  );

  const updateItem = useCallback(
    async (cartItemId: string, quantity: number) => {
      if (!token) {
        throw new Error('Please sign in before updating the cart.');
      }

      const response = await api.updateCartItem(token, cartItemId, quantity);
      setCart(response.cart);
    },
    [token]
  );

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      refreshCart,
      addItem,
      updateItem
    }),
    [addItem, cart, isLoading, refreshCart, updateItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
