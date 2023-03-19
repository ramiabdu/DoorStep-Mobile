import {Bike, CheckCircle2, Clock3} from 'lucide-react';
import {Link} from 'react-router-dom';

import type {Order} from '../../api/types';
import {formatMoney, statusLabel} from '../../utils/format';

export const ActiveOrderPreview = ({order}: {order?: Order}) => {
  if (!order) {
    return (
      <div className="active-order-preview idle">
        <Clock3 size={18} />
        <div>
          <strong>No active order</strong>
          <span>Start a basket and track it live.</span>
        </div>
      </div>
    );
  }

  return (
    <Link className="active-order-preview" to="/tracking">
      <Bike size={19} />
      <div>
        <strong>{order.storeName}</strong>
        <span>
          {statusLabel(order.status)} - ETA {order.etaMinutes} min - {formatMoney(order.totalCents)}
        </span>
      </div>
      <CheckCircle2 size={18} />
    </Link>
  );
};
