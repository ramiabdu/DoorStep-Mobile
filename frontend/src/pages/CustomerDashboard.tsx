import {useEffect, useState} from 'react';
import {Clock, Star} from 'lucide-react';
import {Link} from 'react-router-dom';

import {api} from '../api/client';
import type {Restaurant} from '../api/types';
import {Card, EmptyState, LoadingState} from '../components/ui';
import {useCart} from '../state/useCart';
import {formatMoney} from '../utils/format';

export const CustomerDashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {refreshCart} = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.restaurants();
        setRestaurants(response.restaurants);
        await refreshCart();
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Restaurants failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [refreshCart]);

  if (isLoading) {
    return <LoadingState label="Loading restaurants" />;
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">Customer dashboard</span>
        <h1>Restaurants ready for delivery.</h1>
        <p>Browse curated restaurant partners and start a checkout flow in a few clicks.</p>
      </div>

      {error ? (
        <EmptyState title="Restaurants unavailable" body={error} />
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <Link className="restaurant-link" key={restaurant.id} to={`/restaurants/${restaurant.id}`}>
              <Card className="restaurant-card">
                <img src={restaurant.heroImageUrl} alt="" loading="lazy" />
                <div className="restaurant-body">
                  <div>
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine}</p>
                  </div>
                  <div className="meta-row">
                    <span>
                      <Star size={14} /> {restaurant.rating}
                    </span>
                    <span>
                      <Clock size={14} /> {restaurant.deliveryTimeMinutes} min
                    </span>
                    <span>{formatMoney(restaurant.deliveryFeeCents)} delivery</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
