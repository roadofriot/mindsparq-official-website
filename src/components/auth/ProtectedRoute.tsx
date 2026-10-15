import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleKey } from '../../types/database';
import { Capability } from '../../lib/permissions';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: RoleKey;
  requiredCapability?: Capability;
  requireStaff?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredCapability,
  requireStaff = false
}) => {
  const { user, loading, roles, hasRole, hasPermission, isStaff } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 'var(--space-4)'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary-600)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
          Verifying security credentials...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to={`/auth?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Check required staff status
  if (requireStaff && !isStaff) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', maxWidth: '600px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            marginBottom: 'var(--space-4)'
          }}
        >
          <Lock size={36} />
        </div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
          Staff Authorization Required
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
          Your current account is registered with learner privileges. Administrative console modules and publishing controls require staff role assignment from an organization administrator.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Home size={18} /> Return Home
          </Link>
          <Link to="/learner" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ArrowLeft size={18} /> Learner Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Check specific required role
  if (requiredRole && !hasRole(requiredRole) && !roles.includes('owner')) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', maxWidth: '600px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            marginBottom: 'var(--space-4)'
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
          Access Restricted
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          This operation requires the explicit <strong>{requiredRole}</strong> role.
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Website
        </Link>
      </div>
    );
  }

  // Check specific capability
  if (requiredCapability && !hasPermission(requiredCapability)) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', maxWidth: '600px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            marginBottom: 'var(--space-4)'
          }}
        >
          <Lock size={36} />
        </div>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-3)' }}>
          Permission Denied
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          Missing capability: <code>{requiredCapability}</code>
        </p>
        <Link to="/" className="btn btn-primary">
          Return to Website
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
