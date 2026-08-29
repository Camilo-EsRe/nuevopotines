import { useEffect, useState, useRef, useCallback } from 'react';
import { useOrder } from '@/context/OrderContext';
import { supabase } from '@/lib/supabase';
import { formatCOP } from '@/data/menu';
import {
  RotateCcw,
  CheckCircle2,
  Store,
  Clock,
  ChefHat,
  PackageCheck,
  Bike,
  PartyPopper,
  Receipt,
} from 'lucide-react';

interface OrderTrackingProps {
  numeroOrden: string;
  pedidoId: string;
  onRestart: () => void;
}

type TrackingStage =
  | 'preparando'
  | 'enviando'
  | 'en_camino'
  | 'listo'
  | 'entregado';

interface StageInfo {
  label: string;
  description: string;
  icon: typeof ChefHat;
  color: string;
}

const DOMICILIO_STAGES: { stage: TrackingStage; info: StageInfo }[] = [
  {
    stage: 'preparando',
    info: {
      label: 'Preparando',
      description: 'Estamos preparando tu pedido',
      icon: ChefHat,
      color: 'text-amber-400',
    },
  },
  {
    stage: 'enviando',
    info: {
      label: 'Enviando',
      description: 'Tu pedido está siendo enviado',
      icon: PackageCheck,
      color: 'text-blue-400',
    },
  },
  {
    stage: 'en_camino',
    info: {
      label: 'En camino',
      description: 'El domiciliario va en camino',
      icon: Bike,
      color: 'text-cyan-400',
    },
  },
  {
    stage: 'entregado',
    info: {
      label: 'Entregado',
      description: '¡Disfruta tu pedido!',
      icon: CheckCircle2,
      color: 'text-green-400',
    },
  },
];

const RECOGIDA_STAGES: { stage: TrackingStage; info: StageInfo }[] = [
  {
    stage: 'preparando',
    info: {
      label: 'Preparando',
      description: 'Estamos preparando tu pedido',
      icon: ChefHat,
      color: 'text-amber-400',
    },
  },
  {
    stage: 'listo',
    info: {
      label: 'Listo',
      description: '¡Tu pedido está listo para recoger!',
      icon: PartyPopper,
      color: 'text-green-400',
    },
  },
];

// Timings in ms for the simulated progression
const DOMICILIO_TIMINGS: Record<TrackingStage, number> = {
  preparando: 20 * 60 * 1000, // 20 minutes
  enviando: 5 * 60 * 1000, // 5 minutes
  en_camino: 0, // stays until dispatcher marks delivered
  listo: 0,
  entregado: 0,
};

const RECOGIDA_TIMINGS: Record<TrackingStage, number> = {
  preparando: 15 * 60 * 1000, // 15 minutes (shorter for pickup)
  enviando: 0,
  en_camino: 0,
  listo: 0,
  entregado: 0,
};

