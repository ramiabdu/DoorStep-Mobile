import {Link, NavLink, Outlet, useNavigate} from 'react-router-dom';
import {Bike, LayoutDashboard, LogOut, PackageCheck, ShieldCheck, ShoppingBag} from 'lucide-react';

import {useAuth} from '../state/auth';
import {useCart} from '../state/cart';
import {Button} from './ui';

export const AppLayout = () => {
  const {user, logout} = useAuth();
  const {cart} = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">D</span>
          <span>DoorStep</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/restaurants">Restaurants</NavLink>
          <NavLink to="/tracking">Tracking</NavLink>
          <NavLink to="/health">API Health</NavLink>
          {user?.role === 'admin' ? <NavLink to="/admin">Admin</NavLink> : null}
          {user?.role === 'driver' ? <NavLink to="/driver">Driver</NavLink> : null}
        </nav>

        <div className="topbar-actions">
          {user ? (
            <>
              {user.role === 'customer' ? (
                <Link className="cart-pill" to="/cart">
                  <ShoppingBag size={16} />
                  <span>{cart?.items.length ?? 0}</span>
                </Link>
              ) : null}
              <span className="user-chip">
                {user.role === 'admin' ? <ShieldCheck size={14} /> : null}
                {user.role === 'driver' ? <Bike size={14} /> : null}
                {user.role === 'customer' ? <PackageCheck size={14} /> : null}
                {user.name}
              </span>
              <Button aria-label="Sign out" title="Sign out" variant="ghost" onClick={handleLogout}>
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/auth')}>Sign in</Button>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <span>DoorStep Mobile</span>
        <span>Production delivery platform</span>
        <span>
          <LayoutDashboard size={14} /> React + Express + PostgreSQL
        </span>
      </footer>
    </div>
  );
};

