import { COMBOS, formatCOP } from '@/data/menu';
import { useOrder } from '@/context/OrderContext';
import { QuantityButton } from '@/components/QuantityButton';
import { ProductImage } from '@/components/ProductImage';
import { Star, Flame } from 'lucide-react';
import type { Combo } from '@/types';

interface ComboSelectionProps {
  onNext: () => void;
}

const GRUPO_LABELS: Record<string, { title: string; subtitle: string }> = {
  snacks: {
    title: 'Potisnacks',
    subtitle: 'Pequenos bocados, gigante explosion de sabor',
  },
  bombones: {
    title: 'Potibombones',
    subtitle: 'Para los verdaderos amantes del pollo',
  },
  temporada: {
    title: 'Combo de Temporada',
    subtitle: 'Edicion especial, abundante y llena de texturas',
  },
};

export function ComboSelection({ onNext }: ComboSelectionProps) {
  const { comboCounts, addCombo, removeCombo } = useOrder();
  const totalCombos = Object.values(comboCounts).reduce((a, b) => a + b, 0);

  const estrella = COMBOS.find((c) => c.grupo === 'estrella');
  const snacks = COMBOS.filter((c) => c.grupo === 'snacks');
  const bombones = COMBOS.filter((c) => c.grupo === 'bombones');
  const temporada = COMBOS.filter((c) => c.grupo === 'temporada');

  const renderComboCard = (combo: Combo, index: number) => {
    const count = comboCounts[combo.id] || 0;
    const selected = count > 0;
    return (
      <div
        key={combo.id}
        className={`card p-4 transition-all duration-300 ${
          selected ? 'border-gold-500/50 shadow-gold animate-scaleIn' : ''
        }`}
        style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'backwards' }}
      >
        <div className="flex items-start gap-3">
            <ProductImage
              src={combo.imagen}
              alt={combo.nombre}
              className="w-16 h-16 rounded-2xl flex-shrink-0 bg-ink-700/60"
              imgClassName="object-cover"
            />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-semibold text-white">{combo.nombre}</h3>
              {selected && (
                <span className="text-xs bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full font-medium">
                  {count}x
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {combo.descripcion.map((item) => (
                <span
                  key={item}
                  className="text-xs bg-ink-600/60 text-white/60 px-2 py-0.5 rounded-lg"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="text-xs text-white/45 leading-relaxed mb-2.5">
              {combo.descripcionLarga}
            </p>
            <p className="text-gold-400 font-bold text-base">{formatCOP(combo.precio)}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <QuantityButton
            count={count}
            onAdd={() => addCombo(combo.id)}
            onRemove={() => removeCombo(combo.id)}
          />
        </div>
      </div>
    );
  };

  const renderGroup = (
    grupo: string,
    items: Combo[],
    startIndex: number,
  ) => {
    const label = GRUPO_LABELS[grupo];
    if (!label || items.length === 0) return null;
    return (
      <div className="mb-6">
        <div className="mb-3 px-1">
          <h3 className="text-lg font-bold text-gold-300">{label.title}</h3>
          <p className="text-xs text-white/40">{label.subtitle}</p>
        </div>
        <div className="space-y-3">
          {items.map((combo, i) => renderComboCard(combo, startIndex + i))}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Nuestro menu</h2>
        <p className="text-white/40 text-sm">
          Toca + para agregar. Puedes pedir varios del mismo tipo.
        </p>
      </div>

      {/* POTIPAPA - Estrella destacada */}
      {estrella && (() => {
        const count = comboCounts[estrella.id] || 0;
        const selected = count > 0;
        return (
          <div
            className={`relative mb-6 rounded-3xl overflow-hidden transition-all duration-300 ${
              selected ? 'shadow-gold animate-scaleIn' : ''
            }`}
            style={{ animationDelay: '0s', animationFillMode: 'backwards' }}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/15 via-ink-800/90 to-ink-800/80" />
            <div className="absolute inset-0 border-2 border-gold-500/30 rounded-3xl" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl" />

            {/* Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-gold-500 text-ink-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              <Flame className="w-3.5 h-3.5" />
              <span>LA ESTRELLA DE LA CASA</span>
            </div>

            <div className="relative z-10 p-6 pt-14">
              <div className="flex items-start gap-4 mb-4">
                <ProductImage
                  src={estrella.imagen}
                  alt={estrella.nombre}
                  className="w-20 h-20 rounded-2xl flex-shrink-0 border border-gold-500/30 bg-gold-500/20"
                  imgClassName="object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-white">{estrella.nombre}</h3>
                    {selected && (
                      <span className="text-xs bg-gold-500/30 text-gold-200 px-2 py-0.5 rounded-full font-bold">
                        {count}x
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {estrella.descripcion.map((item) => (
                      <span
                        key={item}
                        className="text-xs bg-ink-600/80 text-white/70 px-2.5 py-1 rounded-lg"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="text-3xl font-black gold-text">
                    {formatCOP(estrella.precio)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-white/60 leading-relaxed mb-5">
                {estrella.descripcionLarga}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gold-400">
                  <Star className="w-4 h-4 fill-gold-400" />
                  <span className="text-xs font-semibold">El mas pedido</span>
                </div>
                <QuantityButton
                  count={count}
                  onAdd={() => addCombo(estrella.id)}
                  onRemove={() => removeCombo(estrella.id)}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grupos */}
      {renderGroup('snacks', snacks, 1)}
      {renderGroup('bombones', bombones, 1 + snacks.length)}
      {renderGroup('temporada', temporada, 1 + snacks.length + bombones.length)}

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-5 pt-3 bg-gradient-to-t from-ink-900 via-ink-900/95 to-transparent">
          <button
            onClick={onNext}
            disabled={totalCombos === 0}
            className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2"
          >
            <span>Continuar</span>
            {totalCombos > 0 && (
              <span className="bg-ink-900/20 px-2 py-0.5 rounded-lg text-sm">
                {totalCombos} combo{totalCombos > 1 ? 's' : ''}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
