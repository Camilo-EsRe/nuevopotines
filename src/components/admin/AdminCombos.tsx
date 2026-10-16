import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCOP } from '@/context/MenuContext';
import { Loader2, Plus, Pencil, Trash2, X, Save, Star, Eye, EyeOff } from 'lucide-react';

interface ComboRow {
  id: string;
  nombre: string;
  descripcion: string[];
  descripcion_larga: string;
  precio: number;
  emoji: string;
  imagen: string;
  grupo: string;
  destacado: boolean;
  orden: number;
  activo: boolean;
}

const GRUPOS = ['estrella', 'snacks', 'bombones', 'temporada'];

const emptyCombo: Omit<ComboRow, 'id'> = {
  nombre: '',
  descripcion: [],
  descripcion_larga: '',
  precio: 0,
  emoji: '🍟',
  imagen: '',
  grupo: 'snacks',
  destacado: false,
  orden: 0,
  activo: true,
};

export function AdminCombos() {
  const [combos, setCombos] = useState<ComboRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ComboRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [descInput, setDescInput] = useState('');

  const fetchCombos = useCallback(async () => {
    const { data, error } = await supabase.from('menu_combos').select('*').order('orden');
    if (error) { console.error(error); return; }
    setCombos((data || []) as ComboRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCombos(); }, [fetchCombos]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const row = editing;
    if (row.id) {
      await supabase.from('menu_combos').update({
        nombre: row.nombre, descripcion: row.descripcion, descripcion_larga: row.descripcion_larga,
        precio: row.precio, emoji: row.emoji, imagen: row.imagen, grupo: row.grupo,
        destacado: row.destacado, orden: row.orden, activo: row.activo,
      }).eq('id', row.id);
    } else {
      await supabase.from('menu_combos').insert({
        nombre: row.nombre, descripcion: row.descripcion, descripcion_larga: row.descripcion_larga,
        precio: row.precio, emoji: row.emoji, imagen: row.imagen, grupo: row.grupo,
        destacado: row.destacado, orden: row.orden, activo: row.activo,
      });
    }
    setSaving(false);
    setEditing(null);
    setDescInput('');
    fetchCombos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este combo?')) return;
    await supabase.from('menu_combos').delete().eq('id', id);
    fetchCombos();
  };

  const toggleActivo = async (combo: ComboRow) => {
    await supabase.from('menu_combos').update({ activo: !combo.activo }).eq('id', combo.id);
    fetchCombos();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>;
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{editing.id ? 'Editar combo' : 'Nuevo combo'}</h2>
          <button onClick={() => { setEditing(null); setDescInput(''); }} className="text-white/40 hover:text-white/80">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="card p-5 space-y-4">
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Nombre</label>
            <input className="input-field" value={editing.nombre} onChange={(e) => setEditing({ ...editing, nombre: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gold-300 font-medium mb-1.5 block">Precio (COP)</label>
              <input type="number" className="input-field" value={editing.precio} onChange={(e) => setEditing({ ...editing, precio: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-gold-300 font-medium mb-1.5 block">Orden</label>
              <input type="number" className="input-field" value={editing.orden} onChange={(e) => setEditing({ ...editing, orden: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gold-300 font-medium mb-1.5 block">Grupo</label>
              <select className="input-field appearance-none" value={editing.grupo} onChange={(e) => setEditing({ ...editing, grupo: e.target.value })}>
                {GRUPOS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gold-300 font-medium mb-1.5 block">Emoji</label>
              <input className="input-field" value={editing.emoji} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Imagen (ruta)</label>
            <input className="input-field" value={editing.imagen} onChange={(e) => setEditing({ ...editing, imagen: e.target.value })} placeholder="/productos/mi-imagen.jpg" />
          </div>
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Ingredientes (tags)</label>
            <div className="flex gap-2 mb-2">
              <input className="input-field flex-1" value={descInput} onChange={(e) => setDescInput(e.target.value)} placeholder="Ej: Papas" onKeyDown={(e) => {
                if (e.key === 'Enter' && descInput.trim()) {
                  e.preventDefault();
                  setEditing({ ...editing, descripcion: [...editing.descripcion, descInput.trim()] });
                  setDescInput('');
                }
              }} />
              <button onClick={() => { if (descInput.trim()) { setEditing({ ...editing, descripcion: [...editing.descripcion, descInput.trim()] }); setDescInput(''); } }} className="btn-gold px-4"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {editing.descripcion.map((d, i) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-ink-600/60 text-white/70 px-2 py-1 rounded-lg">
                  {d}
                  <button onClick={() => setEditing({ ...editing, descripcion: editing.descripcion.filter((_, j) => j !== i) })} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gold-300 font-medium mb-1.5 block">Descripcion larga</label>
            <textarea className="input-field min-h-[80px] resize-y" value={editing.descripcion_larga} onChange={(e) => setEditing({ ...editing, descripcion_larga: e.target.value })} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editing.destacado} onChange={(e) => setEditing({ ...editing, destacado: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white/70 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-gold-400" /> Destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editing.activo} onChange={(e) => setEditing({ ...editing, activo: e.target.checked })} className="w-4 h-4" />
              <span className="text-sm text-white/70">Activo</span>
            </label>
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
      <button
        onClick={() => { setEditing({ ...emptyCombo, id: '' } as ComboRow); setDescInput(''); }}
        className="btn-gold w-full py-3 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Nuevo combo
      </button>
      {combos.map((combo) => (
        <div key={combo.id} className="card p-4 flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">{combo.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white truncate">{combo.nombre}</h3>
              {combo.destacado && <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400 flex-shrink-0" />}
              {!combo.activo && <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">Inactivo</span>}
            </div>
            <p className="text-xs text-white/40">{formatCOP(combo.precio)} · {combo.grupo} · orden {combo.orden}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => toggleActivo(combo)} className="w-8 h-8 rounded-lg bg-ink-700/60 flex items-center justify-center text-white/50 hover:text-gold-400">
              {combo.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button onClick={() => { setEditing(combo); setDescInput(''); }} className="w-8 h-8 rounded-lg bg-ink-700/60 flex items-center justify-center text-white/50 hover:text-gold-400">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(combo.id)} className="w-8 h-8 rounded-lg bg-ink-700/60 flex items-center justify-center text-white/50 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
