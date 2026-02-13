import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/database';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const ADMIN_CACHE_KEY = 'zulfiqar_admin_cache';
const ADMIN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AdminCache {
  userId: string;
  isAdmin: boolean;
  timestamp: number;
}

// Timeout wrapper for async operations
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    )
  ]);
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

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // Listen for auth changes
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Get initial session with timeout
    const initSession = async () => {
      try {
        if (!supabase) {
          if (mounted) setIsLoading(false);
          return;
        }
        
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          15000 // 15 second timeout for initial session
        );
        
        if (!mounted) return;
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Check cache first
          const cachedStatus = getCachedAdminStatus(currentUser.id);
          if (cachedStatus !== null) {
            setIsAdmin(cachedStatus);
          } else {
            // Verify with backend
            const isUserAdmin = await verifyAdminStatus(currentUser.id);
            if (mounted) {
              setIsAdmin(isUserAdmin);
              setCachedAdminStatus(currentUser.id, isUserAdmin);
            }
          }
        }

        if (mounted) setIsLoading(false);
      } catch (error) {
        // Silently handle session init errors
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Check admin status when session changes
        if (currentUser) {
          // Check cache first to avoid unnecessary API calls
          const cachedStatus = getCachedAdminStatus(currentUser.id);
          if (cachedStatus !== null) {
            setIsAdmin(cachedStatus);
            setIsLoading(false);
            return;
          }
          
          setIsLoading(true);
          try {
            const isUserAdmin = await withTimeout(
              verifyAdminStatus(currentUser.id),
              15000 // 15 second timeout
            );
            if (mounted) {
              setIsAdmin(isUserAdmin);
              setCachedAdminStatus(currentUser.id, isUserAdmin);
            }
          } catch {
            // On timeout/error, don't change admin status
            // User can retry by refreshing
          }
          if (mounted) setIsLoading(false);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Internal verification function with retry
  const verifyAdminStatus = async (userId: string, retries = 2): Promise<boolean> => {
    if (!supabase) return false;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', userId)
          .single();

        if (!error && !!data) {
          return true;
        }
        
        // If no data found, user is not an admin
        if (error?.code === 'PGRST116') {
          return false;
        }
        
        // For other errors, retry
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      } catch {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    return false;
  };

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

  // Sign out
  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAdmin(false);
    // Clear admin cache on sign out
    try {
      localStorage.removeItem(ADMIN_CACHE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin,
        isLoading,
        signIn,
        signOut,
        checkAdminStatus: async () => user ? verifyAdminStatus(user.id) : false,
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
