import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCOP } from '@/data/menu';
import type { PedidoConItems } from '@/types';
import {
  Clock,
  Phone,
  MapPin,
  Home,
  CreditCard,
  Banknote,
  ChevronDown,
  Check,
  Store,
  Truck,
} from 'lucide-react';

interface OrderCardProps {
  pedido: PedidoConItems;
  onEstadoChange: () => void;
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  en_camino: 'En camino',
  entregado: 'Entregado',
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  preparando: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  en_camino: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  entregado: 'bg-green-500/15 text-green-300 border-green-500/30',
};

const NEXT_ACTION: Record<
  string,
  { label: string; to: string } | null
> = {
  pendiente: { label: 'Aceptar', to: 'preparando' },
  preparando: { label: 'Marcar en camino', to: 'en_camino' },
  en_camino: { label: 'Marcar entregado', to: 'entregado' },
  entregado: null,
};

const NEXT_ACTION_RECOGIDA: Record<
  string,
  { label: string; to: string } | null
> = {
  pendiente: { label: 'Aceptar', to: 'preparando' },
  preparando: { label: 'Marcar listo', to: 'entregado' },
  en_camino: null,
  entregado: null,
};

export function OrderCard({ pedido, onEstadoChange }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const isRecogida = (pedido.tipo_pedido ?? 'domicilio') === 'recogida';
  const actionMap = isRecogida ? NEXT_ACTION_RECOGIDA : NEXT_ACTION;

  const hora = new Date(pedido.fecha).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const advance = async () => {
    const action = actionMap[pedido.estado];
    if (!action) return;
    setUpdating(true);
    await supabase.from('pedidos').update({ estado: action.to }).eq('id', pedido.id);
    setUpdating(false);
    onEstadoChange();
  };

  const items = pedido.pedido_items || [];

  return (
    <div
      className={`card overflow-hidden transition-all duration-300 ${
        pedido.estado === 'pendiente' ? 'border-gold-500/30 shadow-gold' : ''
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-base font-bold text-gold-400">
                {pedido.numero_orden}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  ESTADO_COLORS[pedido.estado]
                }`}
              >
                {ESTADO_LABELS[pedido.estado]}
              </span>
              {/* Modalidad badge */}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isRecogida
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-gold-500/15 text-gold-300 border-gold-500/30'
                }`}
              >
                {isRecogida ? (
                  <>
                    <Store className="w-2.5 h-2.5" /> Pide y pasa
                  </>
                ) : (
                  <>
                    <Truck className="w-2.5 h-2.5" /> Domicilio
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock className="w-3 h-3" />
              <span>{hora}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gold-400">
              {formatCOP(pedido.total)}
            </p>
            <p className="text-xs text-white/40 flex items-center gap-1 justify-end">
              {pedido.metodo_pago === 'transferencia' ? (
                <>
                  <CreditCard className="w-3 h-3" /> Transferencia
                </>
              ) : (
                <>
                  <Banknote className="w-3 h-3" /> Efectivo
                </>
              )}
            </p>
          </div>
        </div>

        {/* Cliente / Sede info */}
        <div className="space-y-1.5 text-sm">
          {isRecogida ? (
            <>
              <div className="flex items-start gap-2 text-white/80">
                <Store className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-cyan-400" />
                <div>
                  <span className="font-medium">{pedido.sede ?? 'Sede no asignada'}</span>
                  <p className="text-white/40 text-xs mt-0.5">
                    Recogida en caja con numero de pedido
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-white/80">
                <span className="font-medium">{pedido.nombre}</span>
                {pedido.celular && (
                  <a
                    href={`tel:${pedido.celular}`}
                    className="text-gold-400 flex items-center gap-1 text-xs ml-auto"
                  >
                    <Phone className="w-3 h-3" /> {pedido.celular}
                  </a>
                )}
              </div>
              <div className="flex items-start gap-2 text-white/60 text-xs">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gold-400/60" />
                <span>
                  {pedido.direccion}, {pedido.barrio}
                </span>
              </div>
              {pedido.referencia && (
                <div className="flex items-start gap-2 text-white/40 text-xs">
                  <Home className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{pedido.referencia}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Items summary */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 flex items-center justify-between text-xs text-white/50 hover:text-gold-300 transition-colors"
        >
          <span>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 pt-3 border-t border-white/5 animate-fadeIn">
            {items.map((item) => (
              <div key={item.id} className="text-xs">
                <div className="flex justify-between">
                  <span className="text-white/80">
                    {item.cantidad > 1 ? `x${item.cantidad} ` : ''}
                    {item.nombre}
                    <span className="text-white/30 ml-1">
                      ({item.tipo})
                    </span>
                  </span>
                  <span className="text-gold-400/70">
                    {formatCOP(item.precio * item.cantidad)}
                  </span>
                </div>
                {item.pedido_salsas && item.pedido_salsas.length > 0 && (
                  <p className="text-white/40 ml-3 mt-0.5">
                    Salsas: {item.pedido_salsas.map((s) => s.salsa).join(', ')}
                  </p>
                )}
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-white/5">
              <span className="text-white/40 text-xs">Subtotal</span>
              <span className="text-white/60 text-xs">
                {formatCOP(pedido.subtotal)}
              </span>
            </div>
            {!isRecogida && (
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Domicilio</span>
                <span className="text-white/60 text-xs">
                  {formatCOP(pedido.domicilio)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action button */}
      {actionMap[pedido.estado] && (
        <div className="px-4 pb-4">
          <button
            onClick={advance}
            disabled={updating}
            className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2"
          >
            {actionMap[pedido.estado]?.label}
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
