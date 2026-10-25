import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SiteLayout, RequireAuth, PublicOnly } from './components/layouts';
import { useAuth } from './lib/useAuth';
import { Spinner } from './components/ui';

const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Locations = lazy(() => import('./pages/Locations'));
const Explore = lazy(() => import('./pages/Explore'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ListProperty = lazy(() => import('./pages/ListProperty'));
const TenantDashboard = lazy(() => import('./pages/dashboards/TenantDashboard'));
const OwnerDashboard = lazy(() => import('./pages/dashboards/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Legal = lazy(() => import('./pages/Legal'));

const Loader = () => (
  <div className="flex min-h-[70vh] items-center justify-center bg-paper">
    <div className="text-center">
      <span className="mx-auto mb-4 block h-12 w-12 rounded-full border border-ink/20" />
      <Spinner className="mx-auto h-6 w-6 text-clay" />
    </div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetail />} />
          <Route path="locations" element={<Locations />} />
          <Route path="explore" element={<Explore />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Legal kind="privacy" />} />
          <Route path="terms" element={<Legal kind="terms" />} />
          <Route path="list-property" element={<ListProperty />} />

          <Route path="profile" element={<ProfileRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* dashboards are standalone apps — no marketing chrome */}
        <Route path="tenant/*" element={<RequireAuth roles={['TENANT']}><TenantDashboard /></RequireAuth>} />
        <Route path="owner/*" element={<RequireAuth roles={['OWNER']}><OwnerDashboard /></RequireAuth>} />
        <Route path="admin/*" element={<RequireAuth roles={['ADMIN']}><AdminDashboard /></RequireAuth>} />

        {/* public only */}
        <Route path="login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="register" element={<PublicOnly><Register /></PublicOnly>} />
      </Routes>
    </Suspense>
  );
}

function ProfileRedirect() {
  const { home } = useAuth();
  return <Navigate to={home} replace />;
}
