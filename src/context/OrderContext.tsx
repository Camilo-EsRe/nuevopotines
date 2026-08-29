import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  ComboSeleccionado,
  MetodoPago,
  PedidoItemInput,
  TarifaBarrio,
  Sede,
  TipoPedido,
} from '@/types';
import { COMBOS, BEBIDAS, ADICIONES, SALSAS } from '@/data/menu';

interface ClienteData {
  nombre: string;
  celular: string;
  barrio: string;
  direccion: string;
  referencia: string;
  confirmacionBarrio: boolean;
}

interface OrderContextValue {
  // Combos
  comboCounts: Record<number, number>;
  comboInstances: ComboSeleccionado[];
  addCombo: (comboId: number) => void;
  removeCombo: (comboId: number) => void;
  setSalsaForInstance: (instanceId: string, salsaId: number) => void;
  // Bebidas
  bebidaCounts: Record<number, number>;
  addBebida: (bebidaId: number) => void;
  removeBebida: (bebidaId: number) => void;
  // Adiciones
  adicionCounts: Record<number, number>;
  addAdicion: (adicionId: number) => void;
  removeAdicion: (adicionId: number) => void;
  // Cliente
  cliente: ClienteData;
  setCliente: (data: Partial<ClienteData>) => void;
  // Tarifas
  tarifas: TarifaBarrio[];
  setTarifas: (t: TarifaBarrio[]) => void;
  domicilioActual: number;
  // Modalidad
  tipoPedido: TipoPedido;
  setTipoPedido: (t: TipoPedido) => void;
  // Sede (recogida)
  sedeSeleccionada: Sede | null;
  setSedeSeleccionada: (s: Sede | null) => void;
  // Pago
  metodoPago: MetodoPago;
  setMetodoPago: (m: MetodoPago) => void;
  // Totales
  subtotal: number;
  total: number;
  // Reset
  resetOrder: () => void;
  // Construir items para guardar
  buildItems: () => PedidoItemInput[];
}

const OrderContext = createContext<OrderContextValue | null>(null);

let instanceCounter = 0;
const genInstanceId = () => `inst-${++instanceCounter}`;

const defaultCliente: ClienteData = {
  nombre: '',
  celular: '',
  barrio: '',
  direccion: '',
  referencia: '',
  confirmacionBarrio: false,
};

