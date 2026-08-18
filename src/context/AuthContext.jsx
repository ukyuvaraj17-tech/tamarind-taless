import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
  const isAdmin = !!adminEmail && currentUser?.email === adminEmail;

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) setUserProfile(data);
    } catch (e) { /* keep null */ }
  }

  // Single source of truth for "does this user have a profile row yet" — called both
  // on initial session restore and on every SIGNED_IN event, so a profile that failed
  // to get created at signup (or was later deleted) gets repaired for returning users
  // too, not just brand-new sign-ins.
  async function ensureProfile(user) {
    try {
      const { data } = await supabase.from('profiles').select('id').eq('id', user.id).single();
      if (!data) {
        await supabase.from('profiles').insert({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          phone: user.user_metadata?.phone || '',
          addresses: []
        });
      }
    } catch (e) { console.error('ensureProfile failed:', e); /* best-effort repair; fetchProfile below will just keep userProfile null */ }
  }

  async function loginWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
  }

  async function registerWithEmail(name, email, password, phone) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, phone } }
    });
    if (error) throw error;
    // Profile creation is handled centrally by ensureProfile() when the resulting
    // SIGNED_IN event fires, using this same name/phone (via user_metadata) — avoids
    // a duplicate-insert race between this function and that handler.
    return data;
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
  }

  async function refreshProfile() {
    if (!currentUser) return;
    await fetchProfile(currentUser.id);
  }

  async function updateProfile(updates) {
    if (!currentUser) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id);
    if (error) throw error;
    await fetchProfile(currentUser.id);
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) { await ensureProfile(user); fetchProfile(user.id); }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user || null;
        setCurrentUser(user);
        if (user) {
          await ensureProfile(user);
          fetchProfile(user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    currentUser, userProfile, isAdmin, loading,
    loginWithEmail, loginWithGoogle, registerWithEmail,
    resetPassword, logout, refreshProfile, updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
