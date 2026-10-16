import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Pencil, Trash2, X, Save, Eye, EyeOff } from 'lucide-react';

interface SalsaRow {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

const empty: Omit<SalsaRow, 'id'> = { nombre: '', orden: 0, activo: true };

export function AdminSalsas() {
  const [items, setItems] = useState<SalsaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SalsaRow | null>(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    const { data, error } = await supabase.from('menu_salsas').select('*').order('orden');
    if (error) { console.error(error); return; }
    setItems((data || []) as SalsaRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const r = editing;
    if (r.id) {
      await supabase.from('menu_salsas').update({ nombre: r.nombre, orden: r.orden, activo: r.activo }).eq('id', r.id);
    } else {
      await supabase.from('menu_salsas').insert({ nombre: r.nombre, orden: r.orden, activo: r.activo });
    }
    setSaving(false); setEditing(null); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta salsa?')) return;
    await supabase.from('menu_salsas').delete().eq('id', id); fetch();
  };

  const toggleActivo = async (item: SalsaRow) => {
    await supabase.from('menu_salsas').update({ activo: !item.activo }).eq('id', item.id); fetch();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>;

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{editing.id ? 'Editar salsa' : 'Nueva salsa'}</h2>
          <button onClick={() => setEditing(null)} className="text-white/40 hover:text-white/80"><X className="w-5 h-5" /></button>
        </div>
        <div className="card p-5 space-y-4">
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Nombre</label>
            <input className="input-field" value={editing.nombre} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Orden</label>
            <input type="number" className="input-field" value={editing.orden} onChange={(e) => setEditing({ ...editing, orden: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editing.activo} onChange={(e) => setEditing({ ...editing, activo: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm text-white/70">Activo</span>
          </label>
          <button onClick={handleSave} disabled={saving} className="btn-gold w-full py-3 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Guardar</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setEditing({ ...empty, id: '' } as SalsaRow)} className="btn-gold w-full py-3 flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> Nueva salsa
      </button>
      {items.map((item) => (
        <div key={item.id} className="card p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{item.nombre}</h3>
            <p className="text-xs text-white/40">orden {item.orden}{!item.activo && ' · inactivo'}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => toggleActivo(item)} className="w-8 h-8 rounded-lg bg-ink-700/60 flex items-center justify-center text-white/50 hover:text-gold-400">
              {item.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
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
