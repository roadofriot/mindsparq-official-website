import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public core pages (loaded immediately for fast initial rendering)
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

// Learning Platform pages (code-split)
const CoursesPage = lazy(() => import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage })));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const LessonViewPage = lazy(() => import('./pages/LessonViewPage').then((m) => ({ default: m.LessonViewPage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then((m) => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const LearnerDashboardPage = lazy(() => import('./pages/LearnerDashboardPage').then((m) => ({ default: m.LearnerDashboardPage })));

// CMS Admin Console (code-split)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminCarouselPage = lazy(() => import('./pages/admin/AdminCarouselPage').then((m) => ({ default: m.AdminCarouselPage })));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage').then((m) => ({ default: m.AdminMediaPage })));
const AdminProgramsPage = lazy(() => import('./pages/admin/AdminProgramsPage').then((m) => ({ default: m.AdminProgramsPage })));
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage').then((m) => ({ default: m.AdminCoursesPage })));
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage').then((m) => ({ default: m.AdminBlogPage })));
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage').then((m) => ({ default: m.AdminEventsPage })));
const AdminCommentsPage = lazy(() => import('./pages/admin/AdminCommentsPage').then((m) => ({ default: m.AdminCommentsPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminAiAssistantPage = lazy(() => import('./pages/admin/AdminAiAssistantPage').then((m) => ({ default: m.AdminAiAssistantPage })));
const AdminSectionsPage = lazy(() => import('./pages/admin/AdminSectionsPage').then((m) => ({ default: m.AdminSectionsPage })));
const AdminDesignPage = lazy(() => import('./pages/admin/AdminDesignPage').then((m) => ({ default: m.AdminDesignPage })));
const AdminAdsPage = lazy(() => import('./pages/admin/AdminAdsPage').then((m) => ({ default: m.AdminAdsPage })));
const PreviewPage = lazy(() => import('./pages/PreviewPage').then((m) => ({ default: m.PreviewPage })));
import { applyDesignSettingsToDOM } from './services/siteCustomizerService';


const RouteLoadingSpinner: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh'
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary-600)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  </div>
);

export const App: React.FC = () => {
  useEffect(() => {
    applyDesignSettingsToDOM();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
          <Suspense fallback={<RouteLoadingSpinner />}>
            <Routes>
              {/* Main Public Website Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="programs" element={<ProgramsPage />} />
                
                {/* Courses & Lessons */}
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:slug" element={<CourseDetailPage />} />
                <Route
                  path="courses/:courseSlug/lessons/:lessonSlug"
                  element={
                    <ProtectedRoute>
                      <LessonViewPage />
                    </ProtectedRoute>
                  }
                />

                {/* Events & Workshops */}
                <Route path="events" element={<EventsPage />} />
                <Route path="events/:slug" element={<EventDetailPage />} />

                {/* Blog & Community */}
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:slug" element={<BlogPostPage />} />

                {/* General Pages */}
                <Route path="contact" element={<ContactPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="auth" element={<AuthPage />} />
                <Route path="auth/callback" element={<AuthCallbackPage />} />
                <Route path="login" element={<AuthPage initialMode="signin" />} />
                <Route path="forgot-password" element={<AuthPage initialMode="forgot" />} />
                <Route path="reset-password" element={<AuthPage initialMode="forgot" />} />

                {/* Learner Dashboard */}
                <Route
                  path="learner"
                  element={
                    <ProtectedRoute>
                      <LearnerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Private Draft Preview & Device Frame Simulator */}
              <Route path="/preview" element={<PreviewPage />} />

              {/* CMS Admin Console (Staff Authorization Required) */}

              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireStaff>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="ai-assistant" element={<AdminAiAssistantPage />} />
                <Route path="sections" element={<AdminSectionsPage />} />
                <Route path="design" element={<AdminDesignPage />} />
                <Route path="carousel" element={<AdminCarouselPage />} />
                <Route path="ads" element={<AdminAdsPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="programs" element={<AdminProgramsPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="blog" element={<AdminBlogPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="comments" element={<AdminCommentsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="audit" element={<AdminAuditLogsPage />} />
                <Route path="audit-log" element={<AdminAuditLogsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
  );
};

export default App;
