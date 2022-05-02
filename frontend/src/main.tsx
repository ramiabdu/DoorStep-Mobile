import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {createRoot} from 'react-dom/client';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  PackageCheck,
  RadioTower,
  ShieldCheck,
} from 'lucide-react';
import {
  API_BASE_URL,
  ApiDocs,
  ApiHealth,
  AuthResponse,
  AuthUser,
  CatalogHome,
  doorstepApi,
} from './api';
import './styles.css';

type View = 'dashboard' | 'auth' | 'health';
type AuthMode = 'login' | 'register' | 'verify';

const emptyCatalog: CatalogHome = {
  categories: [],
  partners: [],
  deliveryWindows: [],
};

const classNames = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ');

const App = () => {
  const [view, setView] = useState<View>('dashboard');
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [docs, setDocs] = useState<ApiDocs | null>(null);
  const [catalog, setCatalog] = useState<CatalogHome>(emptyCatalog);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [verification, setVerification] = useState<AuthResponse | null>(null);

  const loadPlatform = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [healthResult, docsResult, catalogResult] = await Promise.all([
        doorstepApi.health(),
        doorstepApi.docs(),
        doorstepApi.home(),
      ]);
      setHealth(healthResult);
      setDocs(docsResult);
      setCatalog(catalogResult);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to reach DoorStep API',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlatform();
  }, [loadPlatform]);

  const heroStats = useMemo(
    () => [
      {
        label: 'Active cities',
        value: catalog.operations?.activeCities || 8,
      },
      {
        label: 'On-time rate',
        value: `${catalog.operations?.onTimeRate || 97}%`,
      },
      {
        label: 'Avg handoff',
        value: `${catalog.operations?.avgHandoffMinutes || 31}m`,
      },
    ],
    [catalog.operations],
  );

  const handleAuthComplete = (response: AuthResponse) => {
    if (response.token) {
      setToken(response.token);
      setAuthUser(response.user);
      setVerification(null);
      setAuthMode('login');
      setView('dashboard');
      return;
    }

    setVerification(response);
    setAuthMode('verify');
  };

  return (
    <main>
      <nav className="topbar" aria-label="Primary navigation">
        <button className="brand" onClick={() => setView('dashboard')}>
          <span className="brand-mark">DS</span>
          <span>DoorStep</span>
        </button>
        <div className="nav-actions">
          {(['dashboard', 'health', 'auth'] as View[]).map(item => (
            <button
              key={item}
              className={classNames('nav-link', view === item && 'is-active')}
              onClick={() => setView(item)}>
              {item === 'dashboard'
                ? 'Dashboard'
                : item === 'health'
                  ? 'API Health'
                  : authUser
                    ? 'Account'
                    : 'Login'}
            </button>
          ))}
        </div>
      </nav>

      {view === 'dashboard' ? (
        <Dashboard
          authUser={authUser}
          catalog={catalog}
          error={error}
          health={health}
          heroStats={heroStats}
          loading={loading}
          onAuth={() => setView('auth')}
          onRefresh={loadPlatform}
        />
      ) : null}

      {view === 'auth' ? (
        <AuthPanel
          authMode={authMode}
          authUser={authUser}
          onAuthComplete={handleAuthComplete}
          onModeChange={setAuthMode}
          onSignOut={() => {
            setToken(null);
            setAuthUser(null);
          }}
          setError={setError}
          token={token}
          verification={verification}
        />
      ) : null}

      {view === 'health' ? (
        <HealthPanel
          docs={docs}
          error={error}
          health={health}
          loading={loading}
          onRefresh={loadPlatform}
        />
      ) : null}
    </main>
  );
};

type DashboardProps = {
  authUser: AuthUser | null;
  catalog: CatalogHome;
  error: string | null;
  health: ApiHealth | null;
  heroStats: Array<{label: string; value: string | number}>;
  loading: boolean;
  onAuth: () => void;
  onRefresh: () => void;
};

