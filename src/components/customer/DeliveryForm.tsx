import { useEffect, useState } from 'react';
import { useOrder } from '@/context/OrderContext';
import { supabase } from '@/lib/supabase';
import { formatCOP } from '@/data/menu';
import { MapPin, User, Phone, Home, Info, Check } from 'lucide-react';

interface DeliveryFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function DeliveryForm({ onNext, onBack }: DeliveryFormProps) {
  const { cliente, setCliente, tarifas, setTarifas, domicilioActual } = useOrder();
  const [loading, setLoading] = useState(true);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('tarifas_barrios')
        .select('id, barrio, precio')
        .order('barrio');
      if (!cancelled && data) {
        setTarifas(data as typeof tarifas);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [setTarifas]);

  const valid =
    cliente.nombre.trim().length >= 3 &&
    cliente.celular.trim().length >= 7 &&
    cliente.barrio !== '' &&
    cliente.direccion.trim().length >= 5 &&
    cliente.confirmacionBarrio;

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  return (
    <div className="px-4 pt-4 pb-32">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Datos del domicilio</h2>
        <p className="text-white/40 text-sm">¿A dónde llevamos tu pedido?</p>
      </div>

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="text-xs text-gold-300 font-medium mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Nombre completo *
          </label>
          <input
            type="text"
            value={cliente.nombre}
            onChange={(e) => setCliente({ nombre: e.target.value })}
            onBlur={() => markTouched('nombre')}
            placeholder="Ej: Juan Pérez"
            className="input-field"
          />
          {touched.nombre && cliente.nombre.trim().length < 3 && (
            <p className="text-red-400 text-xs mt-1">Ingresa tu nombre completo</p>
          )}
        </div>

        {/* Celular */}
        <div>
          <label className="text-xs text-gold-300 font-medium mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> Celular *
          </label>
          <input
            type="tel"
            inputMode="numeric"
            value={cliente.celular}
            onChange={(e) => setCliente({ celular: e.target.value.replace(/[^0-9]/g, '') })}
            onBlur={() => markTouched('celular')}
            placeholder="Ej: 3001234567"
            className="input-field"
          />
          {touched.celular && cliente.celular.trim().length < 7 && (
            <p className="text-red-400 text-xs mt-1">Ingresa un celular válido</p>
          )}
        </div>

        {/* Barrio */}
        <div>
          <label className="text-xs text-gold-300 font-medium mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Barrio *
          </label>
          <select
            value={cliente.barrio}
            onChange={(e) => setCliente({ barrio: e.target.value })}
            onBlur={() => markTouched('barrio')}
            className="input-field appearance-none"
          >
            <option value="">Selecciona tu barrio</option>
            {loading && <option disabled>Cargando...</option>}
            {tarifas.map((t) => (
              <option key={t.id} value={t.barrio}>
                {t.barrio} — Domicilio {formatCOP(t.precio)}
              </option>
            ))}
          </select>
          {touched.barrio && cliente.barrio === '' && (
            <p className="text-red-400 text-xs mt-1">Selecciona un barrio</p>
          )}
        </div>

        {/* Domicilio price card */}
        {cliente.barrio && domicilioActual > 0 && (
          <div className="card p-4 flex items-center justify-between animate-scaleIn border-gold-500/30">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                <Home className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-xs text-white/50">Domicilio {cliente.barrio}</p>
                <p className="text-gold-400 font-bold text-lg">
                  {formatCOP(domicilioActual)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dirección */}
        <div>
          <label className="text-xs text-gold-300 font-medium mb-1.5 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" /> Dirección *
          </label>
          <input
            type="text"
            value={cliente.direccion}
            onChange={(e) => setCliente({ direccion: e.target.value })}
            onBlur={() => markTouched('direccion')}
            placeholder="Ej: Calle 45 # 23-56, Apto 301"
            className="input-field"
          />
          {touched.direccion && cliente.direccion.trim().length < 5 && (
            <p className="text-red-400 text-xs mt-1">Ingresa una dirección completa</p>
          )}
        </div>

        {/* Referencia */}
        <div>
          <label className="text-xs text-gold-300/70 font-medium mb-1.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Referencia (opcional)
          </label>
          <input
            type="text"
            value={cliente.referencia}
            onChange={(e) => setCliente({ referencia: e.target.value })}
            placeholder="Ej: Casa azul con rejas negras"
            className="input-field"
          />
        </div>

        {/* Checkbox confirmación */}
        <button
          type="button"
          onClick={() => setCliente({ confirmacionBarrio: !cliente.confirmacionBarrio })}
          className={`w-full flex items-start gap-3 p-4 rounded-2xl border transition-all text-left ${
            cliente.confirmacionBarrio
              ? 'bg-gold-500/10 border-gold-500/40'
              : 'bg-ink-700/40 border-white/10'
          }`}
        >
          <div
            className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              cliente.confirmacionBarrio ? 'bg-gold-500 text-ink-900' : 'border-2 border-white/20'
            }`}
          >
            {cliente.confirmacionBarrio && <Check className="w-4 h-4" strokeWidth={3} />}
          </div>
          <span className="text-xs text-white/70 leading-relaxed">
            Confirmo que mi dirección corresponde exactamente al barrio seleccionado.
          </span>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-md mx-auto px-4 pb-5 pt-3 bg-gradient-to-t from-ink-900 via-ink-900/95 to-transparent">
          <div className="flex gap-3">
            <button onClick={onBack} className="btn-outline-gold px-5 py-4 text-sm">
              Atrás
            </button>
            <button
              onClick={onNext}
              disabled={!valid}
              className="btn-gold flex-1 py-4 text-sm"
            >
              Ver resumen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
