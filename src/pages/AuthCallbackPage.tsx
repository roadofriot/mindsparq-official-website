import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isStaff, isAdmin, isSuperAdmin, refreshProfile } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const redirected = useRef(false);

  const routeUser = (email?: string, staff?: boolean) => {
    if (redirected.current) return;
    redirected.current = true;

    const userEmail = email?.toLowerCase();
    const isOwnerOrStaff = staff || userEmail === 'merokhoj@gmail.com' || userEmail === 'roadofriot@gmail.com';

    if (isOwnerOrStaff) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/learner', { replace: true });
    }
  };

  useEffect(() => {
    let active = true;

    // Check for OAuth error parameter in URL
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get('error_description') || searchParams.get('error');
    if (errorParam) {
      if (active) setErrorMsg(errorParam);
      return;
    }

    // 1. If user is already active in AuthContext, navigate immediately
    if (user) {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      routeUser(user.email, isStaff || isAdmin || isSuperAdmin);
      return;
    }

    // 2. Check existing session first (Supabase detectSessionInUrl handles implicit hash tokens automatically)
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!active || redirected.current) return;
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      if (session?.user) {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        await refreshProfile();
        routeUser(session.user.email, isStaff || isAdmin || isSuperAdmin);
        return;
      }

      // If no session detected yet but hash tokens exist, fallback to explicit setSession only if getSession had no session
      if (window.location.hash && window.location.hash.includes('access_token')) {
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          window.history.replaceState(null, '', window.location.pathname);
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          }).then(async ({ data, error: setErr }) => {
            if (!active || redirected.current) return;
            if (setErr) {
              setErrorMsg(setErr.message);
            } else if (data?.user) {
              await refreshProfile();
              routeUser(data.user?.email, true);
            }
          });
        }
      }
    });

    // 3. Listen for Supabase session establishment
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active || redirected.current) return;
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        await refreshProfile();
        routeUser(session.user.email, isStaff || isAdmin || isSuperAdmin);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [user, isStaff, isAdmin, isSuperAdmin, refreshProfile, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-4)',
        textAlign: 'center',
        padding: 'var(--space-8)'
      }}
    >
      {errorMsg ? (
        <div
          className="card"
          style={{
            maxWidth: '440px',
            padding: 'var(--space-6)',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            backgroundColor: 'var(--color-surface)'
          }}
        >
          <h3 style={{ color: '#ef4444', marginBottom: 'var(--space-2)' }}>Authentication Notice</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
            {errorMsg}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/login', { replace: true })}
          >
            Return to Login
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-brand-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <h2 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Authenticating with MindSparQ...</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', margin: 0 }}>
            Verifying your security credentials and preparing your dashboard.
          </p>
        </>
      )}
    </div>
  );
};
