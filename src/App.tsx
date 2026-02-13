import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './context/AppContext';
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuthContext';
import { Header } from './components/Header';

// Lazy load all pages for optimal bundle splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const PCBuilderPage = lazy(() => import('./pages/PCBuilderPage').then(m => ({ default: m.PCBuilderPage })));
const RepairPage = lazy(() => import('./pages/RepairPage').then(m => ({ default: m.RepairPage })));
const TrackRepair = lazy(() => import('./pages/TrackRepair').then(m => ({ default: m.TrackRepair })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const CustomerAuthPage = lazy(() => import('./pages/CustomerAuthPage').then(m => ({ default: m.CustomerAuthPage })));

// Global Loading Component
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#3b82f6] rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">SYSTEM_LOADING...</span>
      </div>
    </div>
  );
}

// Protected Route for Admin
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAdmin, isLoading } = useSupabaseAuth();

  if (isLoading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/admin/login" state={{ from: location }} replace />;

  return <>{children}</>;
}

// Public Route for Admin Login
function PublicAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useSupabaseAuth();

  if (isLoading) return <PageLoader />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}

// Customer Layout with integrated Header
function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/product/:id/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/pc-builder" element={<PCBuilderPage />} />
          <Route path="/repair" element={<RepairPage />} />
          <Route path="/track-repair" element={<TrackRepair />} />
          <Route path="/auth" element={<CustomerAuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// Admin Layout with separate Suspense
function AdminRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicAdminRoute>
              <AdminLogin />
            </PublicAdminRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <SupabaseAuthProvider>
          <AppProvider>
            <Routes>
              {/* Admin Routes (Check specifically first) */}
              <Route path="/admin/*" element={<AdminRoutes />} />

              {/* All other routes go to Customer Layout */}
              <Route path="/*" element={<CustomerLayout />} />
            </Routes>
          </AppProvider>
        </SupabaseAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
