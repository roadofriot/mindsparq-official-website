import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isStaff, isAdmin, isSuperAdmin, refreshProfile } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const redirected = useRef(false);
  const started = useRef(false);

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
    if (started.current) return;
    started.current = true;

    let active = true;

    const processAuth = async () => {
      try {
        // 1. Check for OAuth error parameter in URL
        const searchParams = new URLSearchParams(window.location.search);
        const errorParam = searchParams.get('error_description') || searchParams.get('error');
        if (errorParam) {
          if (active) setErrorMsg(errorParam);
          return;
        }

        // 2. If user is already active in AuthContext, navigate immediately
        if (user) {
          if (window.location.hash || window.location.search) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          routeUser(user.email, isStaff || isAdmin || isSuperAdmin);
          return;
        }

        // 3. Handle PKCE code flow (?code=...)
        const code = searchParams.get('code');
        if (code) {
          const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.warn('[MindSparQ Auth] PKCE exchange warning:', exchangeErr.message);
            // Verify if session was concurrently acquired
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            if (existingSession?.user && active) {
              window.history.replaceState(null, '', window.location.pathname);
              await refreshProfile();
              routeUser(existingSession.user.email, isStaff || isAdmin || isSuperAdmin);
              return;
            }
            if (active) setErrorMsg(exchangeErr.message);
            return;
          }

          if (data?.session?.user && active) {
            window.history.replaceState(null, '', window.location.pathname);
            await refreshProfile();
            routeUser(data.session.user.email, isStaff || isAdmin || isSuperAdmin);
            return;
          }
        }

        // 4. Handle implicit tokens in hash (#access_token=...)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const hash = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (setErr) {
              console.warn('[MindSparQ Auth] SetSession warning:', setErr.message);
              const { data: { session: existingSession } } = await supabase.auth.getSession();
              if (existingSession?.user && active) {
                window.history.replaceState(null, '', window.location.pathname);
                await refreshProfile();
                routeUser(existingSession.user.email, isStaff || isAdmin || isSuperAdmin);
                return;
              }
              if (active) setErrorMsg(setErr.message);
              return;
            }

            if (data?.session?.user && active) {
              window.history.replaceState(null, '', window.location.pathname);
              await refreshProfile();
              routeUser(data.session.user.email, isStaff || isAdmin || isSuperAdmin);
              return;
            }
          }
        }

        // 5. Check if session was already detected by client
        const { data: { session: currentSession }, error: getSessionErr } = await supabase.auth.getSession();
        if (getSessionErr && active) {
          setErrorMsg(getSessionErr.message);
          return;
        }

        if (currentSession?.user && active) {
          if (window.location.hash || window.location.search) {
            window.history.replaceState(null, '', window.location.pathname);
          }
          await refreshProfile();
          routeUser(currentSession.user.email, isStaff || isAdmin || isSuperAdmin);
          return;
        }
      } catch (err: unknown) {
        if (active) {
          setErrorMsg((err as Error).message || 'An unexpected error occurred during authentication.');
        }
      }
    };

    processAuth();

    // 6. Listen for Supabase session establishment
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active || redirected.current) return;
      if (session?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        if (window.location.hash || window.location.search) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        await refreshProfile();
        routeUser(session.user.email, isStaff || isAdmin || isSuperAdmin);
      }
    });

    // 7. Safety timeout: if neither error nor session resolves in 6 seconds, show return to login
    const timeoutTimer = setTimeout(async () => {
      if (!active || redirected.current) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        routeUser(session.user.email, isStaff || isAdmin || isSuperAdmin);
      } else {
        setErrorMsg('Authentication timed out or could not be verified. Please return to login and try again.');
      }
    }, 6000);

    return () => {
      active = false;
      clearTimeout(timeoutTimer);
      subscription.unsubscribe();
    };
  }, []); // Run once on mount to prevent infinite re-render loops

  // Watch for AuthContext user updates
  useEffect(() => {
    if (user && !redirected.current) {
      routeUser(user.email, isStaff || isAdmin || isSuperAdmin);
    }
  }, [user, isStaff, isAdmin, isSuperAdmin]);

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
