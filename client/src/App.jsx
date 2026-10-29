import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Loading } from './components/States.jsx';
import AdminPage from './pages/Admin.jsx';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/Auth.jsx';
import { ProfilePage, SavedPage } from './pages/Account.jsx';
import CataloguePage from './pages/Catalogue.jsx';
import DetailPage from './pages/Detail.jsx';
import DiscoverPage from './pages/Discover.jsx';
import { ContactPage, SubmitPage, UnsubscribePage } from './pages/Forms.jsx';
import { HomePage } from './pages/Home.jsx';
import SearchPage from './pages/Search.jsx';
import { AboutPage, NotFoundPage, PrivacyPage, TermsPage } from './pages/SitePages.jsx';

function RouteScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);
  return null;
}

function RequireUser({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="container page-loading"><Loading label="A verificar sessão…" /></div>;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}

function RoutedApp() {
  return <>
    <RouteScrollReset />
    <Layout><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/discover/events" element={<CataloguePage resource="events" />} />
      <Route path="/discover/works" element={<CataloguePage resource="works" />} />
      <Route path="/discover/artists" element={<CataloguePage resource="artists" />} />
      <Route path="/discover/venues" element={<CataloguePage resource="venues" />} />
      <Route path="/events/:slug" element={<DetailPage type="events" />} />
      <Route path="/works/:slug" element={<DetailPage type="works" />} />
      <Route path="/artists/:slug" element={<DetailPage type="artists" />} />
      <Route path="/venues/:slug" element={<DetailPage type="venues" />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/magazine" element={<CataloguePage resource="articles" />} />
      <Route path="/magazine/:slug" element={<DetailPage type="articles" />} />
      <Route path="/collections" element={<CataloguePage resource="collections" />} />
      <Route path="/collections/:slug" element={<DetailPage type="collections" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<RequireUser><ProfilePage /></RequireUser>} />
      <Route path="/saved" element={<RequireUser><SavedPage /></RequireUser>} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/unsubscribe" element={<UnsubscribePage />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes></Layout>
  </>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><RoutedApp /></AuthProvider></BrowserRouter>;
}
