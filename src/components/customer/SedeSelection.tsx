import { useEffect, useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { supabase } from '@/lib/supabase';
import { MapPin, Check, Loader2, Store } from 'lucide-react';
import type { Sede } from '@/types';

interface SedeSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export function SedeSelection({ onNext, onBack }: SedeSelectionProps) {
  const { sedeSeleccionada, setSedeSeleccionada } = useOrder();
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('sedes')
        .select('id, nombre, direccion, telefono, activo, orden')
        .eq('activo', true)
        .order('orden');
      if (!cancelled && data) {
        setSedes(data as Sede[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Elige la sede</h2>
        <p className="text-white/40 text-sm">
          Recogera tu pedido en la sede que prefieras.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
          <p className="text-white/40 text-sm">Cargando sedes...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sedes.map((sede, i) => {
            const selected = sedeSeleccionada?.id === sede.id;
            return (
              <button
                key={sede.id}
                onClick={() => setSedeSeleccionada(sede)}
                className={`w-full card p-5 flex items-start gap-4 text-left transition-all duration-200 active:scale-[0.98] animate-fadeIn ${
                  selected
                    ? 'border-gold-500/50 shadow-gold'
                    : 'hover:border-gold-500/30'
                }`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected ? 'bg-gold-500/25' : 'bg-ink-700/60'
                  }`}
                >
                  <Store
                    className={`w-6 h-6 transition-colors ${
                      selected ? 'text-gold-400' : 'text-white/50'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white">
                    {sede.nombre}
                  </h3>
                  <div className="flex items-start gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gold-400/60" />
                    <p className="text-xs text-white/50 leading-relaxed">
                      {sede.direccion}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    selected ? 'border-gold-500 bg-gold-500' : 'border-white/20'
                  }`}
                >
                  {selected && (
                    <Check
                      className="w-4 h-4 text-ink-900"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Sticky nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-5 pt-3 bg-gradient-to-t from-ink-900 via-ink-900/95 to-transparent">
          <div className="flex gap-3">
            <button onClick={onBack} className="btn-outline-gold px-5 py-4 text-sm">
              Atras
            </button>
            <button
              onClick={onNext}
              disabled={!sedeSeleccionada}
              className="btn-gold flex-1 py-4 text-sm"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
