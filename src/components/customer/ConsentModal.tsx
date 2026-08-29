import { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface ConsentModalProps {
  onAccept: () => void;
}

export function ConsentModal({ onAccept }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);
  const [showDecline, setShowDecline] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5 bg-ink-900/95 backdrop-blur-sm animate-fadeIn">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-gold-500/8 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="card p-6 border-gold-500/20">
          {/* Logo + title */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-gold-lg mb-4">
              <img
                src="/potines.png"
                alt="POTINES"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Tratamiento de datos</h2>
          </div>

          {/* Body text */}
          <div className="text-sm text-white/60 leading-relaxed space-y-3 mb-5">
            <p>
              En POTINES utilizamos tus datos personales (nombre, celular,
              direccion) unica y exclusivamente con fines relacionados con el
              servicio a domicilio y la entrega de tus pedidos.
            </p>
            <p>
              Al aceptar, autorizas el uso de esta informacion para procesar,
              preparar y entregar tus pedidos. No compartiremos tus datos con
              terceros.
            </p>
          </div>

          {/* Checkbox */}
          <button
            type="button"
            onClick={() => setChecked(!checked)}
            className={`w-full flex items-start gap-3 p-4 rounded-2xl border transition-all text-left mb-5 ${
              checked
                ? 'bg-gold-500/10 border-gold-500/40'
                : 'bg-ink-700/40 border-white/10'
            }`}
          >
            <div
              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                checked
                  ? 'bg-gold-500 text-ink-900'
                  : 'border-2 border-white/25'
              }`}
            >
              {checked && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="w-3 h-3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-xs text-white/70 leading-relaxed">
              He leido y acepto el tratamiento de mis datos personales para
              fines relacionados con el servicio.
            </span>
          </button>

          {/* Accept button */}
          <button
            onClick={onAccept}
            disabled={!checked}
            className="btn-gold w-full py-3.5 text-sm flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Aceptar y continuar</span>
          </button>

          {/* Decline */}
          <button
            onClick={() => setShowDecline(true)}
            className="w-full mt-3 py-2.5 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            No aceptar
          </button>
        </div>
      </div>

      {/* Decline overlay */}
      {showDecline && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-5 bg-ink-900/98 backdrop-blur-md animate-fadeIn">
          <div className="relative z-10 w-full max-w-xs text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-5">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              No podemos continuar
            </h2>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              Para utilizar POTINES necesitamos tu consentimiento para el
              tratamiento de datos. Sin el no podemos ofrecer el servicio de
              domicilio.
            </p>
            <button
              onClick={() => setShowDecline(false)}
              className="btn-outline-gold w-full py-3 text-sm"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
