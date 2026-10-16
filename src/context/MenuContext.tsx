import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { Combo, Bebida, Adicion, Salsa } from '@/types';
import { COMBOS, BEBIDAS, ADICIONES, SALSAS, formatCOP } from '@/data/menu';

export interface ComboDB {
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

export interface BebidaDB {
  id: string;
  nombre: string;
  precio: number;
  emoji: string;
  imagen: string;
  color: string;
  orden: number;
  activo: boolean;
}

export interface AdicionDB {
  id: string;
  nombre: string;
  precio: number;
  emoji: string;
  imagen: string;
  orden: number;
  activo: boolean;
}

export interface SalsaDB {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

interface MenuContextValue {
  combos: Combo[];
  bebidas: Bebida[];
  adiciones: Adicion[];
  salsas: Salsa[];
  loading: boolean;
  refresh: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

let comboIdCounter = 1000;
let bebidaIdCounter = 1000;
let adicionIdCounter = 1000;
let salsaIdCounter = 1000;

function mapCombo(db: ComboDB): Combo {
  return {
    id: ++comboIdCounter,
    nombre: db.nombre,
    descripcion: db.descripcion || [],
    descripcionLarga: db.descripcion_larga || '',
    precio: Number(db.precio),
    emoji: db.emoji || '🍟',
    imagen: db.imagen || '',
    grupo: (db.grupo as Combo['grupo']) || 'snacks',
    destacado: db.destacado,
  };
}

function mapBebida(db: BebidaDB): Bebida {
  return {
    id: ++bebidaIdCounter,
    nombre: db.nombre,
    precio: Number(db.precio),
    emoji: db.emoji || '🥤',
    imagen: db.imagen || '',
    color: db.color || 'from-ink-600 to-ink-700',
  };
}

function mapAdicion(db: AdicionDB): Adicion {
  return {
    id: ++adicionIdCounter,
    nombre: db.nombre,
    precio: Number(db.precio),
    emoji: db.emoji || '🍗',
    imagen: db.imagen || '',
  };
}

function mapSalsa(db: SalsaDB): Salsa {
  return {
    id: ++salsaIdCounter,
    nombre: db.nombre,
  };
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const [combos, setCombos] = useState<Combo[]>(COMBOS);
  const [bebidas, setBebidas] = useState<Bebida[]>(BEBIDAS);
  const [adiciones, setAdiciones] = useState<Adicion[]>(ADICIONES);
  const [salsas, setSalsas] = useState<Salsa[]>(SALSAS);
  const [loading, setLoading] = useState(true);

  const loadMenu = useCallback(async () => {
    try {
      const [comboRes, bebidaRes, adicionRes, salsaRes] = await Promise.all([
        supabase.from('menu_combos').select('*').eq('activo', true).order('orden'),
        supabase.from('menu_bebidas').select('*').eq('activo', true).order('orden'),
        supabase.from('menu_adiciones').select('*').eq('activo', true).order('orden'),
        supabase.from('menu_salsas').select('*').eq('activo', true).order('orden'),
      ]);

      if (comboRes.data && comboRes.data.length > 0) {
        setCombos((comboRes.data as ComboDB[]).map(mapCombo));
      }
      if (bebidaRes.data && bebidaRes.data.length > 0) {
        setBebidas((bebidaRes.data as BebidaDB[]).map(mapBebida));
      }
      if (adicionRes.data && adicionRes.data.length > 0) {
        setAdiciones((adicionRes.data as AdicionDB[]).map(mapAdicion));
      }
      if (salsaRes.data && salsaRes.data.length > 0) {
        setSalsas((salsaRes.data as SalsaDB[]).map(mapSalsa));
      }
    } catch {
      // Fallback to hardcoded data (already set as initial state)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const refresh = useCallback(() => {
    loadMenu();
  }, [loadMenu]);

  return (
    <MenuContext.Provider value={{ combos, bebidas, adiciones, salsas, loading, refresh }}>
      {children}
    </MenuContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}

export { formatCOP };
