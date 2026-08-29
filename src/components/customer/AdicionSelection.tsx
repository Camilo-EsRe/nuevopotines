import { ADICIONES, formatCOP } from '@/data/menu';
import { useOrder } from '@/context/OrderContext';
import { QuantityButton } from '@/components/QuantityButton';
import { ProductImage } from '@/components/ProductImage';

interface AdicionSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export function AdicionSelection({ onNext, onBack }: AdicionSelectionProps) {
  const { adicionCounts, addAdicion, removeAdicion } = useOrder();

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Adiciones</h2>
        <p className="text-white/40 text-sm">¿Quieres agregar algo extra? Opcional.</p>
      </div>

      <div className="space-y-3">
        {ADICIONES.map((adic, i) => {
          const count = adicionCounts[adic.id] || 0;
          const selected = count > 0;
          return (
            <div
              key={adic.id}
              className={`card p-4 flex items-center justify-between transition-all duration-300 ${
                selected ? 'border-gold-500/50 shadow-gold' : ''
              } animate-fadeIn`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-center gap-3 flex-1">
                <ProductImage
                  src={adic.imagen}
                  alt={adic.nombre}
                  className="w-12 h-12 rounded-2xl bg-ink-700/60 flex-shrink-0"
                  imgClassName="object-cover"
                />
                <div>
                  <h3 className="text-sm font-semibold text-white">{adic.nombre}</h3>
                  <p className="text-gold-400 font-bold text-sm">{formatCOP(adic.precio)}</p>
                </div>
              </div>
              <QuantityButton
                count={count}
                onAdd={() => addAdicion(adic.id)}
                onRemove={() => removeAdicion(adic.id)}
              />
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-5 pt-3 bg-gradient-to-t from-ink-900 via-ink-900/95 to-transparent">
          <div className="flex gap-3">
            <button onClick={onBack} className="btn-outline-gold px-5 py-4 text-sm">
              Atrás
            </button>
            <button onClick={onNext} className="btn-gold flex-1 py-4 text-sm">
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
