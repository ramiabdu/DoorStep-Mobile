import {Plus, Sparkles} from 'lucide-react';

import type {Product} from '../../api/types';
import {Badge, Button, Card, PriceTag, RatingStars} from '../ui';

export const ProductCard = ({
  product,
  onAdd,
  compact = false
}: {
  product: Product;
  onAdd?: (productId: string) => void;
  compact?: boolean;
}) => (
  <Card className={compact ? 'product-card compact' : 'product-card'}>
    <div className="product-media">
      <img src={product.imageUrl} alt="" loading="lazy" />
      {product.discountPercent ? (
        <Badge tone="danger" className="floating-badge">
          {product.discountPercent}% off
        </Badge>
      ) : null}
    </div>
    <div className="product-body">
      <div className="product-copy">
        <div className="product-topline">
          <Badge tone={product.isPopular ? 'success' : 'neutral'}>
            {product.isPopular ? <Sparkles size={12} /> : null}
            {product.category}
          </Badge>
          <RatingStars rating={product.rating} />
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <small>{product.weight ?? `${product.calories ?? 0} kcal`}</small>
      </div>
      <div className="product-actions">
        <PriceTag priceCents={product.priceCents} originalPriceCents={product.originalPriceCents} />
        {onAdd ? (
          <Button aria-label={`Add ${product.name}`} title={`Add ${product.name}`} size="icon" onClick={() => onAdd(product.id)}>
            <Plus size={17} />
          </Button>
        ) : null}
      </div>
    </div>
  </Card>
);
