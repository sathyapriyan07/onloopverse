import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAdmin: false,
  loading: true,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured()) {
      set({ loading: false, error: 'Supabase not configured' });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await get().checkAdminStatus(session.user.email);
        set({ user: session.user });
      }
      
      set({ loading: false });

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await get().checkAdminStatus(session.user.email);
          set({ user: session.user });
        } else {
          set({ user: null, isAdmin: false });
        }
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  checkAdminStatus: async (email) => {
    if (!isSupabaseConfigured() || !email) {
      set({ isAdmin: false });
      return;
    }

    try {
      const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('email', email)
        .single();
      
      set({ isAdmin: !!data });
    } catch {
      set({ isAdmin: false });
    }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      await supabase.auth.signOut();
      set({ user: null, isAdmin: false });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));

export const useUIStore = create((set) => ({
  sidebarOpen: false,
  searchQuery: '',
  selectedIndustry: null,
  theme: 'dark',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedIndustry: (industry) => set({ selectedIndustry: industry }),
  setTheme: (theme) => set({ theme }),
}));
