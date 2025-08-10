import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, AuthContextType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return {
      id: profile.id,
      email: session?.user?.email || '',
      name: profile.name,
      plan: profile.plan as 'free' | 'basic' | 'pro',
      apiCallsUsed: profile.api_calls_used,
      apiCallsLimit: profile.api_calls_limit,
      createdAt: profile.created_at,
      isAdmin: profile.is_admin
    };
  };

  const refreshUserProfile = async () => {
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      setUser(profile);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setIsLoading(true);
        
        if (session?.user) {
          // Fetch user profile from database
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    toast({
      title: "Login successful",
      description: "Welcome back!"
    });
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });

    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }

    toast({
      title: "Registration successful",
      description: `Welcome to P Labs, ${name}! Please check your email to verify your account.`
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const updateUserPlan = async (plan: 'free' | 'basic' | 'pro') => {
    if (!user || !session?.user) return;

    const apiCallsLimit = plan === 'free' ? 50 : plan === 'basic' ? 5000 : -1;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan,
        api_calls_limit: apiCallsLimit
      })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating plan:', error);
      return;
    }

    // Update local user state
    setUser({
      ...user,
      plan,
      apiCallsLimit
    });

    toast({
      title: "Plan updated",
      description: `Your plan has been updated to ${plan}.`
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      login,
      register,
      logout,
      updateUserPlan,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};