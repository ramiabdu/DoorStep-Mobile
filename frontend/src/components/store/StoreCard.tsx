import {Clock, MapPin, Sparkles} from 'lucide-react';
import {Link} from 'react-router-dom';

import type {Store} from '../../api/types';
import {formatMoney} from '../../utils/format';
import {Badge, Card, RatingStars} from '../ui';

export const StoreCard = ({store, featured = false}: {store: Store; featured?: boolean}) => (
  <Link className={featured ? 'store-card-link featured' : 'store-card-link'} to={`/stores/${store.id}`}>
    <Card className="store-card">
      <div className="store-media">
        <img src={store.heroImageUrl} alt="" loading="lazy" />
        <div className="store-logo">
          <img src={store.logoUrl} alt={`${store.name} logo`} loading="lazy" />
        </div>
        {store.isFeatured ? (
          <Badge tone="primary" className="floating-badge">
            <Sparkles size={13} /> Featured
          </Badge>
        ) : null}
      </div>
      <div className="store-body">
        <div className="store-title-row">
          <div>
            <h3>{store.name}</h3>
            <p>{store.cuisine}</p>
          </div>
          <RatingStars rating={store.rating} count={store.reviewCount} />
        </div>
        <div className="meta-row store-meta">
          <span>
            <Clock size={14} /> {store.deliveryTimeMinutes} min
          </span>
          <span>
            <MapPin size={14} /> {store.distanceKm.toFixed(1)} km
          </span>
          <span>{formatMoney(store.deliveryFeeCents)} delivery</span>
        </div>
        <div className="tag-row">
          {store.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </Card>
  </Link>
);
