import { useSupabase } from '../lib/supabase/SupabaseContext';

export const useAuth = () => {
  const { user, loading, signIn, signUp, signOut } = useSupabase();
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };
};