import type {FormEvent} from 'react';
import {useEffect, useMemo, useState} from 'react';
import {ArrowRight, CheckCircle2, CreditCard, Home, Minus, Plus, ShieldCheck, ShoppingBag, Trash2} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';

import {api} from '../../api/client';
import type {Address, Order, PaymentMethod} from '../../api/types';
import {Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingSkeleton, Select} from '../../components/ui';
import {useAuth} from '../../state/useAuth';
import {useCart} from '../../state/useCart';
import {formatMoney} from '../../utils/format';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const {token, user} = useAuth();
  const {cart, isLoading, refreshCart, updateItem} = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      await refreshCart();
      if (!token || user?.role !== 'customer') {
        return;
      }
      const [addressResponse, paymentResponse] = await Promise.all([api.addresses(token), api.payments(token)]);
      setAddresses(addressResponse.addresses);
      setPayments(paymentResponse.payments);
      setSelectedAddressId(addressResponse.addresses.find((address) => address.isDefault)?.id ?? addressResponse.addresses[0]?.id ?? '');
      setSelectedPaymentId(paymentResponse.payments.find((payment) => payment.isDefault)?.id ?? paymentResponse.payments[0]?.id ?? '');
    };

    void load().catch((caughtError) => {
      setError(caughtError instanceof Error ? caughtError.message : 'Checkout data failed to load');
    });
  }, [refreshCart, token, user?.role]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      navigate('/auth');
      return;
    }

    if (!selectedAddress) {
      setError('Choose a delivery address before placing the order.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const addressLine = `${selectedAddress.line1}, ${selectedAddress.city} ${selectedAddress.postalCode}`;
      const response = await api.checkout(token, addressLine);
      setOrder(response.order);
      await refreshCart();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <EmptyState
        icon={<ShoppingBag size={25} />}
        title="Sign in required"
        body="Create a customer session before starting checkout."
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

  if (order) {
    return (
      <section className="order-success-page">
        <Card className="success-card premium">
          <CheckCircle2 size={46} />
          <Badge tone="success">Order confirmed</Badge>
          <h1>{order.storeName} is preparing your order.</h1>
          <p>Your courier will be assigned shortly. ETA is {order.etaMinutes} minutes.</p>
          <div className="success-summary">
            <span>Order</span>
            <strong>#{order.id.slice(0, 8)}</strong>
            <span>Total</span>
            <strong>{formatMoney(order.totalCents)}</strong>
          </div>
          <Link className="button button-primary" to="/tracking">
            Track live order <ArrowRight size={16} />
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-heading compact-heading">
        <Badge tone="primary">
          <ShieldCheck size={14} /> Secure checkout
        </Badge>
        <h1>Review your basket.</h1>
        <p>Address, payment, fees, and delivery estimate are visible before placing the order.</p>
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="checkout-layout">
        <div className="cart-list">
          {cart && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <Card className="cart-item" key={item.id}>
                {item.imageUrl ? <img src={item.imageUrl} alt="" /> : null}
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.storeName}</p>
                  <strong>{formatMoney(item.priceCents)}</strong>
                </div>
                <div className="cart-item-actions">
                  <Button
                    aria-label={`Decrease ${item.name}`}
                    title={`Decrease ${item.name}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                  >
                    {item.quantity === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    aria-label={`Increase ${item.name}`}
                    title={`Increase ${item.name}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                  >
                    <Plus size={15} />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              title="Your basket is empty"
              body="Choose a store and add products to start checkout."
              action={<Link className="button button-primary" to="/restaurants">Browse stores</Link>}
            />
          )}
        </div>

        <Card className="checkout-card">
          <form className="form-stack" onSubmit={handleCheckout}>
            <Field label="Delivery address">
              <Select value={selectedAddressId} onChange={(event) => setSelectedAddressId(event.target.value)}>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} - {address.line1}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Payment method">
              <Select value={selectedPaymentId} onChange={(event) => setSelectedPaymentId(event.target.value)}>
                {payments.map((payment) => (
                  <option key={payment.id} value={payment.id}>
                    {payment.brand} ending {payment.last4}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="checkout-address-preview">
              <Home size={17} />
              <span>{selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : 'No address selected'}</span>
            </div>
            <div className="checkout-address-preview">
              <CreditCard size={17} />
              <span>{payments.find((payment) => payment.id === selectedPaymentId)?.label ?? 'Payment method'}</span>
            </div>
            <div className="totals">
              <span>Subtotal</span>
              <strong>{formatMoney(cart?.subtotalCents ?? 0)}</strong>
              <span>Delivery</span>
              <strong>{formatMoney(cart?.deliveryFeeCents ?? 0)}</strong>
              <span>Service</span>
              <strong>{formatMoney(cart?.serviceFeeCents ?? 0)}</strong>
              <span>Discount</span>
              <strong>-{formatMoney(cart?.discountCents ?? 0)}</strong>
              <span>Total</span>
              <strong>{formatMoney(cart?.totalCents ?? 0)}</strong>
            </div>
            <Button disabled={!cart || cart.items.length === 0} isLoading={isSubmitting} type="submit">
              Place order <ArrowRight size={16} />
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};
