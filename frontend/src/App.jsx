import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import SplashScreen from './components/SplashScreen';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

import LoginPage from './pages/LoginPage';
import DashboardAdminPage from './pages/DashboardAdminPage';
import DashboardKasirPage from './pages/DashboardKasirPage';
import ProductsPage from './pages/ProductsPage';
import MaterialsPage from './pages/MaterialsPage';
import ProductionPage from './pages/ProductionPage';
import StockMovementsPage from './pages/StockMovementsPage';
import UsersPage from './pages/UsersPage';
import POSKasirPage from './pages/POSKasirPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner fullPage text="Memeriksa autentikasi..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/pos" replace />;
  }

  return children;
};

const DashboardRouter = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <DashboardAdminPage /> : <DashboardKasirPage />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage text="Memeriksa autentikasi..." />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Auth Routes — blocked if already logged in */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            </Route>

            {/* Protected App Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/pos" element={<POSKasirPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route
                path="/materials"
                element={
                  <ProtectedRoute adminOnly>
                    <MaterialsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/production"
                element={
                  <ProtectedRoute adminOnly>
                    <ProductionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock"
                element={
                  <ProtectedRoute adminOnly>
                    <StockMovementsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route
                path="/users"
                element={
                  <ProtectedRoute adminOnly>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={<Navigate to="/users" replace />}
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute adminOnly>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
    </>
  );
}

export default App;
