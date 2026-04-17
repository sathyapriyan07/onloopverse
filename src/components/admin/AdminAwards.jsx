import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Edit2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function AdminAwards() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    country: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('name');

      if (error) throw error;
      setAwards(data || []);
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAward = async (id) => {
    if (!confirm('Are you sure you want to delete this award?')) return;

    try {
      const { error } = await supabase.from('awards').delete().eq('id', id);
      if (error) throw error;
      setAwards((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting award:', error);
      alert('Failed to delete award');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingAward) {
        const { data, error } = await supabase
          .from('awards')
          .update(formData)
          .eq('id', editingAward.id)
          .select()
          .single();

        if (error) throw error;
        setAwards((prev) => prev.map((a) => (a.id === editingAward.id ? data : a)));
      } else {
        const { data, error } = await supabase
          .from('awards')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;
        setAwards((prev) => [...prev, data]);
      }

      setShowModal(false);
      setEditingAward(null);
      setFormData({ name: '', type: '', country: '' });
    } catch (error) {
      console.error('Error saving award:', error);
      alert('Failed to save award');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (award) => {
    setEditingAward(award);
    setFormData({
      name: award.name,
      type: award.type || '',
      country: award.country || '',
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Awards</h1>
          <p className="text-cinema-text-secondary">Manage awards and recognitions</p>
        </div>
        <button
          onClick={() => {
            setEditingAward(null);
            setFormData({ name: '', type: '', country: '' });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Award
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-cinema-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : awards.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cinema-border">
                <th className="text-left p-4 font-medium text-cinema-text-secondary">Award</th>
                <th className="text-left p-4 font-medium text-cinema-text-secondary">Type</th>
                <th className="text-left p-4 font-medium text-cinema-text-secondary">Country</th>
                <th className="text-right p-4 font-medium text-cinema-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {awards.map((award) => (
                <tr key={award.id} className="border-b border-cinema-border/50 hover:bg-white/5">
                  <td className="p-4 font-medium">{award.name}</td>
                  <td className="p-4 text-cinema-text-secondary">
                    {award.type || '-'}
                  </td>
                  <td className="p-4 text-cinema-text-secondary">
                    {award.country || '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(award)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAward(award.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-2xl">
          <p className="text-cinema-text-secondary mb-4">No awards yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add your first award
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingAward ? 'Edit Award' : 'Add New Award'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Award Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., National Film Award"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select type</option>
                  <option value="National">National</option>
                  <option value="Filmfare">Filmfare</option>
                  <option value="Regional">Regional</option>
                  <option value="International">International</option>
                  <option value="State">State</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input-field"
                  placeholder="e.g., India"
                />
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
                  disabled={saving || !formData.name}
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
