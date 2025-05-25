import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import CheckoutLayout from './layouts/CheckoutLayout';

// Pages - Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages - Admin
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailsPage from './pages/admin/OrderDetailsPage';
import CustomersPage from './pages/admin/CustomersPage';
import CustomerDetailsPage from './pages/admin/CustomerDetailsPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Pages - Checkout
import CheckoutPage from './pages/checkout/CheckoutPage';
import UpsellPage from './pages/checkout/UpsellPage';
import ThankYouPage from './pages/checkout/ThankYouPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-krava-green"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductFormPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Checkout Routes */}
      <Route element={<CheckoutLayout />}>
        <Route path="/checkout/:slug" element={<CheckoutPage />} />
        <Route path="/checkout/:slug/upsell" element={<UpsellPage />} />
        <Route path="/checkout/:slug/thank-you" element={<ThankYouPage />} />
      </Route>
      
      {/* Redirect root to admin dashboard if logged in, otherwise to login */}
      <Route 
        path="/" 
        element={<Navigate to="/admin/dashboard" replace />} 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;