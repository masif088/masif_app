import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from 'utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Debug mode - set to true to enable detailed logging
const DEBUG_MODE = process.env.NODE_ENV === 'development';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  
  // Refs to prevent multiple simultaneous operations
  const isInitializing = useRef(false);
  const authStateChangeCount = useRef(0);
  const lastAuthEvent = useRef<string>('');
  const lastAuthTime = useRef<number>(0);

  const logDebug = (message: string, ...args: any[]) => {
    if (DEBUG_MODE) {
      console.log(`[AuthContext] ${message}`, ...args);
    }
  };

  const refreshSession = useCallback(async () => {
    if (isInitializing.current) {
      logDebug('Session refresh already in progress, skipping...');
      return;
    }
    
    try {
      isInitializing.current = true;
      logDebug('Refreshing session...');
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      logDebug('Session refreshed successfully');
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      isInitializing.current = false;
    }
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    try {
      logDebug('Starting signOut process...');
      
      // Clear Supabase session
      logDebug('Calling Supabase auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      logDebug('Supabase signOut successful');
      
      // Clear local state
      logDebug('Clearing local state...');
      setUser(null);
      setSession(null);

      // Clear all cookies
      logDebug('Clearing all cookies...');
      Cookies.remove('user');
      Cookies.remove('session');
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      
      
      // Clear any remaining cookies
      if (typeof document !== 'undefined') {
        logDebug('Clearing all cookies...');
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      }
      
      logDebug('Redirecting to login page...');
      // Redirect to login page
      router.push('/authentication/login');
      
      logDebug('signOut process completed');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if Supabase signOut fails, clear local state and redirect
      logDebug('Executing fallback cleanup...');
      setUser(null);
      setSession(null);
      router.push('/authentication/login');
      throw error;
    }
  }, [supabase.auth, router]);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const initializeAuth = async () => {
      if (isInitializing.current) return;
      
      try {
        await refreshSession();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();

    // Listen for auth changes - only set up once with debouncing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        const now = Date.now();
        const timeSinceLastEvent = now - lastAuthTime.current;
        
        authStateChangeCount.current += 1;
        const currentCount = authStateChangeCount.current;
        
        // Debounce rapid auth state changes (within 100ms)
        if (timeSinceLastEvent < 100 && event === lastAuthEvent.current) {
          logDebug(`Debouncing rapid auth state change (${currentCount}):`, event, session?.user?.id, `time: ${timeSinceLastEvent}ms`);
          return;
        }
        
        // Log excessive auth state changes
        if (currentCount > 5) {
          console.warn(`[AuthContext] Excessive auth state changes detected: ${currentCount} changes for event: ${event}`);
        }
        
        lastAuthEvent.current = event;
        lastAuthTime.current = now;
        
        logDebug('Auth state changed:', event, session?.user?.id, `(count: ${currentCount}, time: ${timeSinceLastEvent}ms)`);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          router.push('/authentication/login');
        }
        
        // Reset counter after a delay
        setTimeout(() => {
          authStateChangeCount.current = 0;
          lastAuthEvent.current = '';
        }, 2000);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
