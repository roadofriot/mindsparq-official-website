import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isStaff, isAdmin, isSuperAdmin, refreshProfile, loading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

        // 2. PKCE code exchange
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError && isMounted) {
            setErrorMsg(exchangeError.message);
            return;
          }
        }

        // 3. Resolve session (also handles URL hash fragments automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError && isMounted) {
          setErrorMsg(sessionError.message);
          return;
        }

        if (session?.user) {
          await refreshProfile();
        }
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMsg((err as Error).message || 'Authentication verification failed.');
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [refreshProfile]);

  // Navigate once user and roles are resolved
  useEffect(() => {
    if (!loading && user) {
      if (isStaff || isAdmin || isSuperAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/learner', { replace: true });
      }
    }
  }, [loading, user, isStaff, isAdmin, isSuperAdmin, navigate]);

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
