import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { trackPageView } from '../../services/analyticsService';

export const Layout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change & record page analytics
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(pathname).catch(() => {});
  }, [pathname]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
