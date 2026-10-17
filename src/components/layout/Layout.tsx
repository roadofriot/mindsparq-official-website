import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SocialCommunityHub } from '../home/SocialCommunityHub';
import { trackPageView } from '../../services/analyticsService';

export const Layout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change & record page analytics
  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(pathname).catch(() => {});
  }, [pathname]);

  const isExcludedPage = 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/forgot') || 
    pathname.startsWith('/reset') ||
    pathname.startsWith('/learner');

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
        {isExcludedPage ? (
          <Outlet />
        ) : (
          <div className="site-main-shell">
            <Outlet />
          </div>
        )}
      </main>
      {!isExcludedPage && <SocialCommunityHub />}
      <Footer />
    </>
  );
};
