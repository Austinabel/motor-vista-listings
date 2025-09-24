
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean | null;
  lastAuthEvent: AuthChangeEvent | null;
  clearLastAuthEvent: () => void;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [lastAuthEvent, setLastAuthEvent] = useState<AuthChangeEvent | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === 'SIGNED_IN') {
          setLastAuthEvent(event);
          // Check admin status after sign in
          if (session?.user) {
            checkAdminStatus(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      // Check admin status for existing session
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data: isUserAdmin, error } = await supabase
        .rpc('is_admin', { user_id: userId });
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(isUserAdmin || false);
    } catch (error) {
      console.error('Error in checkAdminStatus:', error);
      setIsAdmin(false);
    }
  };

  const clearLastAuthEvent = () => setLastAuthEvent(null);

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/login?confirmed=true`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Redirect to homepage after successful logout
      window.location.href = '/';
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    lastAuthEvent,
    clearLastAuthEvent,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
