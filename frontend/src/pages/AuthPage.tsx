import type {FormEvent} from 'react';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import type {UserRole} from '../api/types';
import {Button, Card, ErrorBanner, Field} from '../components/ui';
import {useAuth} from '../state/useAuth';

const demoAccounts = [
  {label: 'Customer', email: 'customer@doorstep.dev', role: 'customer'},
  {label: 'Driver', email: 'driver@doorstep.dev', role: 'driver'},
  {label: 'Admin', email: 'admin@doorstep.dev', role: 'admin'}
];

export const AuthPage = () => {
  const navigate = useNavigate();
  const {login, signup} = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('customer');
  const [name, setName] = useState('DoorStep User');
  const [email, setEmail] = useState('customer@doorstep.dev');
  const [password, setPassword] = useState('Doorstep123!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({email, password});
      } else {
        await signup({name, email, password, role});
      }

      navigate(role === 'admin' ? '/admin' : role === 'driver' ? '/driver' : '/restaurants');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-copy">
        <span className="eyebrow">Secure access</span>
        <h1>Sign in to operate the platform by role.</h1>
        <p>
          Use seeded demo accounts locally after the backend starts. All accounts share the
          password <strong>Doorstep123!</strong>.
        </p>
        <div className="demo-grid">
          {demoAccounts.map((account) => (
            <button
              className="demo-account"
              key={account.email}
              onClick={() => {
                setMode('login');
                setRole(account.role as UserRole);
                setEmail(account.email);
                setPassword('Doorstep123!');
              }}
              type="button"
            >
              <strong>{account.label}</strong>
              <span>{account.email}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="auth-card">
        <div className="segmented-control" role="tablist" aria-label="Authentication mode">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
            type="button"
          >
            Signup
          </button>
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        <form className="form-stack" onSubmit={handleSubmit}>
          {mode === 'signup' ? (
            <Field label="Name">
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
          ) : null}

          <Field label="Email">
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field label="Password">
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <Field label="Role">
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          <Button isLoading={isSubmitting} type="submit">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </Card>
    </section>
  );
};
