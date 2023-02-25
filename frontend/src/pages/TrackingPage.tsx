import {useEffect, useState} from 'react';
import {CheckCircle2, Circle, Truck} from 'lucide-react';
import {Link} from 'react-router-dom';

import {api} from '../api/client';
import type {Order, OrderStatus} from '../api/types';
import {Card, EmptyState, LoadingState} from '../components/ui';
import {useAuth} from '../state/useAuth';
import {formatMoney, statusLabel} from '../utils/format';

const steps: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered'];

export const TrackingPage = () => {
  const {token, user} = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(token && user?.role === 'customer'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token || user?.role !== 'customer') {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.orders(token);
        setOrders(response.orders);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Orders failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [token, user?.role]);

  if (!token) {
    return (
      <EmptyState
        title="No customer session"
        body="Sign in as a customer to review active order tracking."
        action={<Link className="button button-primary" to="/auth">Sign in</Link>}
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading orders" />;
  }

  const latest = orders[0];

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">Live tracking</span>
        <h1>Follow the delivery lifecycle.</h1>
      </div>

      {error ? <EmptyState title="Tracking unavailable" body={error} /> : null}

      {!latest && !error ? (
        <EmptyState
          title="No orders yet"
          body="Place an order to see real-time status progression."
          action={<Link className="button button-primary" to="/restaurants">Start an order</Link>}
        />
      ) : null}

      {latest ? (
        <Card className="tracking-card">
          <div className="tracking-summary">
            <Truck size={28} />
            <div>
              <h2>{latest.restaurantName}</h2>
              <p>{latest.deliveryAddress}</p>
            </div>
            <strong>{formatMoney(latest.totalCents)}</strong>
          </div>

          <div className="timeline">
            {steps.map((step) => {
              const currentIndex = steps.indexOf(latest.status);
              const stepIndex = steps.indexOf(step);
              const isDone = currentIndex >= stepIndex;

              return (
                <div className={isDone ? 'timeline-step done' : 'timeline-step'} key={step}>
                  {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  <span>{statusLabel(step)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
    </section>
  );
};
