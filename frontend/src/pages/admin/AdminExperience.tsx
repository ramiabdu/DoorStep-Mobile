import {useEffect, useMemo, useState} from 'react';
import {Activity, BarChart3, Boxes, DollarSign, PackageCheck, Search, Store, Truck, UsersRound} from 'lucide-react';
import {Link} from 'react-router-dom';

import {api} from '../../api/client';
import type {AdminOverview, AnalyticsOverview, Order, Product, Store as StoreType, User} from '../../api/types';
import {AdminMetricCard} from '../../components/admin/AdminMetricCard';
import {Badge, Card, EmptyState, LoadingSkeleton, SearchBar} from '../../components/ui';
import {useAuth} from '../../state/useAuth';
import {formatMoney, statusLabel} from '../../utils/format';

type AdminTab = 'overview' | 'stores' | 'products' | 'orders' | 'users' | 'analytics';

export const AdminExperience = () => {
  const {token, user} = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [query, setQuery] = useState('');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(token && user?.role === 'admin'));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token || user?.role !== 'admin') {
        setIsLoading(false);
        return;
      }

      try {
        const [overviewResponse, analyticsResponse, storesResponse, productsResponse, ordersResponse, usersResponse] =
          await Promise.all([
            api.adminOverview(token),
            api.analytics(token),
            api.adminStores(token),
            api.adminProducts(token),
            api.adminOrders(token),
            api.adminUsers(token)
          ]);
        setOverview(overviewResponse.overview);
        setAnalytics(analyticsResponse.analytics);
        setStores(storesResponse.stores);
        setProducts(productsResponse.products);
        setOrders(ordersResponse.orders);
        setUsers(usersResponse.users);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Admin dashboard failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [token, user?.role]);

  const filteredStores = useMemo(
    () => stores.filter((store) => store.name.toLowerCase().includes(query.toLowerCase())),
    [query, stores]
  );
  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())),
    [products, query]
  );
  const filteredUsers = useMemo(
    () => users.filter((item) => [item.name, item.email, item.role].some((value) => value.toLowerCase().includes(query.toLowerCase()))),
    [query, users]
  );

  if (user?.role !== 'admin') {
    return (
      <EmptyState
        title="Admin access required"
        body="Sign in with the admin demo account to view marketplace operations."
        action={<Link className="button button-primary" to="/auth">Sign in</Link>}
      />
    );
  }

  if (isLoading) {
    return (
      <section className="page-section">
        <LoadingSkeleton rows={7} />
      </section>
    );
  }

  return (
    <section className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>D</span>
          <div>
            <strong>DoorStep Ops</strong>
            <small>Control center</small>
          </div>
        </div>
        {(['overview', 'stores', 'products', 'orders', 'users', 'analytics'] as AdminTab[]).map((item) => (
          <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)} type="button">
            {item === 'overview' ? <Activity size={17} /> : null}
            {item === 'stores' ? <Store size={17} /> : null}
            {item === 'products' ? <Boxes size={17} /> : null}
            {item === 'orders' ? <PackageCheck size={17} /> : null}
            {item === 'users' ? <UsersRound size={17} /> : null}
            {item === 'analytics' ? <BarChart3 size={17} /> : null}
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </aside>

      <div className="admin-content">
        <div className="admin-header">
          <div>
            <Badge tone="dark">Marketplace command</Badge>
            <h1>Operations dashboard</h1>
            <p>Stores, users, orders, catalog health, revenue, and fulfillment signals.</p>
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="Search admin data" />
        </div>

        {error ? <EmptyState title="Admin data unavailable" body={error} /> : null}

        {overview ? (
          <div className="metric-grid">
            <AdminMetricCard icon={<DollarSign size={20} />} label="Revenue" value={formatMoney(overview.revenueCents)} trend="+18.2% vs last week" />
            <AdminMetricCard icon={<PackageCheck size={20} />} label="Open orders" value={String(overview.openOrders)} trend="Live dispatch queue" />
            <AdminMetricCard icon={<Store size={20} />} label="Stores online" value={String(overview.storesOnline)} trend={`${overview.restaurantsOnline} restaurants`} />
            <AdminMetricCard icon={<Truck size={20} />} label="Active drivers" value={String(overview.activeDrivers)} trend="Coverage healthy" />
          </div>
        ) : null}

        {tab === 'overview' ? (
          <div className="admin-grid">
            <Card className="analytics-card">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">Performance</span>
                  <h2>Weekly order volume</h2>
                </div>
                <BarChart3 size={22} />
              </div>
              <div className="bar-chart">
                {analytics?.orderVolume.map((point) => (
                  <div key={point.day}>
                    <span style={{height: `${Math.max(20, point.orders)}%`}} />
                    <small>{point.day}</small>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="admin-table-card">
              <div className="table-title">
                <h2>Top stores</h2>
                <Search size={18} />
              </div>
              {analytics?.topStores.map((store) => (
                <div className="table-row compact-row" key={store.storeId}>
                  <span>{store.name}</span>
                  <strong>{formatMoney(store.revenueCents)}</strong>
                  <span>{store.orders} orders</span>
                </div>
              ))}
            </Card>
          </div>
        ) : null}

        {tab === 'stores' ? (
          <Card className="admin-table-card">
            <div className="table-header"><span>Store</span><span>Type</span><span>Rating</span><span>Status</span></div>
            {filteredStores.map((store) => (
              <div className="table-row" key={store.id}>
                <span>{store.name}</span>
                <span>{store.type}</span>
                <strong>{store.rating.toFixed(1)}</strong>
                <Badge tone={store.isOpen ? 'success' : 'danger'}>{store.isOpen ? 'Open' : 'Closed'}</Badge>
              </div>
            ))}
          </Card>
        ) : null}

        {tab === 'products' ? (
          <Card className="admin-table-card">
            <div className="table-header"><span>Product</span><span>Category</span><span>Price</span><span>State</span></div>
            {filteredProducts.map((product) => (
              <div className="table-row" key={product.id}>
                <span>{product.name}</span>
                <span>{product.category}</span>
                <strong>{formatMoney(product.priceCents)}</strong>
                <Badge tone={product.isAvailable ? 'success' : 'danger'}>{product.isAvailable ? 'Live' : 'Paused'}</Badge>
              </div>
            ))}
          </Card>
        ) : null}

        {tab === 'orders' ? (
          <Card className="admin-table-card">
            <div className="table-header"><span>Order</span><span>Store</span><span>Status</span><span>Total</span></div>
            {orders.map((order) => (
              <div className="table-row" key={order.id}>
                <span>#{order.id.slice(0, 8)}</span>
                <span>{order.storeName}</span>
                <Badge tone="primary">{statusLabel(order.status)}</Badge>
                <strong>{formatMoney(order.totalCents)}</strong>
              </div>
            ))}
            {orders.length === 0 ? <p className="muted-row">No orders yet.</p> : null}
          </Card>
        ) : null}

        {tab === 'users' ? (
          <Card className="admin-table-card">
            <div className="table-header"><span>User</span><span>Email</span><span>Role</span><span>Joined</span></div>
            {filteredUsers.map((item) => (
              <div className="table-row" key={item.id}>
                <span>{item.name}</span>
                <span>{item.email}</span>
                <Badge tone={item.role === 'admin' ? 'dark' : item.role === 'driver' ? 'warning' : 'primary'}>{item.role}</Badge>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </Card>
        ) : null}

        {tab === 'analytics' ? (
          <div className="admin-grid">
            <Card className="info-card">
              <h3>Conversion rate</h3>
              <strong>{overview?.conversionRate.toFixed(1)}%</strong>
              <p>Browse-to-checkout estimate from the marketplace funnel.</p>
            </Card>
            <Card className="info-card">
              <h3>Average order value</h3>
              <strong>{formatMoney(overview?.averageOrderValueCents ?? 0)}</strong>
              <p>Blended basket value across food and grocery orders.</p>
            </Card>
            <Card className="info-card">
              <h3>Fulfillment rate</h3>
              <strong>{analytics?.fulfillmentRate ?? 97}%</strong>
              <p>Completed deliveries excluding cancelled orders.</p>
            </Card>
          </div>
        ) : null}
      </div>
    </section>
  );
};
