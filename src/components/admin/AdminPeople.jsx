import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function AdminPeople() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tmdb_id: '',
    name: '',
    profile_path: '',
    bio: '',
    known_for_department: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('popularity', { ascending: false })
        .limit(100);

      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePerson = async (id) => {
    if (!confirm('Are you sure you want to delete this person?')) return;

    try {
      const { error } = await supabase.from('people').delete().eq('id', id);
      if (error) throw error;
      setPeople((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting person:', error);
      alert('Failed to delete person');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('people')
        .insert({
          ...formData,
          tmdb_id: parseInt(formData.tmdb_id) || null,
        })
        .select()
        .single();

      if (error) throw error;
      setPeople((prev) => [data, ...prev]);
      setShowModal(false);
      setFormData({
        tmdb_id: '',
        name: '',
        profile_path: '',
        bio: '',
        known_for_department: '',
      });
    } catch (error) {
      console.error('Error saving person:', error);
      alert('Failed to save person');
    } finally {
      setSaving(false);
    }
  };

  const filteredPeople = people.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cinema-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="input-field pl-12"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Person
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-cinema-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredPeople.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredPeople.map((person) => (
            <div key={person.id} className="glass rounded-xl overflow-hidden group">
              <div className="aspect-square bg-cinema-card">
                {person.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-cinema-text-secondary">
                    No image
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium truncate">{person.name}</p>
                <p className="text-xs text-cinema-text-secondary">
                  {person.known_for_department || 'Unknown'}
                </p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deletePerson(person.id)}
                  className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-2xl">
          <p className="text-cinema-text-secondary">No people found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Person</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">TMDB ID</label>
                <input
                  type="number"
                  value={formData.tmdb_id}
                  onChange={(e) => setFormData({ ...formData, tmdb_id: e.target.value })}
                  className="input-field"
                  placeholder="Enter TMDB ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  value={formData.known_for_department}
                  onChange={(e) => setFormData({ ...formData, known_for_department: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select department</option>
                  <option value="Acting">Acting</option>
                  <option value="Directing">Directing</option>
                  <option value="Production">Production</option>
                  <option value="Sound">Sound</option>
                  <option value="Camera">Camera</option>
                  <option value="Editing">Editing</option>
                  <option value="Writing">Writing</option>
                  <option value="Art">Art</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
