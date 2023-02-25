import {useCallback, useEffect, useState} from 'react';
import {CheckCircle2, Navigation} from 'lucide-react';
import {Link} from 'react-router-dom';

import {api} from '../api/client';
import type {Order, OrderStatus} from '../api/types';
import {Button, Card, EmptyState, LoadingState} from '../components/ui';
import {useAuth} from '../state/useAuth';
import {formatMoney, statusLabel} from '../utils/format';

const nextStatuses: Exclude<OrderStatus, 'placed' | 'assigned'>[] = [
  'confirmed',
  'preparing',
  'ready',
  'picked_up',
  'delivered'
];

export const DriverDashboard = () => {
  const {token, user} = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(token && user?.role === 'driver'));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || user?.role !== 'driver') {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.driverOrders(token);
      setOrders(response.orders);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Driver queue failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (orderId: string, status: Exclude<OrderStatus, 'placed' | 'assigned'>) => {
    if (!token) {
      return;
    }

    await api.updateOrderStatus(token, orderId, status);
    await load();
  };

  if (user?.role !== 'driver') {
    return (
      <EmptyState
        title="Driver access required"
        body="Sign in with a driver account to manage assigned orders."
        action={<Link className="button button-primary" to="/auth">Sign in</Link>}
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading driver queue" />;
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">Driver dashboard</span>
        <h1>Assigned deliveries.</h1>
      </div>

      {error ? <EmptyState title="Driver queue unavailable" body={error} /> : null}

      <div className="driver-grid">
        {orders.map((order) => (
          <Card className="driver-card" key={order.id}>
            <div className="tracking-summary">
              <Navigation size={24} />
              <div>
                <h3>{order.restaurantName}</h3>
                <p>{order.deliveryAddress}</p>
              </div>
              <strong>{formatMoney(order.totalCents)}</strong>
            </div>
            <div className="status-actions">
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  variant={order.status === status ? 'secondary' : 'ghost'}
                  onClick={() => updateStatus(order.id, status)}
                >
                  {order.status === status ? <CheckCircle2 size={14} /> : null}
                  {statusLabel(status)}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {orders.length === 0 && !error ? (
        <EmptyState title="No deliveries assigned" body="Assigned orders will appear here." />
      ) : null}
    </section>
  );
};
