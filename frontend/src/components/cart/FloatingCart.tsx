import {ShoppingBag} from 'lucide-react';
import {Link} from 'react-router-dom';

import type {Cart} from '../../api/types';
import {formatMoney} from '../../utils/format';

export const FloatingCart = ({cart}: {cart: Cart | null}) => {
  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <Link className="floating-cart" to="/cart" aria-label="Open cart">
      <span>
        <ShoppingBag size={18} />
        {cart.items.reduce((total, item) => total + item.quantity, 0)}
      </span>
      <strong>{formatMoney(cart.totalCents)}</strong>
    </Link>
  );
};
