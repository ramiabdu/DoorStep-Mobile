import {Navigate, Route, Routes} from 'react-router-dom';

import {AppLayout} from './components/Layout';
import {AdminDashboard} from './pages/AdminDashboard';
import {AuthPage} from './pages/AuthPage';
import {CartPage} from './pages/CartPage';
import {CustomerDashboard} from './pages/CustomerDashboard';
import {DriverDashboard} from './pages/DriverDashboard';
import {HealthPage} from './pages/HealthPage';
import {LandingPage} from './pages/LandingPage';
import {RestaurantPage} from './pages/RestaurantPage';
import {TrackingPage} from './pages/TrackingPage';
import {AuthProvider} from './state/auth';
import {CartProvider} from './state/cart';
import {useAuth} from './state/useAuth';

const AppRoutes = () => {
  const {isReady} = useAuth();

  if (!isReady) {
    return <div className="boot-screen">Preparing DoorStep...</div>;
  }

  return (
    <CartProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="restaurants" element={<CustomerDashboard />} />
          <Route path="restaurants/:restaurantId" element={<RestaurantPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="driver" element={<DriverDashboard />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </CartProvider>
  );
};

export const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);
