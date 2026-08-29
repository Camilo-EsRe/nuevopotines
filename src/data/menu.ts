import type { Combo, Bebida, Adicion, Salsa } from '@/types';

export const COMBOS: Combo[] = [
  {
    id: 1,
    nombre: 'Potipapa',
    descripcion: ['Papas', 'Salchicha', 'Huevo'],
    descripcionLarga:
      'El clasico que enamora desde el primer bocado y nuestro imperdible de siempre. Una base generosa de nuestras autenticas papas artesanales, doradas y crujientes, coronadas con jugosa salchicha y un tierno huevito. Banalas en nuestra seleccion de salsas artesanales y crea tu combinacion perfecta. Simplemente irresistible!',
    precio: 9900,
    emoji: '🥚',
    imagen: '/productos/papasola.jpg',
    grupo: 'estrella',
    destacado: true,
  },
  {
    id: 2,
    nombre: 'Potisnack #1',
    descripcion: ['Papas', '1 Snack de pollo', 'Salchicha', 'Huevo'],
    descripcionLarga:
      'Una cama de nuestras irresistibles papas artesanales, acompanadas de 1 crujiente snack de pollo, sabrosa salchicha, un tierno huevito y la libertad de mezclar tus salsas artesanales favoritas.',
    precio: 13900,
    emoji: '🍗',
    imagen: '/productos/potipapa.png',
    grupo: 'snacks',
    destacado: false,
  },
  {
    id: 3,
    nombre: 'Potisnack #2',
    descripcion: ['Papas', '2 Snacks de pollo', 'Salchicha', 'Huevo'],
    descripcionLarga:
      'Para los que siempre quieren un poco mas: papas artesanales doraditas, 2 jugosos snacks de pollo, salchicha en su punto, un huevito y un bano de nuestras salsas a tu eleccion.',
    precio: 15900,
    emoji: '🍗',
    imagen: '/productos/potipapa.png',
    grupo: 'snacks',
    destacado: false,
  },
  {
    id: 4,
    nombre: 'Potisnack #3',
    descripcion: ['Papas', '3 Snacks de pollo', 'Salchicha', 'Huevo'],
    descripcionLarga:
      'La experiencia completa del sabor. Disfruta de 3 deliciosos snacks de pollo sobre nuestras papas artesanales, junto a la clasica salchicha, huevito y tus salsas artesanales preferidas.',
    precio: 17900,
    emoji: '🍗',
    imagen: '/productos/potipapa.png',
    grupo: 'snacks',
    destacado: false,
  },
  {
    id: 5,
    nombre: 'Potibombón #1',
    descripcion: ['1 Bombón de pollo', 'Papas', 'Salchicha', 'Huevo'],
    descripcionLarga:
      'Sacia tu antojo con 1 exquisito bombon de pollo, servido sobre nuestra base de papas artesanales recien hechas, salchicha, un huevito y el toque magico de tus salsas a eleccion.',
    precio: 14900,
    emoji: '🍳',
    imagen: '/productos/bombon-pollo.jpg',
    grupo: 'bombones',
    destacado: false,
  },
  {
    id: 6,
    nombre: 'Potibombón #2',
    descripcion: ['2 Bombones de pollo', 'Papas', 'Salchicha', 'Huevo'],
    descripcionLarga:
      'Doble placer en cada bocado. 2 espectaculares bombones de pollo que se deshacen en la boca, acompanados de nuestras papas artesanales, salchicha, huevito y el sabor inigualable de nuestras salsas de la casa.',
    precio: 18900,
    emoji: '🍳',
    imagen: '/productos/bombon-pollo.jpg',
    grupo: 'bombones',
    destacado: false,
  },
  {
    id: 7,
    nombre: 'Potichuleta',
    descripcion: ['Chuleta de pollo', 'Papas', 'Salchicha', 'Huevo'],
    descripcionLarga:
      'Nuestra obra maestra de temporada. Una generosa y crujiente chuleta de pechuga de pollo reposando sobre nuestras clasica papas artesanales, acompanada de salchicha, un tierno huevito y coronada con las salsas artesanales que tu elijas. Un verdadero festin en un solo plato.',
    precio: 17900,
    emoji: '🍂',
    imagen: '/productos/poti-chuleta.jpg',
    grupo: 'temporada',
    destacado: false,
  },
];

export const BEBIDAS: Bebida[] = [
  { id: 1, nombre: 'Coca-Cola', precio: 3000, emoji: '🥤', imagen: '/productos/coca-cola.jpg', color: 'from-red-700 to-red-900' },
  { id: 2, nombre: 'Cuatro', precio: 3000, emoji: '🧃', imagen: '/productos/cuatro.jpg', color: 'from-yellow-500 to-orange-600' },
  { id: 3, nombre: 'Agua de Manzana', precio: 3000, emoji: '🍎', imagen: '/productos/agua-manzana.jpg', color: 'from-green-500 to-green-700' },
  { id: 4, nombre: 'Agua de Maracuyá', precio: 3000, emoji: '🥭', imagen: '/productos/agua-maracuya.jpg', color: 'from-yellow-400 to-amber-600' },
  { id: 5, nombre: 'Del Valle', precio: 3000, emoji: '🍹', imagen: '/productos/del-valle.jpg', color: 'from-orange-500 to-red-600' },
];

export const ADICIONES: Adicion[] = [
  { id: 1, nombre: 'Bombón de Pollo', precio: 4900, emoji: '🍗', imagen: '/productos/bombon.jpg' },
  { id: 2, nombre: 'Snack de Pollo', precio: 4900, emoji: '🍔', imagen: '/productos/snack.jpg' },
  { id: 3, nombre: 'Huevo', precio: 1900, emoji: '🥚', imagen: '/productos/huevo.jpg' },
  { id: 4, nombre: 'Salchicha', precio: 1900, emoji: '🌭', imagen: '/productos/salchicha.jpg' },
  { id: 5, nombre: 'Porción de Papas', precio: 8400, emoji: '🍟', imagen: '/productos/papasola.jpg' },
];

export const SALSAS: Salsa[] = [
  { id: 1, nombre: 'Salsa Rosada' },
  { id: 2, nombre: 'Encacorradora' },
  { id: 3, nombre: 'BBQ' },
  { id: 4, nombre: 'Piña' },
  { id: 5, nombre: 'Sin salsa' },
];

export const formatCOP = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
