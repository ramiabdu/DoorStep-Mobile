import {useEffect, useState} from 'react';
import {Bike, CheckCircle2, Circle, Clock3, MapPinned, PhoneCall, Radio, Route} from 'lucide-react';
import {Link} from 'react-router-dom';

import {api} from '../../api/client';
import type {Order, OrderStatus} from '../../api/types';
import {Badge, Card, EmptyState, LoadingSkeleton} from '../../components/ui';
import {useAuth} from '../../state/useAuth';
import {formatMoney, statusLabel} from '../../utils/format';

const steps: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivered'];

export const OrderTrackingPage = () => {
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
        icon={<Radio size={24} />}
        title="No customer session"
        body="Sign in as a customer to review active order tracking."
        action={<Link className="button button-primary" to="/auth">Sign in</Link>}
      />
    );
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <LoadingSkeleton rows={5} />
      </section>
    );
  }

  const latest = orders[0];

  return (
    <section className="tracking-page">
      <div className="tracking-map">
        <div className="route-line" />
        <div className="map-pin restaurant">
          <MapPinned size={18} />
        </div>
        <div className="map-pin courier">
          <Bike size={18} />
        </div>
        <div className="map-pin home">
          <Route size={18} />
        </div>
      </div>

      <div className="tracking-panel">
        <Badge tone="primary">
          <Radio size={14} /> Live order tracking
        </Badge>
        <h1>{latest ? `${latest.storeName} is on the move.` : 'Track your next order live.'}</h1>
        {error ? <p className="inline-error">{error}</p> : null}

        {!latest && !error ? (
          <EmptyState
            title="No orders yet"
            body="Place an order to see status progression, rider details, and arrival estimate."
            action={<Link className="button button-primary" to="/restaurants">Start an order</Link>}
          />
        ) : null}

        {latest ? (
          <>
            <Card className="tracking-summary-card">
              <div>
                <span>ETA</span>
                <strong>{latest.etaMinutes} min</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>{formatMoney(latest.totalCents)}</strong>
              </div>
              <div>
                <span>Courier</span>
                <strong>Drew</strong>
              </div>
            </Card>

            <Card className="tracking-card">
              <div className="tracking-summary">
                <Clock3 size={25} />
                <div>
                  <h2>{statusLabel(latest.status)}</h2>
                  <p>{latest.deliveryAddress}</p>
                </div>
                <Badge tone="success">#{latest.id.slice(0, 8)}</Badge>
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

            <Card className="courier-card">
              <div>
                <strong>Drew Driver</strong>
                <span>Electric bike courier</span>
              </div>
              <button type="button" aria-label="Call courier" title="Call courier">
                <PhoneCall size={17} />
              </button>
            </Card>
          </>
        ) : null}
      </div>
    </section>
  );
};
