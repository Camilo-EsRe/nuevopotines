import type { Combo, Bebida, Adicion, Salsa } from '@/types';

export const COMBOS: Combo[] = [
  {
    id: 1,
    nombre: 'Potipapa',
    descripcion: ['Papas', 'Salchicha', 'Huevo'],
    descripcionLarga:
      'Papas artesanales, salchicha y huevo. Banalas en tus salsas favoritas.',
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
      'Papas, 1 snack de pollo, salchicha, huevo y salsas a tu eleccion.',
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
      'Papas, 2 snacks de pollo, salchicha, huevo y tus salsas.',
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
      'Papas, 3 snacks de pollo, salchicha, huevo y tus salsas.',
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
      '1 bombon de pollo, papas, salchicha, huevo y salsas.',
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
      '2 bombones de pollo, papas, salchicha, huevo y salsas.',
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
      'Chuleta de pollo, papas, salchicha, huevo y salsas a tu eleccion.',
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
