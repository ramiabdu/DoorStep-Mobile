import type {FormEvent} from 'react';
import {useEffect, useState} from 'react';
import {Minus, Plus} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';

import {api} from '../api/client';
import type {Order} from '../api/types';
import {Button, Card, EmptyState, Field, LoadingState, formatMoney} from '../components/ui';
import {useAuth} from '../state/auth';
import {useCart} from '../state/cart';

export const CartPage = () => {
  const navigate = useNavigate();
  const {token, user} = useAuth();
  const {cart, isLoading, refreshCart, updateItem} = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('123 Market Street, Berlin');
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      navigate('/auth');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await api.checkout(token, deliveryAddress);
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
        title="Sign in required"
        body="Create a customer session before starting checkout."
        action={<Link className="button button-primary" to="/auth">Sign in</Link>}
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Loading cart" />;
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">Checkout</span>
        <h1>Review your cart and place the order.</h1>
      </div>

      {order ? (
        <Card className="success-card">
          <h2>Order placed</h2>
          <p>Your order is now in the dispatch queue.</p>
          <strong>{order.restaurantName}</strong>
          <Link className="button button-primary" to="/tracking">
            Track order
          </Link>
        </Card>
      ) : null}

      <div className="checkout-layout">
        <div className="cart-list">
          {cart && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <Card className="cart-item" key={item.id}>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.restaurantName}</p>
                </div>
                <div className="quantity-row">
                  <Button
                    aria-label={`Decrease ${item.name}`}
                    title={`Decrease ${item.name}`}
                    variant="ghost"
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                  >
                    <Minus size={16} />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    aria-label={`Increase ${item.name}`}
                    title={`Increase ${item.name}`}
                    variant="ghost"
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <strong>{formatMoney(item.priceCents * item.quantity)}</strong>
              </Card>
            ))
          ) : (
            <EmptyState
              title="Your cart is empty"
              body="Choose a restaurant and add a few menu items to start checkout."
              action={<Link className="button button-primary" to="/restaurants">Browse restaurants</Link>}
            />
          )}
        </div>

        <Card className="checkout-card">
          {error ? <p className="inline-error">{error}</p> : null}
          <form className="form-stack" onSubmit={handleCheckout}>
            <Field label="Delivery address">
              <textarea
                rows={4}
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
              />
            </Field>
            <div className="totals">
              <span>Subtotal</span>
              <strong>{formatMoney(cart?.subtotalCents ?? 0)}</strong>
              <span>Delivery</span>
              <strong>{formatMoney(cart?.deliveryFeeCents ?? 0)}</strong>
              <span>Total</span>
              <strong>{formatMoney(cart?.totalCents ?? 0)}</strong>
            </div>
            <Button disabled={!cart || cart.items.length === 0} isLoading={isSubmitting} type="submit">
              Place order
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};
