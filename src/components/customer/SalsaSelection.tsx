import { SALSAS } from '@/data/menu';
import { useOrder } from '@/context/OrderContext';
import { COMBOS } from '@/data/menu';
import { ProductImage } from '@/components/ProductImage';
import { Check } from 'lucide-react';

interface SalsaSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export function SalsaSelection({ onNext, onBack }: SalsaSelectionProps) {
  const { comboInstances, setSalsaForInstance } = useOrder();

  const allComplete = comboInstances.every((inst) => inst.salsas.length > 0);

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Salsas por combo</h2>
        <p className="text-white/40 text-sm">
          Selecciona una o más salsas para cada combo.
        </p>
      </div>

      {comboInstances.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-white/50">No hay combos seleccionados.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comboInstances.map((inst, i) => {
            const combo = COMBOS.find((c) => c.id === inst.comboId);
            if (!combo) return null;
            // Count how many of this combo type came before this instance
            const labelIndex =
              comboInstances.filter((x, j) => x.comboId === inst.comboId && j <= i).length;
            return (
              <div
                key={inst.instanceId}
                className="card p-5 animate-fadeIn"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <ProductImage
                    src={combo.imagen}
                    alt={combo.nombre}
                    className="w-10 h-10 rounded-xl bg-ink-700/60 flex-shrink-0"
                    imgClassName="object-cover"
                  />
                  <h3 className="text-base font-semibold text-white">
                    {combo.nombre} <span className="text-gold-400">#{labelIndex}</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {SALSAS.map((salsa) => {
                    const checked = inst.salsas.includes(salsa.id);
                    return (
                      <button
                        key={salsa.id}
                        onClick={() => setSalsaForInstance(inst.instanceId, salsa.id)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all duration-200 active:scale-98 ${
                          checked
                            ? 'bg-gold-500/15 border-gold-500/50 text-gold-200'
                            : 'bg-ink-700/40 border-white/5 text-white/70 hover:border-gold-500/30'
                        }`}
                      >
                        <span className="text-sm font-medium">{salsa.nombre}</span>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            checked ? 'bg-gold-500 text-ink-900' : 'border border-white/20'
                          }`}
                        >
                          {checked && <Check className="w-4 h-4" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-5 pt-3 bg-gradient-to-t from-ink-900 via-ink-900/95 to-transparent">
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="btn-outline-gold px-5 py-4 text-sm"
            >
              Atrás
            </button>
            <button
              onClick={onNext}
              disabled={!allComplete}
              className="btn-gold flex-1 py-4 text-sm"
            >
              {allComplete ? 'Continuar' : 'Selecciona todas las salsas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
