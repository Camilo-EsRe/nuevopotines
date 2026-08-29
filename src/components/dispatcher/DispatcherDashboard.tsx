import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { playNotificationSound } from '@/lib/sound';
import { OrderCard } from './OrderCard';
import type { PedidoConItems, EstadoPedido } from '@/types';
import { Search, Bell, LogOut, Loader2, PackageOpen } from 'lucide-react';

interface DispatcherDashboardProps {
  onLogout: () => void;
}

const ESTADOS: { value: EstadoPedido | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'en_camino', label: 'En camino' },
  { value: 'entregado', label: 'Entregados' },
];

const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'border-amber-500/40 text-amber-300',
  preparando: 'border-blue-500/40 text-blue-300',
  en_camino: 'border-purple-500/40 text-purple-300',
  entregado: 'border-green-500/40 text-green-300',
};

export function DispatcherDashboard({ onLogout }: DispatcherDashboardProps) {
  const [pedidos, setPedidos] = useState<PedidoConItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<EstadoPedido | 'todos'>('todos');
  const [soundOn, setSoundOn] = useState(true);
  const prevCountRef = useRef(0);
  const initialLoadRef = useRef(true);

  const fetchPedidos = useCallback(async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select(
        'id, numero_orden, nombre, celular, barrio, direccion, referencia, subtotal, domicilio, total, metodo_pago, estado, fecha, tipo_pedido, sede, pedido_items(id, pedido_id, tipo, nombre, cantidad, precio, combo_index, pedido_salsas(salsa))',
      )
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error fetching pedidos:', error);
      return;
    }

    const newData = (data || []) as unknown as PedidoConItems[];

    // Sound on new pending pedido
    const pendingCount = newData.filter((p) => p.estado === 'pendiente').length;
    if (
      !initialLoadRef.current &&
      soundOn &&
      pendingCount > prevCountRef.current
    ) {
      playNotificationSound();
    }
    prevCountRef.current = pendingCount;
    initialLoadRef.current = false;

    setPedidos(newData);
    setLoading(false);
  }, [soundOn]);

  useEffect(() => {
    fetchPedidos();

    const channel = supabase
      .channel('pedidos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        () => fetchPedidos(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedido_items' },
        () => fetchPedidos(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedido_salsas' },
        () => fetchPedidos(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPedidos]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  // Counts per estado
  const counts = {
    pendiente: pedidos.filter((p) => p.estado === 'pendiente').length,
    preparando: pedidos.filter((p) => p.estado === 'preparando').length,
    en_camino: pedidos.filter((p) => p.estado === 'en_camino').length,
    entregado: pedidos.filter((p) => p.estado === 'entregado').length,
  };

  // Filtered + searched
  const filtered = pedidos.filter((p) => {
    const matchesEstado = filtro === 'todos' || p.estado === filtro;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      p.numero_orden.toLowerCase().includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      p.celular.includes(q);
    return matchesEstado && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-ink-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-ink-900/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                <img src="/potines.png" alt="POTINES" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-base font-bold gold-text leading-tight">POTINES</h1>
                <p className="text-[10px] text-white/40 leading-tight">Panel de despacho</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundOn(!soundOn)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  soundOn
                    ? 'bg-gold-500/15 text-gold-400'
                    : 'bg-ink-700/60 text-white/40'
                }`}
                title={soundOn ? 'Sonido activado' : 'Sonido silenciado'}
              >
                <Bell className={`w-5 h-5 ${soundOn ? 'animate-ring' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-ink-700/60 flex items-center justify-center text-white/60 transition-all active:scale-90 hover:text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {(['pendiente', 'preparando', 'en_camino', 'entregado'] as EstadoPedido[]).map((est) => (
              <div
                key={est}
                className={`card p-3 text-center border ${ESTADO_STYLES[est]}`}
              >
                <p className="text-xl font-bold">
                  {counts[est]}
                </p>
                <p className="text-[10px] text-white/50 mt-0.5 capitalize">
                  {est === 'en_camino' ? 'En camino' : est}
                </p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número, cliente o celular..."
              className="input-field pl-11 py-3 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {ESTADOS.map((est) => (
              <button
                key={est.value}
                onClick={() => setFiltro(est.value)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  filtro === est.value
                    ? 'bg-gold-500 text-ink-900'
                    : 'bg-ink-700/60 text-white/50 hover:text-white/80'
                }`}
              >
                {est.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders list */}
      <div className="max-w-5xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
            <p className="text-white/40 text-sm">Cargando pedidos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-ink-700/60 flex items-center justify-center mb-4">
              <PackageOpen className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">
              {search ? 'No se encontraron pedidos' : 'No hay pedidos en esta categoría'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pedido, i) => (
              <div
                key={pedido.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
              >
                <OrderCard pedido={pedido} onEstadoChange={fetchPedidos} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
