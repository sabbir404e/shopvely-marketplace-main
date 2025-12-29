import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  loyalty_points: number;
  referral_code: string | null;
  referred_by_user_id: string | null;
  role: string; // Add role
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  userRole: 'admin' | 'manager' | 'customer' | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithFacebook: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'customer' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      const profileData = data as unknown as Profile;
      setProfile(profileData);
      return profileData;
    }

    // If no profile exists (can happen with OAuth), create one
    console.log('No profile found for user, creating one...');
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Generate referral code
      const baseName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'USER';
      const referralCode = `${baseName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6)}${Math.floor(Math.random() * 9000 + 1000)}`;

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          loyalty_points: 0,
          referral_code: referralCode,
          role: 'customer'
        })
        .select()
        .single();

      if (!insertError && newProfile) {
        const profileData = newProfile as unknown as Profile;
        setProfile(profileData);
        return profileData;
      } else if (insertError?.code === '23505') {
        // Profile already exists (likely created by trigger), fetch it
        console.log('Profile already exists (conflict), fetching...');
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (existingProfile) {
          const profileData = existingProfile as unknown as Profile;
          setProfile(profileData);
          return profileData;
        }
      } else {
        console.error('Error creating profile:', insertError);
      }
    }

    return null;
  };

  const checkUserRole = async (userId: string, email: string | undefined, profileData?: Profile) => {
    console.log('Checking role for:', userId, email);

    const ADMIN_EMAIL = 'shopvelyofficial@gmail.com';

    // 1. Strict Email Check for Admin
    if (email === ADMIN_EMAIL) {
      console.log('User IS admin (by email match)');
      setIsAdmin(true);
      setUserRole('admin');
      return;
    }

    // 2. For everyone else, strictly deny admin access
    // We ignore DB role if it claims admin, ensuring only the specific email has access
    console.log('User is CUSTOMER (strict enforce)');
    setIsAdmin(false);
    setUserRole('customer');
  };

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const fetchProfileWithRetry = async (userId: string, retries = 3) => {
      if (!mounted) return;

      const profileData = await fetchProfile(userId);
      if (profileData) {
        checkUserRole(userId, user?.email, profileData);
      } else if (retries > 0) {
        console.log(`Profile not found, retrying... (${retries} attempts left)`);
        retryTimeout = setTimeout(() => {
          fetchProfileWithRetry(userId, retries - 1);
        }, 1000);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Small delay to allow DB trigger to finish
          checkUserRole(session.user.id, session.user.email); // Check role immediately with email
          retryTimeout = setTimeout(() => {
            fetchProfileWithRetry(session.user.id);
          }, 500);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(retryTimeout);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, referralCode?: string) => {
    // Admin bypass removed


    let referredBy = null;
    if (referralCode) {
      // Simple client-side lookup if not using Edge Functions
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          // referral_code is now generated by DB trigger for uniqueness
          referred_by: referredBy
        }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Admin bypass removed


    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signInWithFacebook = async () => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      userRole,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      refreshProfile,
      resetPassword: async (email: string) => {
        const redirectUrl = `${window.location.origin}/auth/update-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        return { error };
      }
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
