import { BEBIDAS, formatCOP } from '@/data/menu';
import { useOrder } from '@/context/OrderContext';
import { QuantityButton } from '@/components/QuantityButton';
import { ProductImage } from '@/components/ProductImage';

interface BebidaSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export function BebidaSelection({ onNext, onBack }: BebidaSelectionProps) {
  const { bebidaCounts, addBebida, removeBebida } = useOrder();
  const totalBebidas = Object.values(bebidaCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Bebidas</h2>
        <p className="text-white/40 text-sm">Todas a {formatCOP(3000)}. Opcional.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {BEBIDAS.map((bebida, i) => {
          const count = bebidaCounts[bebida.id] || 0;
          const selected = count > 0;
          return (
            <div
              key={bebida.id}
              className={`card p-4 flex flex-col items-center text-center transition-all duration-300 ${
                selected ? 'border-gold-500/50 shadow-gold' : ''
              } animate-fadeIn`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <ProductImage
                src={bebida.imagen}
                alt={bebida.nombre}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-b ${bebida.color} mb-3 shadow-lg`}
                imgClassName="object-cover"
              />
              <h3 className="text-sm font-semibold text-white mb-1 leading-tight">
                {bebida.nombre}
              </h3>
              <p className="text-gold-400 font-bold text-sm mb-3">
                {formatCOP(bebida.precio)}
              </p>
              <QuantityButton
                count={count}
                onAdd={() => addBebida(bebida.id)}
                onRemove={() => removeBebida(bebida.id)}
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
            <button onClick={onNext} className="btn-gold flex-1 py-4 text-sm flex items-center justify-center gap-2">
              <span>Continuar</span>
              {totalBebidas > 0 && (
                <span className="bg-ink-900/20 px-2 py-0.5 rounded-lg text-xs">
                  {totalBebidas}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
