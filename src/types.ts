export type EstadoPedido = 'pendiente' | 'preparando' | 'en_camino' | 'entregado';
export type MetodoPago = 'transferencia' | 'efectivo';
export type TipoPedido = 'domicilio' | 'recogida';

export interface Combo {
  id: number;
  nombre: string;
  descripcion: string[];
  descripcionLarga: string;
  precio: number;
  emoji: string;
  imagen: string;
  grupo: 'estrella' | 'snacks' | 'bombones' | 'temporada';
  destacado: boolean;
}

export interface Bebida {
  id: number;
  nombre: string;
  precio: number;
  emoji: string;
  imagen: string;
  color: string;
}

export interface Adicion {
  id: number;
  nombre: string;
  precio: number;
  emoji: string;
  imagen: string;
}

export interface Salsa {
  id: number;
  nombre: string;
}

export interface ComboSeleccionado {
  comboId: number;
  instanceId: string;
  salsas: number[];
}

export interface TarifaBarrio {
  id: string;
  barrio: string;
  precio: number;
}

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  activo: boolean;
  orden: number;
}

export interface PedidoItemInput {
  tipo: 'combo' | 'bebida' | 'adicion';
  nombre: string;
  cantidad: number;
  precio: number;
  combo_index: number;
  salsas?: string[];
}

export interface PedidoCompleto {
  id: string;
  numero_orden: string;
  nombre: string | null;
  celular: string | null;
  barrio: string | null;
  direccion: string | null;
  referencia: string | null;
  subtotal: number;
  domicilio: number;
  total: number;
  metodo_pago: MetodoPago;
  estado: EstadoPedido;
  fecha: string;
  tipo_pedido: TipoPedido;
  sede: string | null;
}

export interface PedidoItemDB {
  id: string;
  pedido_id: string;
  tipo: string;
  nombre: string;
  cantidad: number;
  precio: number;
  combo_index: number | null;
  pedido_salsas?: { salsa: string }[];
}

export interface PedidoConItems extends PedidoCompleto {
  pedido_items?: PedidoItemDB[];
}
