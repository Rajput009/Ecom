import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/database';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; data: { user: User | null; session: Session | null } | null }>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const ADMIN_CACHE_KEY = 'zulfiqar_admin_cache';
const ADMIN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const SESSION_TIMEOUT_MS = 15000;
const ADMIN_VERIFY_TIMEOUT_MS = 10000;

interface AdminCache {
  userId: string;
  isAdmin: boolean;
  timestamp: number;
}

// Timeout wrapper for async operations
const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Operation timed out')), ms);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

// Get cached admin status
const getCachedAdminStatus = (userId: string): boolean | null => {
  try {
    const cached = localStorage.getItem(ADMIN_CACHE_KEY);
    if (!cached) return null;

    const data: AdminCache = JSON.parse(cached);
    if (data.userId !== userId) return null;
    if (Date.now() - data.timestamp > ADMIN_CACHE_DURATION) return null;

    return data.isAdmin;
  } catch {
    return null;
  }
};

// Set cached admin status
const setCachedAdminStatus = (userId: string, isAdmin: boolean) => {
  try {
    const data: AdminCache = {
      userId,
      isAdmin,
      timestamp: Date.now(),
    };
    localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
};

const clearCachedAdminStatus = () => {
  try {
    localStorage.removeItem(ADMIN_CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
};

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Internal verification function with retry
  const verifyAdminStatus = async (userId: string, retries = 1): Promise<boolean> => {
    if (!supabase) return false;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        return !!data;
      } catch {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 750 * (attempt + 1)));
        }
      }
    }

    return false;
  };

  const resolveAdminStatus = async (userId: string): Promise<boolean> => {
    const cachedStatus = getCachedAdminStatus(userId);
    if (cachedStatus !== null) {
      return cachedStatus;
    }

    const isUserAdmin = await withTimeout(
      verifyAdminStatus(userId),
      ADMIN_VERIFY_TIMEOUT_MS
    );

    setCachedAdminStatus(userId, isUserAdmin);
    return isUserAdmin;
  };

  // Listen for auth changes
  useEffect(() => {
    const client = supabase;

    if (!client) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Get initial session with timeout
    const initSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await withTimeout(client.auth.getSession(), SESSION_TIMEOUT_MS);

        if (!mounted) return;

        setSession(initialSession);
        const currentUser = initialSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            const isUserAdmin = await resolveAdminStatus(currentUser.id);
            if (mounted) {
              setIsAdmin(isUserAdmin);
            }
          } catch (error) {
            if (mounted) {
              setIsAdmin(false);
            }
            console.error('Admin verification error:', error);
          }
        } else {
          setIsAdmin(false);
        }
      } catch {
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event: AuthChangeEvent, nextSession: Session | null) => {
      if (!mounted) return;

      setSession(nextSession);
      const currentUser = nextSession?.user ?? null;
      setUser(currentUser);

      if (!currentUser || event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsLoading(false);
        clearCachedAdminStatus();
        return;
      }

      // Avoid extra admin table reads on token refresh while preserving current state.
      if (event === 'TOKEN_REFRESHED') {
        const cachedStatus = getCachedAdminStatus(currentUser.id);
        if (cachedStatus !== null) {
          setIsAdmin(cachedStatus);
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Defer async Supabase calls outside auth callback to avoid lock/timeouts.
      setTimeout(() => {
        if (!mounted) return;

        void (async () => {
          try {
            const isUserAdmin = await resolveAdminStatus(currentUser.id);
            if (mounted) {
              setIsAdmin(isUserAdmin);
            }
          } catch (error) {
            if (mounted) {
              setIsAdmin(false);
            }
            console.error('Admin verification error:', error);
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        })();
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up new customer
  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured'), data: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: fullName
          ? {
              data: {
                full_name: fullName,
              },
            }
          : undefined,
      });

      return { 
        error, 
        data: data ? { user: data.user, session: data.session } : null 
      };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAdmin(false);
    clearCachedAdminStatus();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin,
        isLoading,
        signIn,
        signUp,
        signOut,
        checkAdminStatus: async () => (user ? resolveAdminStatus(user.id) : false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return context;
}
