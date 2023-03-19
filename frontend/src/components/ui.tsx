import type {ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes} from 'react';
import {ChevronDown, Loader2, Minus, Plus, Search, Star} from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={`button button-${variant} button-${size} ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? <Loader2 aria-hidden="true" className="spin" size={16} /> : null}
    {children}
  </button>
);

export const Card = ({children, className = ''}: {children: ReactNode; className?: string}) => (
  <section className={`card ${className}`}>{children}</section>
);

export const Badge = ({
  children,
  tone = 'neutral',
  className = ''
}: {
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'dark';
  className?: string;
}) => <span className={`badge badge-${tone} ${className}`}>{children}</span>;

export const EmptyState = ({
  title,
  body,
  action,
  icon
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) => (
  <div className="empty-state">
    {icon ? <div className="empty-icon">{icon}</div> : null}
    <h3>{title}</h3>
    <p>{body}</p>
    {action}
  </div>
);

export const Field = ({
  label,
  children,
  hint
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint ? <small>{hint}</small> : null}
  </label>
);

export const Input = ({className = '', ...props}: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`input ${className}`} {...props} />
);

export const Select = ({className = '', children, ...props}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <span className="select-wrap">
    <select className={`input select ${className}`} {...props}>
      {children}
    </select>
    <ChevronDown size={16} />
  </span>
);

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search stores, products, or cuisines'
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <div className="search-bar">
    <Search size={19} />
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    <kbd>Ctrl K</kbd>
  </div>
);

export const RatingStars = ({rating, count}: {rating: number; count?: number}) => (
  <span className="rating">
    <Star size={14} fill="currentColor" />
    <strong>{rating.toFixed(1)}</strong>
    {count ? <span>({Intl.NumberFormat('en', {notation: 'compact'}).format(count)})</span> : null}
  </span>
);

export const PriceTag = ({
  priceCents,
  originalPriceCents
}: {
  priceCents: number;
  originalPriceCents?: number;
}) => (
  <span className="price-tag">
    <strong>{new Intl.NumberFormat('en-DE', {style: 'currency', currency: 'EUR'}).format(priceCents / 100)}</strong>
    {originalPriceCents ? (
      <del>{new Intl.NumberFormat('en-DE', {style: 'currency', currency: 'EUR'}).format(originalPriceCents / 100)}</del>
    ) : null}
  </span>
);

export const QuantitySelector = ({
  value,
  onDecrease,
  onIncrease,
  compact = false
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  compact?: boolean;
}) => (
  <div className={compact ? 'quantity compact' : 'quantity'}>
    <Button aria-label="Decrease quantity" title="Decrease quantity" size="icon" variant="ghost" onClick={onDecrease}>
      <Minus size={15} />
    </Button>
    <span>{value}</span>
    <Button aria-label="Increase quantity" title="Increase quantity" size="icon" variant="ghost" onClick={onIncrease}>
      <Plus size={15} />
    </Button>
  </div>
);

export const LoadingSkeleton = ({rows = 4, className = ''}: {rows?: number; className?: string}) => (
  <div className={`skeleton-stack ${className}`} role="status" aria-label="Loading">
    {Array.from({length: rows}).map((_, index) => (
      <div className="skeleton" key={index} />
    ))}
  </div>
);

export const LoadingState = ({label = 'Loading'}: {label?: string}) => (
  <div className="loading-state" role="status">
    <Loader2 aria-hidden="true" className="spin" size={18} />
    <span>{label}</span>
  </div>
);

export const ErrorBanner = ({message}: {message: string}) => (
  <div className="error-banner" role="alert">
    {message}
  </div>
);
