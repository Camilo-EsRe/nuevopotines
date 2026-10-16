import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCOP } from '@/context/MenuContext';
import { Loader2, Plus, Pencil, Trash2, X, Save, MapPin } from 'lucide-react';

interface TarifaRow {
  id: string;
  barrio: string;
  precio: number;
}

export function AdminDomicilios() {
  const [items, setItems] = useState<TarifaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TarifaRow | null>(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase.from('tarifas_barrios').select('id, barrio, precio').order('barrio');
    if (error) { console.error(error); return; }
    setItems((data || []) as TarifaRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    if (!editing || !editing.barrio.trim()) return;
    setSaving(true);
    if (editing.id) {
      await supabase.from('tarifas_barrios').update({ barrio: editing.barrio, precio: editing.precio }).eq('id', editing.id);
    } else {
      await supabase.from('tarifas_barrios').insert({ barrio: editing.barrio, precio: editing.precio });
    }
    setSaving(false);
    setEditing(null);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este barrio?')) return;
    await supabase.from('tarifas_barrios').delete().eq('id', id);
    fetch();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>;
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{editing.id ? 'Editar barrio' : 'Nuevo barrio'}</h2>
          <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white/80"><X className="w-5 h-5" /></button>
        </div>
        <div className="card p-5 space-y-4">
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Nombre del barrio</label>
            <input className="input-field" value={editing.barrio} onChange={(e) => setEditing({ ...editing, barrio: e.target.value })} placeholder="Ej: Centro" />
          </div>
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Precio del domicilio (COP)</label>
            <input type="number" className="input-field" value={editing.precio} onChange={(e) => setEditing({ ...editing, precio: Number(e.target.value) })} />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-gold w-full py-3 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setEditing({ id: '', barrio: '', precio: 3000 })} className="btn-gold w-full py-3 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Nuevo barrio
      </button>
      {items.map((item) => (
        <div key={item.id} className="card p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-gold-400/60 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{item.barrio}</h3>
            <p className="text-xs text-white/40">{formatCOP(item.precio)}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setEditing(item)} className="w-8 h-8 rounded-lg bg-ink-700/60 flex items-center justify-center text-white/50 hover:text-gold-400">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-ink-700/60 flex items-center justify-center text-white/50 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
