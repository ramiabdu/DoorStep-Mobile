import {useEffect, useMemo, useState} from 'react';
import type {CSSProperties} from 'react';
import {ArrowRight, BadgePercent, Clock3, Navigation, ShieldCheck, Sparkles, Truck, Zap} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';

import {FloatingCart} from '../../components/cart/FloatingCart';
import {ActiveOrderPreview} from '../../components/order/ActiveOrderPreview';
import {ProductCard} from '../../components/product/ProductCard';
import {StoreCard} from '../../components/store/StoreCard';
import {Badge, Button, Card, ErrorBanner, LoadingSkeleton, SearchBar} from '../../components/ui';
import {useMarketplace} from '../../hooks/useMarketplace';
import {useAuth} from '../../state/useAuth';
import {useCart} from '../../state/useCart';
import {formatMoney} from '../../utils/format';
import {api} from '../../api/client';
import type {Order} from '../../api/types';

const promises = [
  {label: 'Avg arrival', value: '18-35 min', icon: <Clock3 size={18} />},
  {label: 'Live tracking', value: 'Courier GPS', icon: <Navigation size={18} />},
  {label: 'Protected checkout', value: 'Secure pay', icon: <ShieldCheck size={18} />}
];

export const HomePage = () => {
  const navigate = useNavigate();
  const {token, user} = useAuth();
  const {cart, addItem, refreshCart} = useCart();
  const {categories, stores, products, coupons, isLoading, error} = useMarketplace();
  const [query, setQuery] = useState('');
  const [latestOrder, setLatestOrder] = useState<Order | undefined>();
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!token || user?.role !== 'customer') {
        return;
      }
      const response = await api.orders(token);
      setLatestOrder(response.orders.find((order) => !['delivered', 'cancelled'].includes(order.status)));
    };

    void loadOrders().catch(() => undefined);
  }, [token, user?.role]);

  const filteredStores = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return stores;
    }

    return stores.filter((store) =>
      [store.name, store.cuisine, store.category, store.description, ...store.tags].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [query, stores]);

  const popularRestaurants = filteredStores.filter((store) => store.type === 'restaurant').slice(0, 6);
  const supermarkets = filteredStores.filter((store) => store.type === 'supermarket').slice(0, 4);
  const deals = products.filter((product) => product.discountPercent).slice(0, 5);
  const recommended = products.filter((product) => product.isPopular).slice(0, 6);
  const featuredStore = stores.find((store) => store.isFeatured) ?? stores[0];

  const handleAdd = async (productId: string) => {
    if (!token) {
      navigate('/auth');
      return;
    }

    setAddError(null);
    try {
      await addItem(productId, 1);
    } catch (caughtError) {
      setAddError(caughtError instanceof Error ? caughtError.message : 'Could not add item');
    }
  };

  if (isLoading) {
    return (
      <section className="page-section">
        <LoadingSkeleton rows={6} />
      </section>
    );
  }

  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <Badge tone="dark">
            <Zap size={14} /> 10,000 products delivered across Nicosia
          </Badge>
          <h1>Food, groceries, and daily essentials at your door.</h1>
          <p>
            DoorStep brings restaurants, supermarkets, and convenience stores into one fast,
            polished ordering experience with live tracking and secure checkout.
          </p>
          <SearchBar value={query} onChange={setQuery} />
          <div className="hero-actions">
            <Button onClick={() => navigate('/restaurants')}>
              Browse stores <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/offers')}>
              View offers
            </Button>
          </div>
        </div>

        <div className="hero-panel">
          {featuredStore ? (
            <>
              <img src={featuredStore.coverImageUrl} alt="" />
              <div className="hero-panel-content">
                <span>Featured now</span>
                <h2>{featuredStore.name}</h2>
                <p>{featuredStore.description}</p>
                <div className="hero-panel-row">
                  <strong>{featuredStore.deliveryTimeMinutes} min</strong>
                  <strong>{formatMoney(featuredStore.deliveryFeeCents)} delivery</strong>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="promise-strip">
        {promises.map((promise) => (
          <Card key={promise.label} className="promise-card">
            {promise.icon}
            <span>{promise.label}</span>
            <strong>{promise.value}</strong>
          </Card>
        ))}
        <ActiveOrderPreview order={latestOrder} />
      </section>

      <section className="page-section tight">
        {error ? <ErrorBanner message={error} /> : null}
        {addError ? <ErrorBanner message={addError} /> : null}

        <div className="section-heading-row">
          <div>
            <span className="eyebrow">Explore</span>
            <h2>What are you in the mood for?</h2>
          </div>
          <Link className="text-link" to="/categories">
            All categories <ArrowRight size={15} />
          </Link>
        </div>
        <div className="category-slider">
          {categories.map((category) => (
            <Link className="category-chip" key={category.id} style={{'--chip-color': category.color} as CSSProperties} to={`/categories?category=${category.slug}`}>
              <span>{category.icon.slice(0, 2)}</span>
              <strong>{category.name}</strong>
            </Link>
          ))}
        </div>

        <div className="promo-carousel">
          {coupons.map((coupon) => (
            <Card className="promo-banner" key={coupon.id}>
              <Badge tone="warning">
                <BadgePercent size={14} /> {coupon.code}
              </Badge>
              <h3>{coupon.title}</h3>
              <p>{coupon.description}</p>
              <Button size="sm" variant="dark" onClick={() => navigate('/offers')}>
                Claim offer
              </Button>
            </Card>
          ))}
        </div>

        <div className="section-heading-row">
          <div>
            <span className="eyebrow">Popular restaurants</span>
            <h2>Fast food and coffee near you.</h2>
          </div>
          <Link className="text-link" to="/restaurants">
            See all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="store-grid">
          {popularRestaurants.map((store) => (
            <StoreCard featured={store.isFeatured} key={store.id} store={store} />
          ))}
        </div>

        <div className="section-heading-row">
          <div>
            <span className="eyebrow">Nearby supermarkets</span>
            <h2>Fresh groceries without the queue.</h2>
          </div>
          <Link className="text-link" to="/supermarkets">
            Shop groceries <ArrowRight size={15} />
          </Link>
        </div>
        <div className="store-grid compact">
          {supermarkets.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>

        <div className="section-heading-row">
          <div>
            <span className="eyebrow">Flash deals</span>
            <h2>High intent products with real offers.</h2>
          </div>
          <Truck size={22} />
        </div>
        <div className="product-row">
          {deals.map((product) => (
            <ProductCard compact key={product.id} onAdd={handleAdd} product={product} />
          ))}
        </div>

        <div className="section-heading-row">
          <div>
            <span className="eyebrow">Recommended</span>
            <h2>Popular picks from top-rated stores.</h2>
          </div>
          <Sparkles size={22} />
        </div>
        <div className="product-grid">
          {recommended.map((product) => (
            <ProductCard key={product.id} onAdd={handleAdd} product={product} />
          ))}
        </div>
      </section>

      <FloatingCart cart={cart} />
    </>
  );
};
