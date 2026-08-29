import { useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { supabase } from '@/lib/supabase';
import { formatCOP, COMBOS, BEBIDAS, ADICIONES, SALSAS } from '@/data/menu';
import {
  CreditCard,
  Banknote,
  Copy,
  Check,
  Loader2,
  QrCode,
  MessageCircle,
  Receipt,
} from 'lucide-react';

interface PaymentScreenProps {
  onComplete: (numeroOrden: string, pedidoId: string) => void;
  onBack: () => void;
}

const WHATSAPP_NUMBER = '573127819820'; // WhatsApp de POTINES

export function PaymentScreen({ onComplete, onBack }: PaymentScreenProps) {
  const {
    metodoPago,
    setMetodoPago,
    buildItems,
    cliente,
    subtotal,
    domicilioActual,
    total,
    tipoPedido,
    sedeSeleccionada,
    comboInstances,
    bebidaCounts,
    adicionCounts,
  } = useOrder();
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [whatsappSent, setWhatsappSent] = useState(false);

  const BANCOLOMBIA_CUENTA = '54192938468';
  const BANCOLOMBIA_TIPO = 'Cuenta de Ahorros Bancolombia';
  const NEQUI_LLAVE = 'BRE-B 39169520';

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  const buildOrderSummaryText = (numeroOrden: string): string => {
    const lines: string[] = [];
    lines.push('*POTINES - Pedido #' + numeroOrden + '*');
    lines.push('');

    // Combos
    if (comboInstances.length > 0) {
      lines.push('*Combos:*');
      comboInstances.forEach((inst, i) => {
        const combo = COMBOS.find((c) => c.id === inst.comboId);
        if (!combo) return;
        const labelIndex =
          comboInstances.filter((x, j) => x.comboId === inst.comboId && j <= i).length;
        const salsaNames = inst.salsas
          .map((sid) => SALSAS.find((s) => s.id === sid)?.nombre)
          .filter(Boolean) as string[];
        lines.push(
          `  ${combo.nombre} #${labelIndex} - ${formatCOP(combo.precio)}` +
            (salsaNames.length > 0 ? ` (Salsas: ${salsaNames.join(', ')})` : ''),
        );
      });
    }

    // Bebidas
    const bebidaLines = BEBIDAS.filter((b) => (bebidaCounts[b.id] || 0) > 0);
    if (bebidaLines.length > 0) {
      lines.push('*Bebidas:*');
      bebidaLines.forEach((b) => {
        lines.push(`  ${b.nombre} x${bebidaCounts[b.id]} - ${formatCOP(b.precio * bebidaCounts[b.id])}`);
      });
    }

    // Adiciones
    const adicionLines = ADICIONES.filter((a) => (adicionCounts[a.id] || 0) > 0);
    if (adicionLines.length > 0) {
      lines.push('*Adiciones:*');
      adicionLines.forEach((a) => {
        lines.push(`  ${a.nombre} x${adicionCounts[a.id]} - ${formatCOP(a.precio * adicionCounts[a.id])}`);
      });
    }

    lines.push('');
    lines.push(`Subtotal: ${formatCOP(subtotal)}`);
    if (tipoPedido === 'domicilio') {
      lines.push(`Domicilio: ${formatCOP(domicilioActual)}`);
    }
    lines.push(`*Total: ${formatCOP(total)}*`);
    lines.push('');

    if (tipoPedido === 'recogida') {
      lines.push(`Modalidad: Pide y pasa`);
      lines.push(`Sede: ${sedeSeleccionada?.nombre ?? 'N/A'}`);
    } else {
      lines.push(`Modalidad: Domicilio`);
      lines.push(`Cliente: ${cliente.nombre}`);
      lines.push(`Celular: ${cliente.celular}`);
      lines.push(`Direccion: ${cliente.direccion}, ${cliente.barrio}`);
      if (cliente.referencia) lines.push(`Ref: ${cliente.referencia}`);
    }

    lines.push('');
    lines.push(
      metodoPago === 'transferencia'
        ? 'Adjunto el comprobante de pago. Gracias!'
        : tipoPedido === 'recogida'
          ? 'Pago en efectivo en caja al reclamar. Gracias!'
          : 'Pago en efectivo al recibir el pedido. Gracias!',
    );

    return lines.join('\n');
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { data: numeroData, error: numErr } = await supabase.rpc('generar_numero_orden');
      if (numErr || !numeroData) throw new Error('No se pudo generar el número de orden');
      const numeroOrden = numeroData as string;

      const { data: pedidoRow, error: pedErr } = await supabase
        .from('pedidos')
        .insert({
          numero_orden: numeroOrden,
          nombre: tipoPedido === 'recogida' ? null : cliente.nombre,
          celular: tipoPedido === 'recogida' ? null : cliente.celular,
          barrio: tipoPedido === 'recogida' ? null : cliente.barrio,
          direccion: tipoPedido === 'recogida' ? null : cliente.direccion,
          referencia: tipoPedido === 'recogida' ? null : (cliente.referencia || null),
          subtotal,
          domicilio: tipoPedido === 'recogida' ? 0 : domicilioActual,
          total,
          metodo_pago: metodoPago,
          estado: 'pendiente',
          tipo_pedido: tipoPedido,
          sede: tipoPedido === 'recogida' ? sedeSeleccionada?.nombre ?? null : null,
        })
        .select('id')
        .single();

      if (pedErr || !pedidoRow) throw new Error('No se pudo guardar el pedido');

      const items = buildItems();
      const itemRows = items.map((it) => ({
        pedido_id: pedidoRow.id,
        tipo: it.tipo,
        nombre: it.nombre,
        cantidad: it.cantidad,
        precio: it.precio,
        combo_index: it.combo_index,
      }));

      const { data: insertedItems, error: itemsErr } = await supabase
        .from('pedido_items')
        .insert(itemRows)
        .select('id, combo_index');

      if (itemsErr || !insertedItems) throw new Error('No se pudieron guardar los items');

      // Insert salsas for combo items
      const salsaRows: { pedido_item_id: string; salsa: string }[] = [];
      insertedItems.forEach((item) => {
        const matchingInput = items.find(
          (it) => it.tipo === 'combo' && it.combo_index === item.combo_index,
        );
        if (matchingInput?.salsas && matchingInput.salsas.length > 0) {
          matchingInput.salsas.forEach((salsa) => {
            salsaRows.push({ pedido_item_id: item.id, salsa });
          });
        }
      });

      if (salsaRows.length > 0) {
        await supabase.from('pedido_salsas').insert(salsaRows);
      }

      // Enviar correo con la orden a la cajera
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            numeroOrden,
            pedidoId: pedidoRow.id,
            items,
            subtotal,
            domicilio: tipoPedido === 'recogida' ? 0 : domicilioActual,
            total,
            metodoPago,
            tipoPedido,
            cliente: tipoPedido === 'recogida' ? undefined : {
              nombre: cliente.nombre,
              celular: cliente.celular,
              barrio: cliente.barrio,
              direccion: cliente.direccion,
              referencia: cliente.referencia || undefined,
            },
            sede: tipoPedido === 'recogida' ? sedeSeleccionada?.nombre ?? null : null,
          }),
        });
      } catch {
        // El correo es secundario; no bloqueamos el flujo si falla
      }

      // Abrir WhatsApp con el resumen del pedido (ambos metodos)
      const message = buildOrderSummaryText(numeroOrden);
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
      setWhatsappSent(true);

      onComplete(numeroOrden, pedidoRow.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Metodo de pago</h2>
        <p className="text-white/40 text-sm">Elige como quieres pagar.</p>
      </div>

      {/* Total card */}
      <div className="card p-5 mb-5 text-center border-gold-500/30">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Total a pagar</p>
        <p className="text-3xl font-bold gold-text">{formatCOP(total)}</p>
      </div>

      {/* Payment options */}
      <div className="space-y-3 mb-6">
        {/* Transferencia / QR + WhatsApp */}
        <button
          onClick={() => setMetodoPago('transferencia')}
          className={`w-full card p-5 text-left transition-all ${
            metodoPago === 'transferencia'
              ? 'border-gold-500/50 shadow-gold'
              : ''
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/15 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Transferencia / QR</h3>
              <p className="text-xs text-white/40">Paga con QR o cuenta y confirma por WhatsApp</p>
            </div>
            <div
              className={`ml-auto w-6 h-6 rounded-full border-2 transition-all ${
                metodoPago === 'transferencia'
                  ? 'border-gold-500 bg-gold-500'
                  : 'border-white/20'
              }`}
            >
              {metodoPago === 'transferencia' && (
                <Check className="w-4 h-4 text-ink-900 m-auto mt-0.5" strokeWidth={3} />
              )}
            </div>
          </div>

          {metodoPago === 'transferencia' && (
            <div className="space-y-3 animate-fadeIn pt-3 border-t border-white/10">
              {/* QR imagen */}
              <div className="flex flex-col items-center py-3">
                <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center p-3">
                  <img
                    src="/qr.jpg"
                    alt="Codigo QR para pagar a POTINES"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" /> Escanea el QR para pagar
                </p>
              </div>

              {/* Bancolombia info: cuenta + llave */}
              <div className="bg-ink-700/60 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Banco</span>
                  <span className="text-sm text-white font-medium">POTINES</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Tipo</span>
                  <span className="text-xs text-white/70 font-medium text-right">{BANCOLOMBIA_TIPO}</span>
                </div>

                {/* Numero de cuenta */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">No. Cuenta</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium font-mono tracking-wide">
                      {BANCOLOMBIA_CUENTA}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(BANCOLOMBIA_CUENTA, 'cuenta');
                      }}
                      className="text-gold-400 transition-transform active:scale-90"
                      aria-label="Copiar numero de cuenta"
                    >
                      {copiedField === 'cuenta' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Llave / Nequi BRE-B */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/50">Llave</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium font-mono tracking-wide">
                      {NEQUI_LLAVE}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(NEQUI_LLAVE, 'llave');
                      }}
                      className="text-gold-400 transition-transform active:scale-90"
                      aria-label="Copiar llave"
                    >
                      {copiedField === 'llave' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp instructions */}
              <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-green-300 font-semibold">
                    Confirma por WhatsApp
                  </p>
                </div>
                <p className="text-xs text-green-200/70 leading-relaxed">
                  Al confirmar el pedido se abrira WhatsApp con el resumen de tu
                  orden. Adjunta el comprobante de pago y envialo para
                  validar tu pedido.
                </p>
              </div>
            </div>
          )}
        </button>

        {/* Efectivo */}
        <button
          onClick={() => setMetodoPago('efectivo')}
          className={`w-full card p-5 text-left transition-all ${
            metodoPago === 'efectivo' ? 'border-gold-500/50 shadow-gold' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/15 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Efectivo</h3>
              <p className="text-xs text-white/40">
                {tipoPedido === 'recogida'
                  ? 'Paga en caja al reclamar'
                  : 'Paga al recibir tu pedido'}
              </p>
            </div>
            <div
              className={`ml-auto w-6 h-6 rounded-full border-2 transition-all ${
                metodoPago === 'efectivo' ? 'border-gold-500 bg-gold-500' : 'border-white/20'
              }`}
            >
              {metodoPago === 'efectivo' && (
                <Check className="w-4 h-4 text-ink-900 m-auto mt-0.5" strokeWidth={3} />
              )}
            </div>
          </div>

          {metodoPago === 'efectivo' && (
            <div className="mt-4 animate-fadeIn pt-3 border-t border-white/10 space-y-3">
              <div className="bg-ink-700/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="w-5 h-5 text-gold-400" />
                  <p className="text-sm text-white font-medium">
                    {tipoPedido === 'recogida'
                      ? 'Paga en caja:'
                      : 'Prepara este monto:'}
                  </p>
                </div>
                <div className="text-center py-2">
                  <p className="text-3xl font-bold gold-text">{formatCOP(total)}</p>
                  <p className="text-xs text-white/40 mt-2">
                    {tipoPedido === 'recogida'
                      ? 'Presenta tu numero de pedido en caja para pagar y reclamar'
                      : 'Ten listo este valor para el domiciliario'}
                  </p>
                </div>
              </div>

              {/* WhatsApp instructions for efectivo */}
              <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-green-300 font-semibold">
                    Confirma por WhatsApp
                  </p>
                </div>
                <p className="text-xs text-green-200/70 leading-relaxed">
                  Al confirmar el pedido se abrira WhatsApp con el resumen de tu
                  orden{tipoPedido === 'recogida' ? ' para validar tu pedido en caja' : ''}. Envia el mensaje para confirmar.
                </p>
              </div>
            </div>
          )}
        </button>
      </div>

      {error && (
        <div className="card p-4 mb-4 border-red-500/30 bg-red-500/10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {whatsappSent && (
        <div className="card p-4 mb-4 border-green-500/30 bg-green-500/10 animate-fadeIn">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-300 text-sm">
              Se abrio WhatsApp para que adjuntes el comprobante.
            </p>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-5 pt-3 bg-gradient-to-t from-ink-900 via-ink-900/95 to-transparent">
          <div className="flex gap-3">
            <button
              onClick={onBack}
              disabled={submitting}
              className="btn-outline-gold px-5 py-4 text-sm"
            >
              Atras
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="btn-gold flex-1 py-4 text-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirmando...</span>
                </>
              ) : metodoPago === 'transferencia' ? (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirmar por WhatsApp</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  <span>Confirmar por WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
