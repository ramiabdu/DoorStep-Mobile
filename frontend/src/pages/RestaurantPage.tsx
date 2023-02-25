import {useEffect, useState} from 'react';
import {Minus, Plus, ShoppingBag} from 'lucide-react';
import {Link, useParams} from 'react-router-dom';

import {api} from '../api/client';
import type {MenuItem, Restaurant} from '../api/types';
import {Button, Card, EmptyState, LoadingState} from '../components/ui';
import {useCart} from '../state/useCart';
import {formatMoney} from '../utils/format';

export const RestaurantPage = () => {
  const {restaurantId} = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {addItem, cart} = useCart();

  useEffect(() => {
    const load = async () => {
      if (!restaurantId) {
        return;
      }

      try {
        const response = await api.restaurant(restaurantId);
        setRestaurant(response.restaurant);
        setMenuItems(response.menuItems);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Restaurant failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [restaurantId]);

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((current) => ({
      ...current,
      [itemId]: Math.max(1, (current[itemId] ?? 1) + delta)
    }));
  };

  if (isLoading) {
    return <LoadingState label="Loading menu" />;
  }

  if (error || !restaurant) {
    return <EmptyState title="Menu unavailable" body={error ?? 'Restaurant was not found'} />;
  }

  return (
    <section className="page-section">
      <div className="restaurant-hero">
        <img src={restaurant.heroImageUrl} alt="" />
        <div>
          <span className="eyebrow">{restaurant.cuisine}</span>
          <h1>{restaurant.name}</h1>
          <p>
            {restaurant.deliveryTimeMinutes} minute delivery with a {formatMoney(restaurant.deliveryFeeCents)}
            {' '}delivery fee.
          </p>
        </div>
      </div>

      <div className="menu-layout">
        <div className="menu-grid">
          {menuItems.map((item) => (
            <Card className="menu-card" key={item.id}>
              <img src={item.imageUrl} alt="" loading="lazy" />
              <div className="menu-card-body">
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <strong>{formatMoney(item.priceCents)}</strong>
                <div className="quantity-row">
                  <Button
                    aria-label={`Decrease ${item.name}`}
                    title={`Decrease ${item.name}`}
                    variant="ghost"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus size={16} />
                  </Button>
                  <span>{quantities[item.id] ?? 1}</span>
                  <Button
                    aria-label={`Increase ${item.name}`}
                    title={`Increase ${item.name}`}
                    variant="ghost"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus size={16} />
                  </Button>
                  <Button onClick={() => addItem(item.id, quantities[item.id] ?? 1)}>
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <aside className="cart-summary">
          <ShoppingBag size={20} />
          <h2>Cart</h2>
          <p>{cart?.items.length ?? 0} items selected</p>
          <strong>{formatMoney(cart?.totalCents ?? 0)}</strong>
          <Link className="button button-primary" to="/cart">
            Review checkout
          </Link>
        </aside>
      </div>
    </section>
  );
};
