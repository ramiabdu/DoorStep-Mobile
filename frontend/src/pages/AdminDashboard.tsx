import {useEffect, useState} from 'react';
import {Activity, DollarSign, Store, Truck} from 'lucide-react';
import {Link} from 'react-router-dom';

import {api} from '../api/client';
import type {AdminOverview, Order} from '../api/types';
import {Card, EmptyState, LoadingState, formatMoney, statusLabel} from '../components/ui';
import {useAuth} from '../state/auth';

export const AdminDashboard = () => {
  const {token, user} = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(token && user?.role === 'admin'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token || user?.role !== 'admin') {
        setIsLoading(false);
        return;
      }

      try {
        const [overviewResponse, ordersResponse] = await Promise.all([
          api.adminOverview(token),
          api.assignableOrders(token)
        ]);
        setOverview(overviewResponse.overview);
        setOrders(ordersResponse.orders);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Admin dashboard failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [token, user?.role]);

  if (user?.role !== 'admin') {
    return (
      <EmptyState
        title="Admin access required"
        body="Sign in with an admin account to view operations."
        action={<Link className="button button-primary" to="/auth">Sign in</Link>}
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading admin operations" />;
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">Admin dashboard</span>
        <h1>Operations control center.</h1>
      </div>

      {error ? <EmptyState title="Admin data unavailable" body={error} /> : null}

      {overview ? (
        <div className="metric-grid">
          <Card>
            <Activity size={22} />
            <strong>{overview.openOrders}</strong>
            <span>Open orders</span>
          </Card>
          <Card>
            <Truck size={22} />
            <strong>{overview.activeDrivers}</strong>
            <span>Active drivers</span>
          </Card>
          <Card>
            <DollarSign size={22} />
            <strong>{formatMoney(overview.revenueCents)}</strong>
            <span>Delivered revenue</span>
          </Card>
          <Card>
            <Store size={22} />
            <strong>{overview.restaurantsOnline}</strong>
            <span>Restaurants online</span>
          </Card>
        </div>
      ) : null}

      <div className="data-table">
        <div className="table-header">
          <span>Order</span>
          <span>Restaurant</span>
          <span>Status</span>
          <span>Total</span>
        </div>
        {orders.map((order) => (
          <div className="table-row" key={order.id}>
            <span>{order.id.slice(0, 8)}</span>
            <span>{order.restaurantName}</span>
            <span>{statusLabel(order.status)}</span>
            <strong>{formatMoney(order.totalCents)}</strong>
          </div>
        ))}
        {orders.length === 0 ? <p className="muted-row">No assignable orders yet.</p> : null}
      </div>
    </section>
  );
};
