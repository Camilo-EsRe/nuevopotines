import { useOrder } from '@/context/OrderContext';
import { formatCOP, COMBOS, BEBIDAS, ADICIONES, SALSAS } from '@/data/menu';
import { ProductImage } from '@/components/ProductImage';
import { Store } from 'lucide-react';

interface OrderSummaryProps {
  onNext: () => void;
  onBack: () => void;
}

export function OrderSummary({ onNext, onBack }: OrderSummaryProps) {
  const {
    comboInstances,
    bebidaCounts,
    adicionCounts,
    cliente,
    tipoPedido,
    sedeSeleccionada,
    subtotal,
    domicilioActual,
    total,
  } = useOrder();

  const isRecogida = tipoPedido === 'recogida';

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Resumen del pedido</h2>
        <p className="text-white/40 text-sm">Verifica todo antes de pagar.</p>
      </div>

      <div className="card p-5 space-y-5">
        {/* Combos */}
        {comboInstances.length > 0 && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gold-400 font-semibold mb-3">
              Combos
            </h3>
            <div className="space-y-2">
              {comboInstances.map((inst, i) => {
                const combo = COMBOS.find((c) => c.id === inst.comboId);
                if (!combo) return null;
                const labelIndex =
                  comboInstances.filter((x, j) => x.comboId === inst.comboId && j <= i).length;
                const salsaNames = inst.salsas
                  .map((sid) => SALSAS.find((s) => s.id === sid)?.nombre)
                  .filter(Boolean) as string[];
                return (
                  <div
                    key={inst.instanceId}
                    className="flex justify-between items-start gap-3 pb-2 border-b border-white/5"
                  >
                    <div className="flex-1 flex items-start gap-2">
                      <ProductImage
                        src={combo.imagen}
                        alt={combo.nombre}
                        className="w-8 h-8 rounded-lg bg-ink-700/60 flex-shrink-0 mt-0.5"
                        imgClassName="object-cover"
                      />
                      <div>
                        <p className="text-sm text-white font-medium">
                          {combo.nombre} #{labelIndex}
                        </p>
                        {salsaNames.length > 0 && (
                          <p className="text-xs text-white/40 mt-0.5">
                            Salsas: {salsaNames.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gold-400 font-semibold whitespace-nowrap">
                      {formatCOP(combo.precio)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bebidas */}
        {Object.values(bebidaCounts).some((c) => c > 0) && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gold-400 font-semibold mb-3">
              Bebidas
            </h3>
            <div className="space-y-2">
              {BEBIDAS.filter((b) => (bebidaCounts[b.id] || 0) > 0).map((b) => (
                <div
                  key={b.id}
                  className="flex justify-between items-center pb-2 border-b border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <ProductImage
                      src={b.imagen}
                      alt={b.nombre}
                      className="w-7 h-7 rounded-lg bg-ink-700/60 flex-shrink-0"
                      imgClassName="object-cover"
                    />
                    <p className="text-sm text-white">
                      {b.nombre}{' '}
                      <span className="text-white/40">x{bebidaCounts[b.id]}</span>
                    </p>
                  </div>
                  <p className="text-sm text-gold-400 font-semibold">
                    {formatCOP(b.precio * bebidaCounts[b.id])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adiciones */}
        {Object.values(adicionCounts).some((c) => c > 0) && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gold-400 font-semibold mb-3">
              Adiciones
            </h3>
            <div className="space-y-2">
              {ADICIONES.filter((a) => (adicionCounts[a.id] || 0) > 0).map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center pb-2 border-b border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <ProductImage
                      src={a.imagen}
                      alt={a.nombre}
                      className="w-7 h-7 rounded-lg bg-ink-700/60 flex-shrink-0"
                      imgClassName="object-cover"
                    />
                    <p className="text-sm text-white">
                      {a.nombre}{' '}
                      <span className="text-white/40">x{adicionCounts[a.id]}</span>
                    </p>
                  </div>
                  <p className="text-sm text-gold-400 font-semibold">
                    {formatCOP(a.precio * adicionCounts[a.id])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entrega info */}
        <div className="pt-3 border-t border-white/10">
          <h3 className="text-xs uppercase tracking-wider text-gold-400 font-semibold mb-3">
            {isRecogida ? 'Recogida' : 'Entrega'}
          </h3>
          {isRecogida ? (
            <div className="space-y-1.5 text-sm">
              <div className="flex items-start gap-2">
                <Store className="w-4 h-4 mt-0.5 flex-shrink-0 text-gold-400" />
                <div>
                  <p className="text-white font-medium">
                    {sedeSeleccionada?.nombre}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    {sedeSeleccionada?.direccion}
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/40 mt-2">
                Presenta tu numero de pedido en caja para reclamar.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 text-sm">
              <div className="flex gap-2">
                <span className="text-white/40 w-20 flex-shrink-0">Nombre:</span>
                <span className="text-white">{cliente.nombre}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-white/40 w-20 flex-shrink-0">Celular:</span>
                <span className="text-white">{cliente.celular}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-white/40 w-20 flex-shrink-0">Barrio:</span>
                <span className="text-white">{cliente.barrio}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-white/40 w-20 flex-shrink-0">Direccion:</span>
                <span className="text-white">{cliente.direccion}</span>
              </div>
              {cliente.referencia && (
                <div className="flex gap-2">
                  <span className="text-white/40 w-20 flex-shrink-0">Ref.:</span>
                  <span className="text-white/80">{cliente.referencia}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Subtotal</span>
            <span className="text-white font-medium">{formatCOP(subtotal)}</span>
          </div>
          {!isRecogida && (
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Domicilio</span>
              <span className="text-white font-medium">
                {formatCOP(domicilioActual)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gold-500/20">
            <span className="text-gold-300 font-semibold text-base">Total</span>
            <span className="text-gold-400 font-bold text-xl">
              {formatCOP(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-5 pt-3 bg-gradient-to-t from-ink-900 via-ink-900/95 to-transparent">
          <div className="flex gap-3">
            <button onClick={onBack} className="btn-outline-gold px-5 py-4 text-sm">
              Atras
            </button>
            <button onClick={onNext} className="btn-gold flex-1 py-4 text-sm">
              Ir a pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
