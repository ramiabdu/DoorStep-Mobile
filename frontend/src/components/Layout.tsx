import {Bell, Home, LayoutDashboard, LogOut, MapPin, PackageCheck, Search, Settings, ShieldCheck, ShoppingBag, Store, UserRound} from 'lucide-react';
import {Link, NavLink, Outlet, useNavigate} from 'react-router-dom';

import {useAuth} from '../state/useAuth';
import {useCart} from '../state/useCart';
import {Button} from './ui';

const customerLinks = [
  {to: '/', label: 'Home'},
  {to: '/restaurants', label: 'Restaurants'},
  {to: '/supermarkets', label: 'Supermarkets'},
  {to: '/offers', label: 'Offers'},
  {to: '/tracking', label: 'Tracking'}
];

export const AppLayout = () => {
  const {user, logout} = useAuth();
  const {cart} = useCart();
  const navigate = useNavigate();
  const cartQuantity = cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">D</span>
          <span>
            DoorStep
            <small>Market in minutes</small>
          </span>
        </Link>

        <button className="location-chip" type="button">
          <MapPin size={16} />
          <span>Berlin Mitte</span>
        </button>

        <nav className="nav-links" aria-label="Main navigation">
          {customerLinks.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          {user?.role === 'admin' ? <NavLink to="/admin">Admin</NavLink> : null}
          {user?.role === 'driver' ? <NavLink to="/driver">Driver</NavLink> : null}
        </nav>

        <div className="topbar-actions">
          <Button aria-label="Search" title="Search" size="icon" variant="ghost" onClick={() => navigate('/search')}>
            <Search size={17} />
          </Button>
          <Button aria-label="Notifications" title="Notifications" size="icon" variant="ghost" onClick={() => navigate('/notifications')}>
            <Bell size={17} />
          </Button>
          <Link className="cart-pill" to="/cart" aria-label="Cart">
            <ShoppingBag size={16} />
            <span>{cartQuantity}</span>
          </Link>
          {user ? (
            <>
              <Link className="user-chip" to="/profile">
                {user.role === 'admin' ? <ShieldCheck size={14} /> : null}
                {user.role === 'driver' ? <PackageCheck size={14} /> : null}
                {user.role === 'customer' ? <UserRound size={14} /> : null}
                <span>{user.name}</span>
              </Link>
              <Button aria-label="Sign out" title="Sign out" variant="ghost" size="icon" onClick={handleLogout}>
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

      <nav className="bottom-nav" aria-label="Mobile navigation">
        <NavLink to="/">
          <Home size={19} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/restaurants">
          <Store size={19} />
          <span>Stores</span>
        </NavLink>
        <NavLink to="/cart">
          <ShoppingBag size={19} />
          <span>Cart</span>
        </NavLink>
        <NavLink to={user?.role === 'admin' ? '/admin' : '/profile'}>
          {user?.role === 'admin' ? <LayoutDashboard size={19} /> : <Settings size={19} />}
          <span>{user?.role === 'admin' ? 'Admin' : 'Profile'}</span>
        </NavLink>
      </nav>
    </div>
  );
};
