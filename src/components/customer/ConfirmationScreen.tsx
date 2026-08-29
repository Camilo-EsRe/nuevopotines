import { useEffect, useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { formatCOP } from '@/data/menu';
import { RotateCcw, CheckCircle2, Store, Clock } from 'lucide-react';

interface ConfirmationScreenProps {
  numeroOrden: string;
  onRestart: () => void;
}

export function ConfirmationScreen({ numeroOrden, onRestart }: ConfirmationScreenProps) {
  const { total, metodoPago, resetOrder, tipoPedido, sedeSeleccionada } = useOrder();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleRestart = () => {
    resetOrder();
    onRestart();
  };

  const isRecogida = tipoPedido === 'recogida';

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated check */}
        <div className={`transition-all duration-500 ${show ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-b from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={2} />
            </div>
            <div className="absolute -inset-3 rounded-full border-2 border-green-500/20 animate-pulseGold" />
          </div>
        </div>

        <h2 className="mt-8 text-2xl font-bold text-white animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          {isRecogida ? '¡Pedido realizado!' : '¡Pedido confirmado!'}
        </h2>
        <p className="text-white/50 text-sm mt-1 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          {isRecogida
            ? metodoPago === 'transferencia'
              ? 'Pago confirmado por transferencia'
              : 'Paga en caja al reclamar tu pedido'
            : metodoPago === 'transferencia'
              ? 'Pago confirmado por transferencia'
              : 'Pago en efectivo al recibir'}
        </p>

        {/* Order number card */}
        <div
          className="card p-6 mt-8 w-full max-w-xs border-gold-500/20 animate-slideUp"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
            Numero de pedido
          </p>
          <p className="text-3xl font-bold gold-text mb-4">{numeroOrden}</p>

          {isRecogida && sedeSeleccionada && (
            <div className="flex items-center gap-2 py-3 border-t border-white/10 justify-center">
              <Store className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-white font-medium">
                {sedeSeleccionada.nombre}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-t border-white/10">
            <span className="text-sm text-white/60">Total</span>
            <span className="text-lg font-bold text-gold-400">{formatCOP(total)}</span>
          </div>

          {isRecogida ? (
            <div className="mt-4 p-3 bg-gold-500/10 rounded-xl">
              <p className="text-xs text-gold-200 leading-relaxed">
                Presenta este numero en caja para reclamar tu pedido.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-4 justify-center">
              <Clock className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-white/60">Tiempo estimado: 20-30 min</span>
            </div>
          )}
        </div>

        {/* Restart button */}
        <button
          onClick={handleRestart}
          className="mt-8 btn-gold px-8 py-4 text-base flex items-center gap-2 animate-slideUp w-full max-w-xs justify-center"
          style={{ animationDelay: '0.9s' }}
        >
          <RotateCcw className="w-5 h-5" />
          <span>Hacer otro pedido</span>
        </button>
      </div>
    </div>
  );
}
