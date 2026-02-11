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

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const isUserAdmin = await verifyAdminStatus(currentUser.id);
        setIsAdmin(isUserAdmin);
      }

      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Check admin status when session changes
        if (currentUser) {
          setIsLoading(true); // Re-validate admin status
          const isUserAdmin = await verifyAdminStatus(currentUser.id);
          setIsAdmin(isUserAdmin);
          setIsLoading(false);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
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
