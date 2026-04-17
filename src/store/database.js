import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const useMovieStore = create((set, get) => ({
  movies: [],
  currentMovie: null,
  movieCredits: null,
  loading: false,
  error: null,

  fetchMovies: async (filters = {}) => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase not configured' });
      return;
    }

    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.industry_id) {
        query = query.eq('industry_id', filters.industry_id);
      }
      if (filters.language) {
        query = query.eq('language', filters.language);
      }
      if (filters.year) {
        query = query.eq('release_date', `${filters.year}-01-01`);
      }

      const { data, error } = await query;
      if (error) throw error;
      set({ movies: data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMovieById: async (id) => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase not configured' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('movies')
        .select(`
          *,
          industries (*),
          movie_people (
            *,
            people (*),
            roles (*)
          ),
          movie_awards (
            *,
            awards (*),
            people (name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentMovie: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createMovie: async (movieData) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('movies')
      .insert(movieData)
      .select()
      .single();

    if (error) throw error;
    set((state) => ({ movies: [data, ...state.movies] }));
    return data;
  },

  updateMovie: async (id, movieData) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('movies')
      .update(movieData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    set((state) => ({
      movies: state.movies.map((m) => (m.id === id ? data : m)),
      currentMovie: state.currentMovie?.id === id ? data : state.currentMovie,
    }));
    return data;
  },

  deleteMovie: async (id) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.from('movies').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({
      movies: state.movies.filter((m) => m.id !== id),
      currentMovie: state.currentMovie?.id === id ? null : state.currentMovie,
    }));
  },

  clearCurrentMovie: () => set({ currentMovie: null }),
}));

export const usePersonStore = create((set, get) => ({
  people: [],
  currentPerson: null,
  loading: false,
  error: null,

  fetchPeople: async (filters = {}) => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase not configured' });
      return;
    }

    set({ loading: true, error: null });
    try {
      let query = supabase
        .from('people')
        .select('*')
        .order('popularity', { ascending: false });

      if (filters.known_for_department) {
        query = query.eq('known_for_department', filters.known_for_department);
      }

      const { data, error } = await query;
      if (error) throw error;
      set({ people: data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchPersonById: async (id) => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase not configured' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('people')
        .select(`
          *,
          movie_people (
            *,
            movies (id, title, poster_path, release_date),
            roles (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentPerson: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createPerson: async (personData) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('people')
      .insert(personData)
      .select()
      .single();

    if (error) throw error;
    set((state) => ({ people: [data, ...state.people] }));
    return data;
  },

  updatePerson: async (id, personData) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('people')
      .update(personData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    set((state) => ({
      people: state.people.map((p) => (p.id === id ? data : p)),
      currentPerson: state.currentPerson?.id === id ? data : state.currentPerson,
    }));
    return data;
  },

  deletePerson: async (id) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({
      people: state.people.filter((p) => p.id !== id),
      currentPerson: state.currentPerson?.id === id ? null : state.currentPerson,
    }));
  },
}));

export const useIndustryStore = create((set) => ({
  industries: [],
  loading: false,
  error: null,

  fetchIndustries: async () => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase not configured' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ industries: data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export const useRoleStore = create((set) => ({
  roles: [],
  loading: false,
  error: null,

  fetchRoles: async () => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase not configured' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ roles: data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export const useAwardStore = create((set) => ({
  awards: [],
  loading: false,
  error: null,

  fetchAwards: async () => {
    if (!isSupabaseConfigured()) {
      set({ error: 'Supabase not configured' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ awards: data || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createAward: async (awardData) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('awards')
      .insert(awardData)
      .select()
      .single();

    if (error) throw error;
    set((state) => ({ awards: [...state.awards, data] }));
    return data;
  },
}));
