import type {ButtonHTMLAttributes, ReactNode} from 'react';
import {Loader2} from 'lucide-react';

export const formatMoney = (valueCents: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(valueCents / 100);

export const statusLabel = (status: string) =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={`button button-${variant} ${className}`}
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

export const EmptyState = ({
  title,
  body,
  action
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) => (
  <div className="empty-state">
    <h3>{title}</h3>
    <p>{body}</p>
    {action}
  </div>
);

export const Field = ({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
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
