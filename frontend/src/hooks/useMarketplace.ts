import {useEffect, useMemo, useState} from 'react';

import {api} from '../api/client';
import type {Category, Coupon, Product, Store} from '../api/types';

interface MarketplaceState {
  categories: Category[];
  stores: Store[];
  products: Product[];
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
}

export const useMarketplace = () => {
  const [state, setState] = useState<MarketplaceState>({
    categories: [],
    stores: [],
    products: [],
    coupons: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [categoryResponse, storeResponse, productResponse, couponResponse] = await Promise.all([
          api.categories(),
          api.stores(),
          api.products(),
          api.coupons()
        ]);

        if (isMounted) {
          setState({
            categories: categoryResponse.categories,
            stores: storeResponse.stores,
            products: productResponse.products,
            coupons: couponResponse.coupons,
            isLoading: false,
            error: null
          });
        }
      } catch (caughtError) {
        if (isMounted) {
          setState((current) => ({
            ...current,
            isLoading: false,
            error: caughtError instanceof Error ? caughtError.message : 'Marketplace failed to load'
          }));
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return useMemo(() => state, [state]);
};
