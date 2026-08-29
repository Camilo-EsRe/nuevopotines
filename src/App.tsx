import { useState, useEffect } from 'react';
import { OrderProvider } from '@/context/OrderContext';
import { CustomerFlow } from '@/components/customer/CustomerFlow';
import { ConsentModal } from '@/components/customer/ConsentModal';
import { DispatcherPanel } from '@/components/dispatcher/DispatcherPanel';

type View = 'customer' | 'dispatcher';

const CONSENT_KEY = 'potines_consent_accepted';

function App() {
  const [view, setView] = useState<View>('customer');
  const [consentAccepted, setConsentAccepted] = useState<boolean>(() => {
    return sessionStorage.getItem(CONSENT_KEY) === 'true';
  });

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === 'despacho' || hash === 'dispatcher') {
      setView('dispatcher');
    }
  }, []);

  // Listen for hash changes
  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.slice(1);
      setView(hash === 'despacho' || hash === 'dispatcher' ? 'dispatcher' : 'customer');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleAcceptConsent = () => {
    sessionStorage.setItem(CONSENT_KEY, 'true');
    setConsentAccepted(true);
  };

  if (view === 'dispatcher') {
    return <DispatcherPanel />;
  }

  if (!consentAccepted) {
    return <ConsentModal onAccept={handleAcceptConsent} />;
  }

  return (
    <OrderProvider>
      <CustomerFlow />
    </OrderProvider>
  );
}

export default App;
