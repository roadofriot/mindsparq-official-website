import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isStaff, isAdmin, isSuperAdmin, refreshProfile } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  const doRedirect = (targetUserEmail?: string, staffStatus?: boolean) => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;

    const email = targetUserEmail?.toLowerCase();
    const isOwner = staffStatus || email === 'merokhoj@gmail.com' || email === 'roadofriot@gmail.com';

    if (isOwner) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/learner', { replace: true });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // 1. Check for errors in URL
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error_description') || params.get('error');
        if (error) {
          if (isMounted) setErrorMsg(error);
          return;
        }

        // 2. Handle PKCE code exchange
        const code = params.get('code');
        if (code) {
          const { data: codeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError && isMounted) {
            setErrorMsg(exchangeError.message);
            return;
          }
          if (codeData?.user) {
            await refreshProfile();
            doRedirect(codeData.user.email, true);
            return;
          }
        }

        // 3. Handle Implicit OAuth Hash Fragments (#access_token=...&refresh_token=...)
        if (window.location.hash && window.location.hash.includes('access_token')) {
          const hashString = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(hashString);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken) {
            const { data: hashData, error: hashError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (!hashError && hashData?.user) {
              await refreshProfile();
              doRedirect(hashData.user.email, true);
              return;
            }
          }
        }

        // 4. Fallback: Check existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError && isMounted) {
          setErrorMsg(sessionError.message);
          return;
        }

        if (session?.user) {
          await refreshProfile();
          doRedirect(session.user.email, isStaff || isAdmin || isSuperAdmin);
        } else {
          // If after 3 seconds still no session, redirect to login
          setTimeout(() => {
            if (isMounted && !redirectedRef.current) {
              navigate('/login', { replace: true });
            }
          }, 3000);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMsg((err as Error).message || 'Authentication verification failed.');
        }
      }
    };

    handleCallback();

    // Listen for auth state change event as reactive safeguard
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user && isMounted) {
        await refreshProfile();
        doRedirect(session.user.email, isStaff || isAdmin || isSuperAdmin);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile, navigate, isStaff, isAdmin, isSuperAdmin]);

  // If user prop is already present in context
  useEffect(() => {
    if (user) {
      doRedirect(user.email, isStaff || isAdmin || isSuperAdmin);
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
