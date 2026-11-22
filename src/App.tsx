import { lazy, Suspense } from 'react';
import { createBrowserRouter, createHashRouter, RouterProvider, Outlet } from 'react-router-dom';

// the single-file build (npm run build:single) is opened straight from disk, where only
// hash URLs (index.html#/categories) can address pages
const createRouter = import.meta.env.MODE === 'single' ? createHashRouter : createBrowserRouter;
import { Layout, Toaster } from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import ProductPage from '@/pages/ProductPage';
import NotFoundPage from '@/pages/NotFoundPage';

const CartPage = lazy(() => import('@/pages/CartPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const PolicyPage = lazy(() => import('@/pages/PolicyPage'));const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const VerifyPage = lazy(() => import('@/pages/auth/VerifyPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const AccountShell = lazy(() => import('@/pages/account/AccountShell'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'));
const LoyaltyPage = lazy(() => import('@/pages/account/LoyaltyPage'));
const FavoritesPage = lazy(() => import('@/pages/account/FavoritesPage'));
const CardsPage = lazy(() => import('@/pages/account/CardsPage'));
const GamePage = lazy(() => import('@/pages/GamePage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));

function Shell() {
  return (
    <>
      <Suspense fallback={<div className="min-h-[100dvh] bg-bg" />}>
        <Outlet />
      </Suspense>
      <Toaster />
    </>
  );
}

const router = createRouter([
  {
    element: <Shell />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/categories', element: <CatalogPage /> },
          { path: '/categories/:slug', element: <CatalogPage /> },
          { path: '/apps', element: <CatalogPage fixedSlug="digital-stores" title="متجر التطبيقات" /> },
          { path: '/offers', element: <CatalogPage fixedSlug="all" title="العروض" offersOnly /> },
          { path: '/game/:slug', element: <GamePage /> },
          { path: '/product/:slug', element: <ProductPage /> },
          { path: '/cart', element: <CartPage /> },
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/contact', element: <ContactPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/faq', element: <FaqPage /> },          { path: '/privacy', element: <PolicyPage kind="privacy" /> },
          { path: '/terms', element: <PolicyPage kind="terms" /> },
          { path: '/refund', element: <PolicyPage kind="refund" /> },
          {
            path: '/account',
            element: <AccountShell />,
            children: [
              { index: true, element: <ProfilePage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'loyalty', element: <LoyaltyPage /> },
              { path: 'favorites', element: <FavoritesPage /> },
              { path: 'cards', element: <CardsPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      // Auth screens use their own full-bleed shell
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/verify', element: <VerifyPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
