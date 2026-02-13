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

// Timeout wrapper for async operations
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), ms)
    )
  ]);
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
          10000 // 10 second timeout
        );
        
        if (!mounted) return;
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const isUserAdmin = await verifyAdminStatus(currentUser.id);
          if (mounted) setIsAdmin(isUserAdmin);
        }

        if (mounted) setIsLoading(false);
      } catch (error) {
        console.error('Session init error:', error);
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
          setIsLoading(true);
          try {
            const isUserAdmin = await withTimeout(
              verifyAdminStatus(currentUser.id),
              5000 // 5 second timeout for admin check
            );
            if (mounted) setIsAdmin(isUserAdmin);
          } catch (error) {
            console.error('Admin verification error:', error);
            // Keep existing admin status on error
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

  // Internal verification function
  const verifyAdminStatus = async (userId: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', userId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
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
