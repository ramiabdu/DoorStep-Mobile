import {useMemo, useState} from 'react';
import {Filter, SlidersHorizontal, Store as StoreIcon} from 'lucide-react';

import type {StoreType} from '../../api/types';
import {FloatingCart} from '../../components/cart/FloatingCart';
import {StoreCard} from '../../components/store/StoreCard';
import {Badge, EmptyState, LoadingSkeleton, SearchBar, Select} from '../../components/ui';
import {useMarketplace} from '../../hooks/useMarketplace';
import {useCart} from '../../state/useCart';

export const StoreListingPage = ({type}: {type?: StoreType}) => {
  const {stores, isLoading, error} = useMarketplace();
  const {cart} = useCart();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recommended');

  const title =
    type === 'restaurant'
      ? 'Restaurants'
      : type === 'supermarket'
        ? 'Supermarkets'
        : 'Stores and essentials';

  const filteredStores = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const scoped = stores.filter((store) => (type ? store.type === type : true));
    const filtered = normalized
      ? scoped.filter((store) =>
          [store.name, store.cuisine, store.category, store.description, ...store.tags].some((value) =>
            value.toLowerCase().includes(normalized)
          )
        )
      : scoped;

    return [...filtered].sort((a, b) => {
      if (sort === 'fastest') {
        return a.deliveryTimeMinutes - b.deliveryTimeMinutes;
      }
      if (sort === 'rating') {
        return b.rating - a.rating;
      }
      if (sort === 'fee') {
        return a.deliveryFeeCents - b.deliveryFeeCents;
      }
      return Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating;
    });
  }, [query, sort, stores, type]);

  if (isLoading) {
    return (
      <section className="page-section">
        <LoadingSkeleton rows={6} />
      </section>
    );
  }

  return (
    <>
      <section className="listing-hero">
        <div>
          <Badge tone="primary">
            <StoreIcon size={14} /> DoorStep marketplace
          </Badge>
          <h1>{title} near Berlin Mitte.</h1>
          <p>Curated partners with live availability, transparent fees, and high-quality catalog data.</p>
        </div>
        <div className="listing-toolbar">
          <SearchBar value={query} onChange={setQuery} />
          <div className="filter-row">
            <Badge tone="neutral">
              <Filter size={14} /> {filteredStores.length} results
            </Badge>
            <Select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="fastest">Fastest</option>
              <option value="rating">Top rated</option>
              <option value="fee">Lowest fee</option>
            </Select>
          </div>
        </div>
      </section>

      <section className="page-section tight">
        {error ? <EmptyState title="Stores unavailable" body={error} /> : null}
        {!error && filteredStores.length === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal size={24} />}
            title="No matching stores"
            body="Try a different cuisine, product, or delivery preference."
          />
        ) : null}
        <div className="store-grid">
          {filteredStores.map((store) => (
            <StoreCard featured={store.isFeatured} key={store.id} store={store} />
          ))}
        </div>
      </section>

      <FloatingCart cart={cart} />
    </>
  );
};
