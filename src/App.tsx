import { useState, useEffect } from 'react';
import { MenuProvider } from '@/context/MenuContext';
import { OrderProvider } from '@/context/OrderContext';
import { CustomerFlow } from '@/components/customer/CustomerFlow';
import { DispatcherPanel } from '@/components/dispatcher/DispatcherPanel';
import { AdminPanel } from '@/components/admin/AdminPanel';

type View = 'customer' | 'dispatcher' | 'admin';

function App() {
  const [view, setView] = useState<View>('customer');

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

  if (view === 'dispatcher') {
    return <DispatcherPanel />;
  }

  if (view === 'admin') {
    return <AdminPanel />;
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