const Dashboard = ({
  authUser,
  catalog,
  error,
  health,
  heroStats,
  loading,
  onAuth,
  onRefresh,
}: DashboardProps) => (
  <section className="page-grid">
    <div className="hero">
      <div className="eyebrow">
        <RadioTower size={16} />
        Live full-stack demo
      </div>
      <h1>Doorstep operations, from verified account to tracked delivery.</h1>
      <p>
        A production-shaped React dashboard connected to the DoorStep API on
        Render, built for portfolio review and deployment verification.
      </p>
      <div className="hero-actions">
        <button className="primary-button" onClick={onAuth}>
          {authUser ? 'View account' : 'Test auth flow'}
          <ArrowRight size={18} />
        </button>
        <button className="secondary-button" onClick={onRefresh}>
          Refresh API
        </button>
      </div>
      <div className="stats-grid">
        {heroStats.map(stat => (
          <div className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>

    <aside className="status-panel">
      <StatusBadge
        label={health?.status === 'ok' ? 'API online' : 'API unavailable'}
        tone={health?.status === 'ok' ? 'good' : 'bad'}
      />
      <h2>Deployment target</h2>
      <code>{API_BASE_URL}</code>
      <p>
        {loading
          ? 'Checking live platform status...'
          : error || `Last checked ${new Date(health?.timestamp || Date.now()).toLocaleString()}`}
      </p>
    </aside>

    <section className="section-card wide">
      <div className="section-title">
        <PackageCheck size={20} />
        <h2>Service catalog</h2>
      </div>
      <div className="service-grid">
        {catalog.categories.map(category => (
          <article
            className="service-card"
            key={category.id}
            style={{borderColor: category.accent || '#177a5b'}}>
            <span>{category.etaMinutes} min avg</span>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="section-card">
      <div className="section-title">
        <ClipboardList size={20} />
        <h2>Partner network</h2>
      </div>
      <div className="partner-list">
        {catalog.partners.map(partner => (
          <div className="partner-row" key={partner.id}>
            <div>
              <strong>{partner.name}</strong>
              <span>
                {partner.deliveryMinutes}m · {partner.distanceKm}km ·{' '}
                {partner.rating} rating
              </span>
            </div>
            <StatusBadge label={partner.open ? 'Open' : 'Closed'} tone="good" />
          </div>
        ))}
      </div>
    </section>

    <section className="section-card">
      <div className="section-title">
        <ShieldCheck size={20} />
        <h2>Production posture</h2>
      </div>
      <ul className="check-list">
        <li>CORS configurable by environment</li>
        <li>Render API URL configured for the web client</li>
        <li>Vercel and Netlify deployment files included</li>
        <li>CI verifies lint, typecheck, and frontend build</li>
      </ul>
    </section>
  </section>
);

type AuthPanelProps = {
  authMode: AuthMode;
  authUser: AuthUser | null;
  onAuthComplete: (response: AuthResponse) => void;
  onModeChange: (mode: AuthMode) => void;
  onSignOut: () => void;
  setError: (message: string | null) => void;
  token: string | null;
  verification: AuthResponse | null;
};

const AuthPanel = ({
  authMode,
  authUser,
  onAuthComplete,
  onModeChange,
  onSignOut,
  setError,
  token,
  verification,
}: AuthPanelProps) => {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: 'DoorStep Reviewer',
    email: 'reviewer@example.com',
    phone: '+1555010142',
    password: 'doorstep-demo',
    defaultAddress: '221 Market Street',
    code: '',
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm(current => ({...current, [key]: value}));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response =
        authMode === 'register'
          ? await doorstepApi.register(form)
          : authMode === 'verify' && verification?.verificationId
            ? await doorstepApi.verifyOtp({
                verificationId: verification.verificationId,
                code: form.code,
              })
            : await doorstepApi.login({
                email: form.email,
                password: form.password,
              });
      onAuthComplete(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Authentication request failed',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <div className="eyebrow">
          <LockKeyhole size={16} />
          Secure account flow
        </div>
        <h1>Login, registration, and OTP verification against the live API.</h1>
        <p>
          The UI calls the Render backend directly. Demo OTP can be enabled on
          the backend with <code>DEMO_OTP_ENABLED=true</code> for portfolio
          walkthroughs.
        </p>
        {authUser ? (
          <div className="account-card">
            <CheckCircle2 />
            <div>
              <strong>{authUser.name}</strong>
              <span>{authUser.email}</span>
              <small>Token active: {token ? 'yes' : 'no'}</small>
            </div>
          </div>
        ) : null}
      </div>

      <form className="auth-card" onSubmit={submit}>
        <div className="tabs">
          <button
            type="button"
            className={classNames(authMode === 'login' && 'is-active')}
            onClick={() => onModeChange('login')}>
            Login
          </button>
          <button
            type="button"
            className={classNames(authMode === 'register' && 'is-active')}
            onClick={() => onModeChange('register')}>
            Register
          </button>
          <button
            type="button"
            className={classNames(authMode === 'verify' && 'is-active')}
            onClick={() => onModeChange('verify')}
            disabled={!verification?.verificationId}>
            Verify
          </button>
        </div>

        {authMode === 'register' ? (
          <>
            <Field
              label="Full name"
              value={form.name}
              onChange={value => update('name', value)}
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={value => update('phone', value)}
            />
          </>
        ) : null}

        {authMode !== 'verify' ? (
          <>
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={value => update('email', value)}
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={value => update('password', value)}
            />
          </>
        ) : (
          <>
            <Field
              label="Verification code"
              value={form.code}
              onChange={value => update('code', value)}
            />
            {verification?.debug?.otp ? (
              <div className="demo-otp">
                Demo OTP: <strong>{verification.debug.otp}</strong>
              </div>
            ) : null}
          </>
        )}

        {authMode === 'register' ? (
          <Field
            label="Default address"
            value={form.defaultAddress}
            onChange={value => update('defaultAddress', value)}
          />
        ) : null}

        <button className="primary-button full-width" disabled={busy}>
          {busy
            ? 'Working...'
            : authMode === 'register'
              ? 'Create account'
              : authMode === 'verify'
                ? 'Verify OTP'
                : 'Login'}
        </button>

        {authUser ? (
          <button
            className="secondary-button full-width"
            type="button"
            onClick={onSignOut}>
            Sign out
          </button>
        ) : null}
      </form>
    </section>
  );
};

type HealthPanelProps = {
  docs: ApiDocs | null;
  error: string | null;
  health: ApiHealth | null;
  loading: boolean;
  onRefresh: () => void;
};

const HealthPanel = ({
  docs,
  error,
  health,
  loading,
  onRefresh,
}: HealthPanelProps) => (
  <section className="health-layout">
    <div className="section-card">
      <div className="section-title">
        <Activity size={20} />
        <h1>API health</h1>
      </div>
      <StatusBadge
        label={health?.status === 'ok' ? 'Operational' : 'Unavailable'}
        tone={health?.status === 'ok' ? 'good' : 'bad'}
      />
      <dl className="definition-list">
        <div>
          <dt>Base URL</dt>
          <dd>{API_BASE_URL}</dd>
        </div>
        <div>
          <dt>Service</dt>
          <dd>{health?.service || 'doorstep-api'}</dd>
        </div>
        <div>
          <dt>Last response</dt>
          <dd>{health?.timestamp || error || 'No response yet'}</dd>
        </div>
      </dl>
      <button className="primary-button" disabled={loading} onClick={onRefresh}>
        {loading ? 'Checking...' : 'Run health check'}
      </button>
    </div>

    <div className="section-card">
      <div className="section-title">
        <ClipboardList size={20} />
        <h2>API docs</h2>
      </div>
      <div className="endpoint-list">
        {(docs?.endpoints || []).map(endpoint => (
          <div className="endpoint-row" key={`${endpoint.method}-${endpoint.path}`}>
            <code>{endpoint.method}</code>
            <span>{endpoint.path}</span>
            <small>{endpoint.auth ? 'Bearer auth' : 'Public'}</small>
          </div>
        ))}
      </div>
    </div>
  </section>
);

type FieldProps = {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
};

const Field = ({label, onChange, type = 'text', value}: FieldProps) => (
  <label className="field">
    <span>{label}</span>
    <input
      autoComplete="off"
      onChange={event => onChange(event.target.value)}
      type={type}
      value={value}
    />
  </label>
);

const StatusBadge = ({label, tone}: {label: string; tone: 'good' | 'bad'}) => (
  <span className={classNames('status-badge', tone === 'bad' && 'is-bad')}>
    {label}
  </span>
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
