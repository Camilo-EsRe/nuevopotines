import { useState, useEffect } from 'react';
import { MenuProvider } from '@/context/MenuContext';
import { OrderProvider } from '@/context/OrderContext';
import { CustomerFlow } from '@/components/customer/CustomerFlow';
import { ConsentModal } from '@/components/customer/ConsentModal';
import { DispatcherPanel } from '@/components/dispatcher/DispatcherPanel';
import { AdminPanel } from '@/components/admin/AdminPanel';

type View = 'customer' | 'dispatcher' | 'admin';

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
    } else if (hash === 'admin' || hash === 'administracion') {
      setView('admin');
    }
  }, []);

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'despacho' || hash === 'dispatcher') {
        setView('dispatcher');
      } else if (hash === 'admin' || hash === 'administracion') {
        setView('admin');
      } else {
        setView('customer');
      }
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

  if (view === 'admin') {
    return <AdminPanel />;
  }

  if (!consentAccepted) {
    return <ConsentModal onAccept={handleAcceptConsent} />;
  }

  return (
    <MenuProvider>
      <OrderProvider>
        <CustomerFlow />
      </OrderProvider>
    </MenuProvider>
  );
}

export default App;
