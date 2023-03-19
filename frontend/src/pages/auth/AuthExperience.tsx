import type {FormEvent} from 'react';
import {useState} from 'react';
import {ArrowRight, BadgeCheck, KeyRound, Mail, ShieldCheck, Smartphone, UserPlus} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

import type {UserRole} from '../../api/types';
import {Badge, Button, Card, ErrorBanner, Field, Input, Select} from '../../components/ui';
import {useAuth} from '../../state/useAuth';

const demoAccounts: Array<{label: string; email: string; role: UserRole; description: string}> = [
  {label: 'Customer', email: 'customer@doorstep.dev', role: 'customer', description: 'Browse, cart, checkout, tracking'},
  {label: 'Driver', email: 'driver@doorstep.dev', role: 'driver', description: 'Assigned orders and delivery status'},
  {label: 'Admin', email: 'admin@doorstep.dev', role: 'admin', description: 'Analytics and marketplace operations'}
];

export const AuthExperience = () => {
  const navigate = useNavigate();
  const {login, signup} = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'otp'>('login');
  const [role, setRole] = useState<UserRole>('customer');
  const [name, setName] = useState('DoorStep User');
  const [email, setEmail] = useState('customer@doorstep.dev');
  const [password, setPassword] = useState('Doorstep123!');
  const [otp, setOtp] = useState('245810');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const routeForRole = (selectedRole: UserRole) =>
    selectedRole === 'admin' ? '/admin' : selectedRole === 'driver' ? '/driver' : '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === 'forgot') {
      setMode('otp');
      return;
    }

    if (mode === 'otp') {
      navigate('/profile');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({email, password});
      } else {
        await signup({name, email, password, role});
      }

      navigate(routeForRole(role));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <Badge tone="dark">
          <ShieldCheck size={14} /> Secure DoorStep access
        </Badge>
        <h1>One product, three polished operating modes.</h1>
        <p>
          Customers order, drivers fulfill, and admins run the marketplace from a single
          production-grade platform.
        </p>
        <div className="auth-demo-grid">
          {demoAccounts.map((account) => (
            <button
              className={role === account.role && mode === 'login' ? 'demo-account active' : 'demo-account'}
              key={account.email}
              onClick={() => {
                setMode('login');
                setRole(account.role);
                setEmail(account.email);
                setPassword('Doorstep123!');
              }}
              type="button"
            >
              <strong>{account.label}</strong>
              <span>{account.email}</span>
              <small>{account.description}</small>
            </button>
          ))}
        </div>
      </div>

      <Card className="auth-card">
        <div className="segmented-control" role="tablist" aria-label="Authentication mode">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
            Login
          </button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">
            Register
          </button>
          <button className={mode === 'forgot' || mode === 'otp' ? 'active' : ''} onClick={() => setMode('forgot')} type="button">
            Recover
          </button>
        </div>

        <div className="auth-card-heading">
          {mode === 'login' ? <KeyRound size={22} /> : null}
          {mode === 'register' ? <UserPlus size={22} /> : null}
          {mode === 'forgot' ? <Mail size={22} /> : null}
          {mode === 'otp' ? <Smartphone size={22} /> : null}
          <div>
            <h2>
              {mode === 'login'
                ? 'Welcome back'
                : mode === 'register'
                  ? 'Create your account'
                  : mode === 'forgot'
                    ? 'Reset access'
                    : 'Verify code'}
            </h2>
            <p>Demo password: Doorstep123!</p>
          </div>
        </div>

        {error ? <ErrorBanner message={error} /> : null}

        <form className="form-stack" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <Field label="Full name">
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </Field>
          ) : null}

          {mode !== 'otp' ? (
            <Field label="Email">
              <Input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
          ) : (
            <Field label="Verification code">
              <Input inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} />
            </Field>
          )}

          {mode === 'login' || mode === 'register' ? (
            <Field label="Password">
              <Input
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
          ) : null}

          {mode === 'register' || mode === 'login' ? (
            <Field label="Role">
              <Select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
          ) : null}

          <Button isLoading={isSubmitting} type="submit">
            {mode === 'login'
              ? 'Sign in'
              : mode === 'register'
                ? 'Create account'
                : mode === 'forgot'
                  ? 'Send code'
                  : 'Verify'}
            <ArrowRight size={16} />
          </Button>
        </form>

        <div className="auth-trust-row">
          <span>
            <BadgeCheck size={15} /> JWT auth
          </span>
          <span>Role-based access</span>
          <span>Zod validation</span>
        </div>
      </Card>
    </section>
  );
};
