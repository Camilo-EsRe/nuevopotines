import { useEffect, useState } from 'react';
import { ChevronRight, Truck, Store } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import type { TipoPedido } from '@/types';

interface SplashScreenProps {
  onStart: (tipo: TipoPedido) => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  const { setTipoPedido, setSedeSeleccionada } = useOrder();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (tipo: TipoPedido) => {
    setTipoPedido(tipo);
    if (tipo === 'recogida') setSedeSeleccionada(null);
    onStart(tipo);
  };

  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gold-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Logo */}
        <div className="animate-scaleIn mb-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-gold-lg animate-float flex items-center justify-center">
              <img
                src="/potines.png"
                alt="POTINES"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-gold-500/20 animate-pulseGold" />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-5xl font-bold gold-text tracking-tight animate-fadeIn mb-2"
          style={{ animationDelay: '0.3s' }}
        >
          POTINES
        </h1>
        <p
          className="text-gold-200/60 text-sm font-medium tracking-widest uppercase animate-fadeIn"
          style={{ animationDelay: '0.5s' }}
        >
          Comida rapida
        </p>

        {/* Modality selection */}
        {showButton ? (
          <div className="mt-10 w-full space-y-3 animate-slideUp">
            <p className="text-center text-white/50 text-sm mb-4">
              ¿Como quieres tu pedido?
            </p>

            {/* Domicilio */}
            <button
              onClick={() => handleSelect('domicilio')}
              className="w-full card p-5 flex items-center gap-4 text-left transition-all duration-200 active:scale-[0.98] hover:border-gold-500/40 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gold-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/25 transition-colors">
                <Truck className="w-7 h-7 text-gold-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">Domicilio</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Te lo llevamos a casa
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gold-400/60 group-hover:text-gold-400 transition-colors" />
            </button>

            {/* Pide y pasa */}
            <button
              onClick={() => handleSelect('recogida')}
              className="w-full card p-5 flex items-center gap-4 text-left transition-all duration-200 active:scale-[0.98] hover:border-gold-500/40 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gold-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/25 transition-colors">
                <Store className="w-7 h-7 text-gold-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">Pide y pasa</h3>
                <p className="text-xs text-white/40 mt-0.5">
                  Recogela en una sede
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gold-400/60 group-hover:text-gold-400 transition-colors" />
            </button>
          </div>
        ) : (
          <div className="mt-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-fadeIn"
                style={{
                  animationDelay: `${1 + i * 0.2}s`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
