import {useEffect, useMemo, useState} from 'react';
import {ArrowLeft, Clock, Heart, MapPin, MessageCircle, ShoppingBag, Star} from 'lucide-react';
import {Link, useNavigate, useParams} from 'react-router-dom';

import {api} from '../../api/client';
import type {Product, Review, Store} from '../../api/types';
import {FloatingCart} from '../../components/cart/FloatingCart';
import {ProductCard} from '../../components/product/ProductCard';
import {Badge, Button, Card, EmptyState, ErrorBanner, LoadingSkeleton, RatingStars, SearchBar} from '../../components/ui';
import {marketplaceProducts, marketplaceReviews, marketplaceStores} from '../../data/marketplace';
import {useAuth} from '../../state/useAuth';
import {useCart} from '../../state/useCart';
import {formatMoney} from '../../utils/format';

const mergeProducts = (fallbackProducts: Product[], apiProducts: Product[]) =>
  [...new Map([...fallbackProducts, ...apiProducts].map((product) => [product.id, product])).values()];

export const StoreDetailsPage = () => {
  const {storeId} = useParams();
  const navigate = useNavigate();
  const {token} = useAuth();
  const {cart, addItem, refreshCart} = useCart();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!storeId) {
        return;
      }

      try {
        const fallbackStore = marketplaceStores.find((item) => item.id === storeId || item.slug === storeId);
        const fallbackStoreProducts = marketplaceProducts.filter((product) => product.storeId === fallbackStore?.id);
        const response = await api.store(storeId);
        setStore(response.store);
        setProducts(mergeProducts(fallbackStoreProducts, response.products));
        setReviews(response.reviews.length > 0 ? response.reviews : marketplaceReviews.filter((review) => review.storeId === response.store.id));
        await refreshCart();
      } catch {
        const fallbackStore = marketplaceStores.find((item) => item.id === storeId || item.slug === storeId);
        if (fallbackStore) {
          setStore(fallbackStore);
          setProducts(marketplaceProducts.filter((product) => product.storeId === fallbackStore.id));
          setReviews(marketplaceReviews.filter((review) => review.storeId === fallbackStore.id));
          setError(null);
        } else {
          setError('Store failed to load');
        }
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [refreshCart, storeId]);

  const categories = useMemo(() => ['all', ...new Set(products.map((product) => product.category))], [products]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesQuery =
        !normalized ||
        [product.name, product.description, product.category].some((value) => value.toLowerCase().includes(normalized));
      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

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

  if (error || !store) {
    return <EmptyState title="Store unavailable" body={error ?? 'Store was not found'} />;
  }

  return (
    <>
      <section className="store-detail-hero">
        <img src={store.coverImageUrl} alt="" />
        <div className="store-detail-overlay">
          <Link className="back-link" to="/restaurants">
            <ArrowLeft size={16} /> Back to stores
          </Link>
          <div className="store-detail-copy">
            <div className="store-detail-logo">
              <img src={store.logoUrl} alt={`${store.name} logo`} />
            </div>
            <Badge tone={store.isOpen ? 'success' : 'danger'}>{store.isOpen ? 'Open now' : 'Closed'}</Badge>
            <h1>{store.name}</h1>
            <p>{store.description}</p>
            <div className="hero-stats">
              <span>
                <Star size={16} /> {store.rating.toFixed(1)} rating
              </span>
              <span>
                <Clock size={16} /> {store.deliveryTimeMinutes} min
              </span>
              <span>
                <MapPin size={16} /> {store.distanceKm.toFixed(1)} km
              </span>
              <span>{formatMoney(store.minimumOrderCents)} minimum</span>
            </div>
          </div>
          <Button variant="secondary">
            <Heart size={16} /> Save
          </Button>
        </div>
      </section>

      <section className="page-section tight">
        {addError ? <ErrorBanner message={addError} /> : null}
        <div className="store-detail-layout">
          <aside className="store-side-panel">
            <Card>
              <h3>Delivery promise</h3>
              <div className="side-list">
                <span>
                  <Clock size={15} /> {store.deliveryTimeMinutes} min estimated arrival
                </span>
                <span>
                  <ShoppingBag size={15} /> {formatMoney(store.deliveryFeeCents)} delivery fee
                </span>
                <span>
                  <MessageCircle size={15} /> Support available during delivery
                </span>
              </div>
            </Card>
            <Card>
              <h3>Recent reviews</h3>
              {reviews.length > 0 ? (
                reviews.slice(0, 2).map((review) => (
                  <div className="review-row" key={review.id}>
                    <RatingStars rating={review.rating} />
                    <strong>{review.userName}</strong>
                    <p>{review.body}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </Card>
          </aside>

          <div className="store-menu-panel">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">{store.category}</span>
                <h2>Menu and catalog</h2>
              </div>
              <SearchBar value={query} onChange={setQuery} placeholder={`Search ${store.name}`} />
            </div>
            <div className="tab-row">
              {categories.map((item) => (
                <button className={category === item ? 'active' : ''} key={item} type="button" onClick={() => setCategory(item)}>
                  {item === 'all' ? 'All' : item}
                </button>
              ))}
            </div>
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} onAdd={handleAdd} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <FloatingCart cart={cart} />
    </>
  );
};
