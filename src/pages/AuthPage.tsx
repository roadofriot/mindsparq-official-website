import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'signin' }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isStaff, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub, resetPassword, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isOwnerEmail = Boolean(
    user?.email && (
      user.email.toLowerCase() === 'merokhoj@gmail.com' ||
      user.email.toLowerCase() === 'roadofriot@gmail.com'
    )
  );
  const defaultDest = (isStaff || isOwnerEmail) ? '/admin' : '/learner';
  const returnUrl = searchParams.get('returnUrl') || defaultDest;

  // Sync mode with prop if it changes
  React.useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate(returnUrl, { replace: true });
    }
  }, [user, navigate, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else {
          navigate(returnUrl, { replace: true });
        }
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          setErrorMsg('Please enter your full name.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        const { error } = await signUpWithEmail(email, password, displayName);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Account created successfully! Check your email if verification is required, or sign in.');
          setMode('signin');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Password reset instructions have been dispatched to your email.');
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    const { error } = await signInWithGithub();
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--header-height) - 100px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)',
        background: 'radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 50%)'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        {!isConfigured && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#d97706',
              fontSize: 'var(--font-xs)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              gap: 'var(--space-2)'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Database Configuration Notice:</strong> Supabase credentials (<code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>) are not yet configured in <code>.env</code>. Forms are operating in safe preview mode.
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              marginBottom: 'var(--space-3)'
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            {mode === 'signin' && 'Welcome to MindSparQ'}
            {mode === 'signup' && 'Create Learner Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>
            {mode === 'signin' && 'Sign in to access your courses, progress, and certificates'}
            {mode === 'signup' && 'Join the next generation of innovators and thinkers in Nepal'}
            {mode === 'forgot' && 'Enter your verified account email to receive reset instructions'}
          </p>
        </div>

        {/* Tab Selection */}
        {mode !== 'forgot' && (
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              padding: '4px',
              marginBottom: 'var(--space-6)',
              border: '1px solid var(--color-border)'
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: '10px var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: mode === 'signin' ? '#2563eb' : 'transparent',
                color: mode === 'signin' ? '#ffffff' : 'var(--color-text-secondary)',
                fontWeight: mode === 'signin' ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: mode === 'signin' ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: '10px var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: mode === 'signup' ? '#2563eb' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : 'var(--color-text-secondary)',
                fontWeight: mode === 'signup' ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: mode === 'signup' ? '0 2px 8px rgba(37, 99, 235, 0.4)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: 'var(--font-sm)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#16a34a',
              fontSize: 'var(--font-sm)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        {mode !== 'forgot' && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                padding: '11px var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                marginBottom: 'var(--space-2)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                padding: '11px var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: 'var(--space-4) 0',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-xs)'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ padding: '0 var(--space-3)' }}>OR WITH EMAIL</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>
          </>
        )}

        {/* Email Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label
                htmlFor="displayName"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--color-text-primary)'
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Suman Sharma"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 16px 0 44px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '6px',
                color: 'var(--color-text-primary)'
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 16px 0 44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    margin: 0,
                    color: 'var(--color-text-primary)'
                  }}
                >
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(null); setSuccessMsg(null); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 44px 0 44px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
            }}
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In to Account'
                : mode === 'signup'
                ? 'Create Free Account'
                : 'Send Reset Link'}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>

        {mode === 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary-600)',
                fontSize: 'var(--font-sm)',
                cursor: 'pointer'
              }}
            >
              Back to Sign In
            </button>
          </div>
        )}

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
          By continuing, you agree to MindSparQ's{' '}
          <Link to="/privacy-policy" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>.
        </div>
      </div>
    </div>
  );
};