export function OrderTracking({ numeroOrden, pedidoId, onRestart }: OrderTrackingProps) {
  const { total, metodoPago, resetOrder, tipoPedido, sedeSeleccionada } = useOrder();
  const [show, setShow] = useState(false);
  const [currentStage, setCurrentStage] = useState<TrackingStage>('preparando');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [dbEstado, setDbEstado] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isRecogida = tipoPedido === 'recogida';
  const stages = isRecogida ? RECOGIDA_STAGES : DOMICILIO_STAGES;
  const timings = isRecogida ? RECOGIDA_TIMINGS : DOMICILIO_TIMINGS;
  const currentStageIndex = stages.findIndex((s) => s.stage === currentStage);

  // Clear all timers
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Fetch the real estado from the DB (in case dispatcher updates it)
  const fetchDbEstado = useCallback(async () => {
    const { data } = await supabase
      .from('pedidos')
      .select('estado')
      .eq('id', pedidoId)
      .maybeSingle();
    if (data?.estado) {
      setDbEstado(data.estado);
    }
  }, [pedidoId]);

  // Set up simulated timer-based progression + realtime subscription
  useEffect(() => {
    setShow(true);
    startTimeRef.current = Date.now();
    clearTimers();

    if (isRecogida) {
      // Recogida: preparando → listo after 15 min
      const t1 = setTimeout(() => {
        setCurrentStage('listo');
        supabase.from('pedidos').update({ estado: 'preparando' }).eq('id', pedidoId);
      }, timings.preparando);
      timersRef.current.push(t1);
    } else {
      // Domicilio: preparando → enviando (20 min) → en_camino (5 min)
      const t1 = setTimeout(() => {
        setCurrentStage('enviando');
        supabase.from('pedidos').update({ estado: 'preparando' }).eq('id', pedidoId);
      }, timings.preparando);

      const t2 = setTimeout(() => {
        setCurrentStage('en_camino');
        supabase.from('pedidos').update({ estado: 'en_camino' }).eq('id', pedidoId);
      }, timings.preparando + timings.enviando);

      timersRef.current.push(t1, t2);
    }

    // Realtime: if dispatcher marks entregado, update UI
    const channel = supabase
      .channel(`pedido-${pedidoId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${pedidoId}` },
        (payload) => {
          const newEstado = (payload.new as { estado?: string })?.estado;
          if (newEstado) {
            setDbEstado(newEstado);
            if (newEstado === 'entregado') {
              clearTimers();
              setCurrentStage('entregado');
            }
          }
        },
      )
      .subscribe();

    fetchDbEstado();

    return () => {
      clearTimers();
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedidoId, isRecogida]);

  // Elapsed timer for display
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = () => {
    clearTimers();
    resetOrder();
    onRestart();
  };

  const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // If DB estado is entregado, override
  const effectiveStage: TrackingStage =
    dbEstado === 'entregado' ? 'entregado' : currentStage;
  const effectiveIndex = stages.findIndex((s) => s.stage === effectiveStage);

  return (
    <div className="min-h-screen bg-ink-900 max-w-md mx-auto flex flex-col">
      {/* Glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-gold-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-6 pt-10 pb-6 flex-1">
        {/* Animated check */}
        <div className={`transition-all duration-500 ${show ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2} />
            </div>
            <div className="absolute -inset-3 rounded-full border-2 border-green-500/20 animate-pulseGold" />
          </div>
        </div>

        <h2 className="mt-6 text-xl font-bold text-white animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          {isRecogida ? '¡Pedido realizado!' : '¡Pedido confirmado!'}
        </h2>
        <p className="text-white/50 text-sm mt-1 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          {metodoPago === 'transferencia'
            ? 'Pago confirmado por transferencia'
            : isRecogida
              ? 'Paga en caja al reclamar tu pedido'
              : 'Pago en efectivo al recibir'}
        </p>

        {/* Order number */}
        <div className="mt-6 w-full max-w-xs animate-slideUp" style={{ animationDelay: '0.5s' }}>
          <div className="card p-5 border-gold-500/20 text-center">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
              Numero de pedido
            </p>
            <p className="text-2xl font-bold gold-text">{numeroOrden}</p>

            {isRecogida && sedeSeleccionada && (
              <div className="flex items-center gap-2 py-3 mt-3 border-t border-white/10 justify-center">
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
          </div>
        </div>

        {/* Tracking */}
        <div className="mt-8 w-full max-w-xs animate-slideUp" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gold-300 uppercase tracking-wider">
              Seguimiento
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock className="w-3.5 h-3.5" />
              <span className="tabular-nums">{formatElapsed(elapsedMs)}</span>
            </div>
          </div>

          {/* Stages */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/8" />
            <div
              className="absolute left-[19px] top-2 w-0.5 bg-gradient-to-b from-gold-400 to-gold-500 transition-all duration-700 ease-out"
              style={{
                height:
                  effectiveIndex <= 0
                    ? '0%'
                    : `${(effectiveIndex / (stages.length - 1)) * 100}%`,
              }}
            />

            <div className="space-y-5">
              {stages.map(({ stage, info }, i) => {
                const isDone = i < effectiveIndex;
                const isActive = i === effectiveIndex;
                const Icon = info.icon;

                return (
                  <div key={stage} className="flex items-start gap-4 relative">
                    {/* Circle */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ${
                        isDone
                          ? 'bg-gold-500 text-ink-900'
                          : isActive
                            ? `bg-ink-700 border-2 border-gold-500 ${info.color}`
                            : 'bg-ink-700/60 text-white/25 border-2 border-white/5'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${isActive ? info.color : 'text-white/25'}`}
                          strokeWidth={2}
                        />
                      )}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full border-2 border-gold-500/40 animate-pulseGold" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 pt-1">
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isDone || isActive ? 'text-white' : 'text-white/30'
                        }`}
                      >
                        {info.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 transition-colors ${
                          isActive ? 'text-white/60' : isDone ? 'text-white/40' : 'text-white/20'
                        }`}
                      >
                        {info.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recogida ready notice */}
          {isRecogida && effectiveStage === 'listo' && (
            <div className="mt-6 p-4 bg-green-500/10 rounded-2xl border border-green-500/20 animate-fadeIn">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-300 font-semibold">
                  ¡Listo para reclamar!
                </p>
              </div>
              <p className="text-xs text-green-200/70 leading-relaxed">
                Presenta tu numero de pedido en caja de {sedeSeleccionada?.nombre}.
              </p>
            </div>
          )}

          {/* Entregado notice */}
          {effectiveStage === 'entregado' && (
            <div className="mt-6 p-4 bg-green-500/10 rounded-2xl border border-green-500/20 animate-fadeIn">
              <div className="flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-300 font-semibold">
                  {isRecogida ? '¡Pedido reclamado!' : '¡Pedido entregado!'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Restart button */}
        <button
          onClick={handleRestart}
          className="mt-auto pt-8 btn-gold px-8 py-4 text-base flex items-center gap-2 w-full max-w-xs justify-center animate-slideUp"
          style={{ animationDelay: '0.9s' }}
        >
          <RotateCcw className="w-5 h-5" />
          <span>Hacer otro pedido</span>
        </button>
      </div>
    </div>
  );
}
