import {Navigate, Route, Routes} from 'react-router-dom';

import {AppLayout} from './components/Layout';
import {AdminExperience} from './pages/admin/AdminExperience';
import {AuthExperience} from './pages/auth/AuthExperience';
import {DriverDashboard} from './pages/DriverDashboard';
import {HealthPage} from './pages/HealthPage';
import {AccountPage} from './pages/customer/AccountPages';
import {CheckoutPage} from './pages/customer/CheckoutPage';
import {HomePage} from './pages/customer/HomePage';
import {OrderTrackingPage} from './pages/customer/OrderTrackingPage';
import {StoreDetailsPage} from './pages/customer/StoreDetailsPage';
import {StoreListingPage} from './pages/customer/StoreListingPage';
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
          <Route index element={<HomePage />} />
          <Route path="auth" element={<AuthExperience />} />
          <Route path="onboarding" element={<AuthExperience />} />
          <Route path="login" element={<AuthExperience />} />
          <Route path="register" element={<AuthExperience />} />
          <Route path="forgot-password" element={<AuthExperience />} />
          <Route path="verify-otp" element={<AuthExperience />} />
          <Route path="restaurants" element={<StoreListingPage type="restaurant" />} />
          <Route path="supermarkets" element={<StoreListingPage type="supermarket" />} />
          <Route path="stores" element={<StoreListingPage />} />
          <Route path="stores/:storeId" element={<StoreDetailsPage />} />
          <Route path="restaurants/:storeId" element={<StoreDetailsPage />} />
          <Route path="categories" element={<StoreListingPage />} />
          <Route path="search" element={<StoreListingPage />} />
          <Route path="cart" element={<CheckoutPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success" element={<CheckoutPage />} />
          <Route path="tracking" element={<OrderTrackingPage />} />
          <Route path="orders" element={<AccountPage kind="orders" />} />
          <Route path="orders/:orderId" element={<OrderTrackingPage />} />
          <Route path="favorites" element={<AccountPage kind="favorites" />} />
          <Route path="offers" element={<AccountPage kind="offers" />} />
          <Route path="notifications" element={<AccountPage kind="notifications" />} />
          <Route path="profile" element={<AccountPage kind="profile" />} />
          <Route path="addresses" element={<AccountPage kind="addresses" />} />
          <Route path="payments" element={<AccountPage kind="payments" />} />
          <Route path="settings" element={<AccountPage kind="settings" />} />
          <Route path="admin" element={<AdminExperience />} />
          <Route path="admin/stores" element={<AdminExperience />} />
          <Route path="admin/products" element={<AdminExperience />} />
          <Route path="admin/orders" element={<AdminExperience />} />
          <Route path="admin/users" element={<AdminExperience />} />
          <Route path="admin/analytics" element={<AdminExperience />} />
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
