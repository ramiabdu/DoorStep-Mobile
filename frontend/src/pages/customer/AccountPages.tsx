import {useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {Bell, CreditCard, Heart, Home, PackageCheck, Settings, Tag, UserRound} from 'lucide-react';
import {Link} from 'react-router-dom';

import {api} from '../../api/client';
import type {Address, Notification, Order, PaymentMethod} from '../../api/types';
import {Badge, Card, EmptyState, LoadingSkeleton} from '../../components/ui';
import {useAuth} from '../../state/useAuth';
import {formatMoney, statusLabel} from '../../utils/format';

type AccountPageKind = 'orders' | 'favorites' | 'offers' | 'notifications' | 'profile' | 'addresses' | 'payments' | 'settings';

const pageMeta: Record<AccountPageKind, {title: string; eyebrow: string; icon: ReactNode}> = {
  orders: {title: 'Order history', eyebrow: 'Customer activity', icon: <PackageCheck size={18} />},
  favorites: {title: 'Saved favorites', eyebrow: 'Your shortlist', icon: <Heart size={18} />},
  offers: {title: 'Offers and rewards', eyebrow: 'Savings center', icon: <Tag size={18} />},
  notifications: {title: 'Notifications', eyebrow: 'Inbox', icon: <Bell size={18} />},
  profile: {title: 'Profile', eyebrow: 'Account', icon: <UserRound size={18} />},
  addresses: {title: 'Address book', eyebrow: 'Delivery places', icon: <Home size={18} />},
  payments: {title: 'Payment methods', eyebrow: 'Wallet', icon: <CreditCard size={18} />},
  settings: {title: 'Settings', eyebrow: 'Preferences', icon: <Settings size={18} />}
};

export const AccountPage = ({kind}: {kind: AccountPageKind}) => {
  const {token, user} = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const meta = pageMeta[kind];

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      const tasks = await Promise.allSettled([
        user?.role === 'customer' ? api.orders(token) : Promise.resolve({orders: []}),
        user?.role === 'customer' ? api.addresses(token) : Promise.resolve({addresses: []}),
        user?.role === 'customer' ? api.payments(token) : Promise.resolve({payments: []}),
        api.notifications(token)
      ]);

      const [ordersResponse, addressesResponse, paymentsResponse, notificationsResponse] = tasks;
      if (ordersResponse.status === 'fulfilled') {
        setOrders(ordersResponse.value.orders);
      }
      if (addressesResponse.status === 'fulfilled') {
        setAddresses(addressesResponse.value.addresses);
      }
      if (paymentsResponse.status === 'fulfilled') {
        setPayments(paymentsResponse.value.payments);
      }
      if (notificationsResponse.status === 'fulfilled') {
        setNotifications(notificationsResponse.value.notifications);
      }
      setIsLoading(false);
    };

    void load();
  }, [token, user?.role]);

  if (!token) {
    return (
      <EmptyState
        title="Sign in required"
        body="Open a DoorStep session to manage this area."
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

  return (
    <section className="page-section">
      <div className="page-heading compact-heading">
        <Badge tone="primary">
          {meta.icon} {meta.eyebrow}
        </Badge>
        <h1>{meta.title}</h1>
        <p>Production-style account surfaces with realistic states and connected API data.</p>
      </div>

      {kind === 'orders' ? (
        <div className="data-card-grid">
          {orders.map((order) => (
            <Card className="order-history-card" key={order.id}>
              <div>
                <strong>{order.storeName}</strong>
                <span>{statusLabel(order.status)}</span>
              </div>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <strong>{formatMoney(order.totalCents)}</strong>
            </Card>
          ))}
          {orders.length === 0 ? <EmptyState title="No orders yet" body="Your completed and active orders will appear here." /> : null}
        </div>
      ) : null}

      {kind === 'addresses' ? (
        <div className="data-card-grid">
          {addresses.map((address) => (
            <Card className="info-card" key={address.id}>
              <Badge tone={address.isDefault ? 'success' : 'neutral'}>{address.isDefault ? 'Default' : 'Saved'}</Badge>
              <h3>{address.label}</h3>
              <p>{address.line1}, {address.city} {address.postalCode}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {kind === 'payments' ? (
        <div className="data-card-grid">
          {payments.map((payment) => (
            <Card className="payment-card" key={payment.id}>
              <CreditCard size={23} />
              <div>
                <strong>{payment.brand}</strong>
                <span>{payment.label} ending {payment.last4}</span>
              </div>
              {payment.isDefault ? <Badge tone="success">Default</Badge> : null}
            </Card>
          ))}
        </div>
      ) : null}

      {kind === 'notifications' ? (
        <div className="data-card-grid">
          {notifications.map((notification) => (
            <Card className={notification.isRead ? 'notification-card read' : 'notification-card'} key={notification.id}>
              <Badge tone={notification.type === 'offer' ? 'warning' : 'primary'}>{notification.type}</Badge>
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {kind === 'offers' ? (
        <div className="data-card-grid">
          {['WELCOME25', 'FRESH15', 'COFFEE10'].map((code) => (
            <Card className="info-card offer-card" key={code}>
              <Badge tone="warning">{code}</Badge>
              <h3>{code === 'WELCOME25' ? 'First order reward' : code === 'FRESH15' ? 'Fresh grocery run' : 'Coffee break'}</h3>
              <p>Apply at checkout when your basket reaches the eligible minimum.</p>
            </Card>
          ))}
        </div>
      ) : null}

      {kind === 'favorites' || kind === 'profile' || kind === 'settings' ? (
        <div className="data-card-grid">
          <Card className="info-card">
            <Badge tone="dark">{kind}</Badge>
            <h3>{user?.name}</h3>
            <p>
              {kind === 'favorites'
                ? 'Favorite stores and saved products are ready for the customer loop.'
                : kind === 'settings'
                  ? 'Notification, privacy, language, and delivery preferences sit here.'
                  : `${user?.email} - ${user?.role}`}
            </p>
          </Card>
        </div>
      ) : null}
    </section>
  );
};
