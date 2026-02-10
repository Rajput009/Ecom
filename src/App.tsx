import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AppProvider } from './context/AppContext';
import { SupabaseAuthProvider, useSupabaseAuth } from './context/SupabaseAuthContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { AdminLogin } from './pages/AdminLogin';
import { TrackRepair } from './pages/TrackRepair';

// Lazy load pages
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const PCBuilderPage = lazy(() => import('./pages/PCBuilderPage').then(m => ({ default: m.PCBuilderPage })));
const RepairPage = lazy(() => import('./pages/RepairPage').then(m => ({ default: m.RepairPage })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#3b82f6] rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">Loading...</span>
      </div>
    </div>
  );
}

// Protected Route component for admin
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAdmin, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAdmin) {
    // Redirect to login if not authenticated as admin
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Public Route component - redirects to admin dashboard if already logged in
function PublicAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Main App Layout with Header (for customer routes)
function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/pc-builder" element={<PCBuilderPage />} />
          <Route path="/repair" element={<RepairPage />} />
          <Route path="/track-repair" element={<TrackRepair />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// Admin Routes
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
    <BrowserRouter>
      <SupabaseAuthProvider>
        <AppProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/*" element={<CustomerLayout />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </AppProvider>
      </SupabaseAuthProvider>
    </BrowserRouter>
  );
}

export default App;