export function OrderProvider({ children }: { children: ReactNode }) {
  const [comboCounts, setComboCounts] = useState<Record<number, number>>({});
  const [comboInstances, setComboInstances] = useState<ComboSeleccionado[]>([]);
  const [bebidaCounts, setBebidaCounts] = useState<Record<number, number>>({});
  const [adicionCounts, setAdicionCounts] = useState<Record<number, number>>({});
  const [cliente, setClienteState] = useState<ClienteData>(defaultCliente);
  const [tarifas, setTarifas] = useState<TarifaBarrio[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [tipoPedido, setTipoPedido] = useState<TipoPedido>('domicilio');
  const [sedeSeleccionada, setSedeSeleccionada] = useState<Sede | null>(null);

  const addCombo = useCallback((comboId: number) => {
    setComboCounts((prev) => ({ ...prev, [comboId]: (prev[comboId] || 0) + 1 }));
    setComboInstances((prev) => [
      ...prev,
      { comboId, instanceId: genInstanceId(), salsas: [] },
    ]);
  }, []);

  const removeCombo = useCallback((comboId: number) => {
    setComboCounts((prev) => {
      const current = prev[comboId] || 0;
      if (current <= 0) return prev;
      const newCounts = { ...prev, [comboId]: current - 1 };
      return newCounts;
    });
    setComboInstances((prev) => {
      const idx = [...prev].reverse().findIndex((i) => i.comboId === comboId);
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return [...prev.slice(0, realIdx), ...prev.slice(realIdx + 1)];
    });
  }, []);

  const setSalsaForInstance = useCallback((instanceId: string, salsaId: number) => {
    setComboInstances((prev) =>
      prev.map((inst) =>
        inst.instanceId === instanceId
          ? {
              ...inst,
              salsas: inst.salsas.includes(salsaId)
                ? inst.salsas.filter((s) => s !== salsaId)
                : [...inst.salsas, salsaId],
            }
          : inst,
      ),
    );
  }, []);

  const addBebida = useCallback((bebidaId: number) => {
    setBebidaCounts((prev) => ({ ...prev, [bebidaId]: (prev[bebidaId] || 0) + 1 }));
  }, []);

  const removeBebida = useCallback((bebidaId: number) => {
    setBebidaCounts((prev) => {
      const current = prev[bebidaId] || 0;
      if (current <= 0) return prev;
      return { ...prev, [bebidaId]: current - 1 };
    });
  }, []);

  const addAdicion = useCallback((adicionId: number) => {
    setAdicionCounts((prev) => ({ ...prev, [adicionId]: (prev[adicionId] || 0) + 1 }));
  }, []);

  const removeAdicion = useCallback((adicionId: number) => {
    setAdicionCounts((prev) => {
      const current = prev[adicionId] || 0;
      if (current <= 0) return prev;
      return { ...prev, [adicionId]: current - 1 };
    });
  }, []);

  const setCliente = useCallback((data: Partial<ClienteData>) => {
    setClienteState((prev) => ({ ...prev, ...data }));
  }, []);

  const domicilioActual =
    tarifas.find((t) => t.barrio === cliente.barrio)?.precio ?? 0;

  const subtotal = (() => {
    let sum = 0;
    comboInstances.forEach((inst) => {
      const combo = COMBOS.find((c) => c.id === inst.comboId);
      if (combo) sum += combo.precio;
    });
    BEBIDAS.forEach((b) => {
      sum += b.precio * (bebidaCounts[b.id] || 0);
    });
    ADICIONES.forEach((a) => {
      sum += a.precio * (adicionCounts[a.id] || 0);
    });
    return sum;
  })();

  const total = tipoPedido === 'recogida' ? subtotal : subtotal + domicilioActual;

  const buildItems = useCallback((): PedidoItemInput[] => {
    const items: PedidoItemInput[] = [];

    comboInstances.forEach((inst, index) => {
      const combo = COMBOS.find((c) => c.id === inst.comboId);
      if (!combo) return;
      const salsaNames = inst.salsas
        .map((sid) => SALSAS.find((s) => s.id === sid)?.nombre)
        .filter(Boolean) as string[];
      items.push({
        tipo: 'combo',
        nombre: combo.nombre,
        cantidad: 1,
        precio: combo.precio,
        combo_index: index,
        salsas: salsaNames,
      });
    });

    BEBIDAS.forEach((b) => {
      const count = bebidaCounts[b.id] || 0;
      if (count > 0) {
        items.push({
          tipo: 'bebida',
          nombre: b.nombre,
          cantidad: count,
          precio: b.precio,
          combo_index: 0,
        });
      }
    });

    ADICIONES.forEach((a) => {
      const count = adicionCounts[a.id] || 0;
      if (count > 0) {
        items.push({
          tipo: 'adicion',
          nombre: a.nombre,
          cantidad: count,
          precio: a.precio,
          combo_index: 0,
        });
      }
    });

    return items;
  }, [comboInstances, bebidaCounts, adicionCounts]);

  const resetOrder = useCallback(() => {
    setComboCounts({});
    setComboInstances([]);
    setBebidaCounts({});
    setAdicionCounts({});
    setClienteState(defaultCliente);
    setMetodoPago('efectivo');
    setTipoPedido('domicilio');
    setSedeSeleccionada(null);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        comboCounts,
        comboInstances,
        addCombo,
        removeCombo,
        setSalsaForInstance,
        bebidaCounts,
        addBebida,
        removeBebida,
        adicionCounts,
        addAdicion,
        removeAdicion,
        cliente,
        setCliente,
        tarifas,
        setTarifas,
        domicilioActual,
        tipoPedido,
        setTipoPedido,
        sedeSeleccionada,
        setSedeSeleccionada,
        metodoPago,
        setMetodoPago,
        subtotal,
        total,
        resetOrder,
        buildItems,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
}
