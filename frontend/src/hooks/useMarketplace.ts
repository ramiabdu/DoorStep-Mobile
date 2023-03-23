import {useEffect, useMemo, useState} from 'react';

import {api} from '../api/client';
import type {Category, Coupon, Product, Store} from '../api/types';
import {marketplaceCategories, marketplaceCoupons, marketplaceProducts, marketplaceStores} from '../data/marketplace';

interface MarketplaceState {
  categories: Category[];
  stores: Store[];
  products: Product[];
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
}

const mergeById = <T extends {id: string}>(fallbackItems: T[], apiItems: T[]) =>
  [...new Map([...fallbackItems, ...apiItems].map((item) => [item.id, item])).values()];

export const useMarketplace = () => {
  const [state, setState] = useState<MarketplaceState>({
    categories: marketplaceCategories,
    stores: marketplaceStores,
    products: marketplaceProducts,
    coupons: marketplaceCoupons,
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
            categories: mergeById(marketplaceCategories, categoryResponse.categories),
            stores: mergeById(marketplaceStores, storeResponse.stores),
            products: mergeById(marketplaceProducts, productResponse.products),
            coupons: mergeById(marketplaceCoupons, couponResponse.coupons),
            isLoading: false,
            error: null
          });
        }
      } catch {
        if (isMounted) {
          setState({
            categories: marketplaceCategories,
            stores: marketplaceStores,
            products: marketplaceProducts,
            coupons: marketplaceCoupons,
            isLoading: false,
            error: null
          });
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
