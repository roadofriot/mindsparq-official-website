import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, RoleKey, UserRole } from '../types/database';
import { Capability, hasCapability, isStaffRole, isAdminOrOwnerRole } from '../lib/permissions';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: RoleKey[];
  loading: boolean;
  isConfigured: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  hasRole: (role: RoleKey) => boolean;
  hasPermission: (capability: Capability) => boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null; user: User | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<RoleKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfileAndRoles = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData && !profileErr) {
        setProfile(profileData as Profile);
      } else {
        // If profile doesn't exist yet, construct fallback
        setProfile({
          id: userId,
          display_name: user?.email ? user.email.split('@')[0] : 'Learner',
          avatar_path: null,
          bio: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // 2. Fetch User Roles
      const { data: rolesData, error: rolesErr } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (rolesData && !rolesErr && rolesData.length > 0) {
        setRoles((rolesData as UserRole[]).map((r) => r.role_key));
      } else {
        // Default role for signed-in user is learner
        setRoles(['learner']);
      }
    } catch (err) {
      console.error('[MindSparQ Auth] Error loading user profile & roles:', err);
      setRoles(['learner']);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRoles(session.user.id);
      } else {
        setProfile(null);
        setRoles([]);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRoles(session.user.id);
      } else {
        setProfile(null);
        setRoles([]);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndRoles]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndRoles(user.id);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new AuthError('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new AuthError('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'),
        user: null
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName
        }
      }
    });
    return { error, user: data?.user ?? null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return {
        error: new AuthError('Supabase is not configured yet. Google OAuth requires a valid Supabase project.')
      };
    }
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    return { error };
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: new AuthError('Supabase is not configured yet.')
      };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    return { error };
  };

  const hasRole = (role: RoleKey): boolean => {
    return roles.includes(role);
  };

  const hasPermission = (capability: Capability): boolean => {
    return hasCapability(roles, capability);
  };

  const isStaff = isStaffRole(roles);
  const isAdmin = isAdminOrOwnerRole(roles);
  const isOwner = roles.includes('owner');

  const value: AuthContextType = {
    user,
    session,
    profile,
    roles,
    loading,
    isConfigured: isSupabaseConfigured,
    isStaff,
    isAdmin,
    isOwner,
    hasRole,
    hasPermission,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
