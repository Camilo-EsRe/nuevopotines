import { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';
import { SedeSelection } from './SedeSelection';
import { ComboSelection } from './ComboSelection';
import { SalsaSelection } from './SalsaSelection';
import { BebidaSelection } from './BebidaSelection';
import { AdicionSelection } from './AdicionSelection';
import { DeliveryForm } from './DeliveryForm';
import { OrderSummary } from './OrderSummary';
import { PaymentScreen } from './PaymentScreen';
import { OrderTracking } from './OrderTracking';
import { ProgressBar } from '@/components/ProgressBar';
import { ArrowLeft } from 'lucide-react';
import { useOrder } from '@/context/OrderContext';
import type { TipoPedido } from '@/types';

type Step =
  | 'splash'
  | 'sede'
  | 'combos'
  | 'salsas'
  | 'bebidas'
  | 'adiciones'
  | 'domicilio'
  | 'resumen'
  | 'pago'
  | 'confirmacion';

// Steps after the menu (combos/salsas/bebidas/adiciones) differ by modalidad
const MENU_STEPS: Step[] = ['combos', 'salsas', 'bebidas', 'adiciones'];
const MENU_LABELS = ['Combos', 'Salsas', 'Bebidas', 'Extras'];

export function CustomerFlow() {
  const { tipoPedido } = useOrder();
  const [step, setStep] = useState<Step>('splash');
  const [numeroOrden, setNumeroOrden] = useState('');
  const [pedidoId, setPedidoId] = useState('');

  // Build the step order based on modalidad
  const stepOrder: Step[] =
    tipoPedido === 'recogida'
      ? ['sede', ...MENU_STEPS, 'resumen', 'pago']
      : [...MENU_STEPS, 'domicilio', 'resumen', 'pago'];

  const stepLabels =
    tipoPedido === 'recogida'
      ? ['Sede', ...MENU_LABELS, 'Resumen', 'Pago']
      : [...MENU_LABELS, 'Domicilio', 'Resumen', 'Pago'];

  const stepIndex = stepOrder.indexOf(step);

  const goNext = () => {
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
  };
  const goBack = () => {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) setStep(stepOrder[idx - 1]);
    else setStep('splash');
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleStart = (tipo: TipoPedido) => {
    setStep(tipo === 'recogida' ? 'sede' : 'combos');
  };

  if (step === 'splash') {
    return <SplashScreen onStart={handleStart} />;
  }

  if (step === 'confirmacion') {
    return (
      <OrderTracking
        numeroOrden={numeroOrden}
        pedidoId={pedidoId}
        onRestart={() => setStep('splash')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ink-900 max-w-md mx-auto">
      {/* Header with progress */}
      <div className="sticky top-0 z-30 bg-ink-900/90 backdrop-blur-md border-b border-white/5 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-xl bg-ink-700/60 flex items-center justify-center text-gold-300 transition-all active:scale-90"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-gold-400 font-semibold tracking-wider uppercase">
              {tipoPedido === 'recogida' ? 'PIDE Y PASA' : 'DOMICILIO'}
            </p>
          </div>
        </div>
        <ProgressBar
          current={stepIndex + 1}
          total={stepOrder.length}
          labels={stepLabels}
        />
      </div>

      {/* Step content */}
      <div key={step} className="animate-fadeIn">
        {step === 'sede' && <SedeSelection onNext={goNext} onBack={goBack} />}
        {step === 'combos' && <ComboSelection onNext={goNext} />}
        {step === 'salsas' && <SalsaSelection onNext={goNext} onBack={goBack} />}
        {step === 'bebidas' && <BebidaSelection onNext={goNext} onBack={goBack} />}
        {step === 'adiciones' && (
          <AdicionSelection onNext={goNext} onBack={goBack} />
        )}
        {step === 'domicilio' && (
          <DeliveryForm onNext={goNext} onBack={goBack} />
        )}
        {step === 'resumen' && <OrderSummary onNext={goNext} onBack={goBack} />}
        {step === 'pago' && (
          <PaymentScreen
            onComplete={(num, id) => {
              setNumeroOrden(num);
              setPedidoId(id);
              setStep('confirmacion');
            }}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}
