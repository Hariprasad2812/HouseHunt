import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useAuth } from '../lib/useAuth';
import { Spinner } from './ui';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export const SiteLayout = () => (
  <>
    <ScrollToTop />
    <Navbar />
    <main className="min-h-[70vh]">
      <Outlet />
    </main>
    <Footer />
  </>
);

export const AuthShell = ({ children }) => (
  <>
    <ScrollToTop />
    <Navbar />
    <main>{children}</main>
  </>
);

export function RequireAuth({ children, roles }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-7 w-7 text-clay" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'ADMIN' ? '/admin' : user.role === 'OWNER' ? '/owner' : '/tenant';
    return <Navigate to={fallback} replace />;
  }
  return children;
}

export const PublicOnly = ({ children }) => {
  const { user, ready } = useAuth();
  if (!ready) return <div className="flex min-h-[50vh] items-center justify-center"><Spinner className="h-6 w-6" /></div>;
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'OWNER' ? '/owner' : '/tenant'} replace />;
  }
  return children;
};
