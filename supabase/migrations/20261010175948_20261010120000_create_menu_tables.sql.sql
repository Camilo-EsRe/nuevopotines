/*
# POTINES - Tablas del menú (combos, bebidas, adiciones, salsas)

## Resumen
Crea las tablas para gestionar el menú dinámicamente desde un panel de administración.
Los combos, bebidas, adiciones y salsas actualmente están hardcoded en src/data/menu.ts.
Esta migración los mueve a la base de datos para poder editarlos sin tocar código.

## Tablas nuevas

### menu_combos
- id (uuid, pk)
- nombre (text) - Nombre del combo
- descripcion (text[]) - Lista de ingredientes (tags cortos)
- descripcion_larga (text) - Descripción detallada
- precio (numeric) - Precio en COP
- emoji (text) - Emoji representativo
- imagen (text) - Ruta de la imagen
- grupo (text) - 'estrella' | 'snacks' | 'bombones' | 'temporada'
- destacado (bool) - Si es el combo estrella
- orden (int) - Orden de visualización
- activo (bool) - Si está disponible
- created_at (timestamptz)

### menu_bebidas
- id (uuid, pk)
- nombre (text)
- precio (numeric)
- emoji (text)
- imagen (text)
- color (text) - Clases Tailwind para gradiente
- orden (int)
- activo (bool)
- created_at (timestamptz)

### menu_adiciones
- id (uuid, pk)
- nombre (text)
- precio (numeric)
- emoji (text)
- imagen (text)
- orden (int)
- activo (bool)
- created_at (timestamptz)

### menu_salsas
- id (uuid, pk)
- nombre (text)
- orden (int)
- activo (bool)
- created_at (timestamptz)

## Seguridad (RLS)
- Lectura pública (anon + authenticated) para que los clientes vean el menú
- Escritura solo authenticated (panel de administración)

## Seed
- Se insertan los datos actuales del menú hardcoded como datos iniciales
*/

-- ============================================================
-- menu_combos
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text[] NOT NULL DEFAULT '{}',
  descripcion_larga text NOT NULL DEFAULT '',
  precio numeric NOT NULL DEFAULT 0,
  emoji text NOT NULL DEFAULT '🍟',
  imagen text NOT NULL DEFAULT '',
  grupo text NOT NULL DEFAULT 'snacks',
  destacado boolean NOT NULL DEFAULT false,
  orden int NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_combos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_menu_combos" ON menu_combos;
CREATE POLICY "anon_read_menu_combos" ON menu_combos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_menu_combos" ON menu_combos;
CREATE POLICY "auth_insert_menu_combos" ON menu_combos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_menu_combos" ON menu_combos;
CREATE POLICY "auth_update_menu_combos" ON menu_combos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_menu_combos" ON menu_combos;
CREATE POLICY "auth_delete_menu_combos" ON menu_combos FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- menu_bebidas
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_bebidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  precio numeric NOT NULL DEFAULT 0,
  emoji text NOT NULL DEFAULT '🥤',
  imagen text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT 'from-ink-600 to-ink-700',
  orden int NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_bebidas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_menu_bebidas" ON menu_bebidas;
CREATE POLICY "anon_read_menu_bebidas" ON menu_bebidas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_menu_bebidas" ON menu_bebidas;
CREATE POLICY "auth_insert_menu_bebidas" ON menu_bebidas FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_menu_bebidas" ON menu_bebidas;
CREATE POLICY "auth_update_menu_bebidas" ON menu_bebidas FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_menu_bebidas" ON menu_bebidas;
CREATE POLICY "auth_delete_menu_bebidas" ON menu_bebidas FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- menu_adiciones
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_adiciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  precio numeric NOT NULL DEFAULT 0,
  emoji text NOT NULL DEFAULT '🍗',
  imagen text NOT NULL DEFAULT '',
  orden int NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_adiciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_menu_adiciones" ON menu_adiciones;
CREATE POLICY "anon_read_menu_adiciones" ON menu_adiciones FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_menu_adiciones" ON menu_adiciones;
CREATE POLICY "auth_insert_menu_adiciones" ON menu_adiciones FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_menu_adiciones" ON menu_adiciones;
CREATE POLICY "auth_update_menu_adiciones" ON menu_adiciones FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_menu_adiciones" ON menu_adiciones;
CREATE POLICY "auth_delete_menu_adiciones" ON menu_adiciones FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- menu_salsas
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_salsas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  orden int NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_salsas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_menu_salsas" ON menu_salsas;
CREATE POLICY "anon_read_menu_salsas" ON menu_salsas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_menu_salsas" ON menu_salsas;
CREATE POLICY "auth_insert_menu_salsas" ON menu_salsas FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_menu_salsas" ON menu_salsas;
CREATE POLICY "auth_update_menu_salsas" ON menu_salsas FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_menu_salsas" ON menu_salsas;
CREATE POLICY "auth_delete_menu_salsas" ON menu_salsas FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- Seed: Combos
-- ============================================================
INSERT INTO menu_combos (nombre, descripcion, descripcion_larga, precio, emoji, imagen, grupo, destacado, orden, activo) VALUES
  ('Potipapa', ARRAY['Papas', 'Salchicha', 'Huevo'], 'El clasico que enamora desde el primer bocado y nuestro imperdible de siempre. Una base generosa de nuestras autenticas papas artesanales, doradas y crujientes, coronadas con jugosa salchicha y un tierno huevito. Banalas en nuestra seleccion de salsas artesanales y crea tu combinacion perfecta. Simplemente irresistible!', 9900, '🥚', '/productos/papasola.jpg', 'estrella', true, 1, true),
  ('Potisnack #1', ARRAY['Papas', '1 Snack de pollo', 'Salchicha', 'Huevo'], 'Una cama de nuestras irresistibles papas artesanales, acompanadas de 1 crujiente snack de pollo, sabrosa salchicha, un tierno huevito y la libertad de mezclar tus salsas artesanales favoritas.', 13900, '🍗', '/productos/potipapa.png', 'snacks', false, 2, true),
  ('Potisnack #2', ARRAY['Papas', '2 Snacks de pollo', 'Salchicha', 'Huevo'], 'Para los que siempre quieren un poco mas: papas artesanales doraditas, 2 jugosos snacks de pollo, salchicha en su punto, un huevito y un bano de nuestras salsas a tu eleccion.', 15900, '🍗', '/productos/potipapa.png', 'snacks', false, 3, true),
  ('Potisnack #3', ARRAY['Papas', '3 Snacks de pollo', 'Salchicha', 'Huevo'], 'La experiencia completa del sabor. Disfruta de 3 deliciosos snacks de pollo sobre nuestras papas artesanales, junto a la clasica salchicha, huevito y tus salsas artesanales preferidas.', 17900, '🍗', '/productos/potipapa.png', 'snacks', false, 4, true),
  ('Potibombón #1', ARRAY['1 Bombón de pollo', 'Papas', 'Salchicha', 'Huevo'], 'Sacia tu antojo con 1 exquisito bombon de pollo, servido sobre nuestra base de papas artesanales recien hechas, salchicha, un huevito y el toque magico de tus salsas a eleccion.', 14900, '🍳', '/productos/bombon-pollo.jpg', 'bombones', false, 5, true),
  ('Potibombón #2', ARRAY['2 Bombones de pollo', 'Papas', 'Salchicha', 'Huevo'], 'Doble placer en cada bocado. 2 espectaculares bombones de pollo que se deshacen en la boca, acompanados de nuestras papas artesanales, salchicha, huevito y el sabor inigualable de nuestras salsas de la casa.', 18900, '🍳', '/productos/bombon-pollo.jpg', 'bombones', false, 6, true),
  ('Potichuleta', ARRAY['Chuleta de pollo', 'Papas', 'Salchicha', 'Huevo'], 'Nuestra obra maestra de temporada. Una generosa y crujiente chuleta de pechuga de pollo reposando sobre nuestras clasica papas artesanales, acompanada de salchicha, un tierno huevito y coronada con las salsas artesanales que tu elijas. Un verdadero festin en un solo plato.', 17900, '🍂', '/productos/poti-chuleta.jpg', 'temporada', false, 7, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Bebidas
-- ============================================================
INSERT INTO menu_bebidas (nombre, precio, emoji, imagen, color, orden, activo) VALUES
  ('Coca-Cola', 3000, '🥤', '/productos/coca-cola.jpg', 'from-red-700 to-red-900', 1, true),
  ('Cuatro', 3000, '🧃', '/productos/cuatro.jpg', 'from-yellow-500 to-orange-600', 2, true),
  ('Agua de Manzana', 3000, '🍎', '/productos/agua-manzana.jpg', 'from-green-500 to-green-700', 3, true),
  ('Agua de Maracuyá', 3000, '🥭', '/productos/agua-maracuya.jpg', 'from-yellow-400 to-amber-600', 4, true),
  ('Del Valle', 3000, '🍹', '/productos/del-valle.jpg', 'from-orange-500 to-red-600', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Adiciones
-- ============================================================
INSERT INTO menu_adiciones (nombre, precio, emoji, imagen, orden, activo) VALUES
  ('Bombón de Pollo', 4900, '🍗', '/productos/bombon.jpg', 1, true),
  ('Snack de Pollo', 4900, '🍔', '/productos/snack.jpg', 2, true),
  ('Huevo', 1900, '🥚', '/productos/huevo.jpg', 3, true),
  ('Salchicha', 1900, '🌭', '/productos/salchicha.jpg', 4, true),
  ('Porción de Papas', 8400, '🍟', '/productos/papasola.jpg', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Salsas
-- ============================================================
INSERT INTO menu_salsas (nombre, orden, activo) VALUES
  ('Salsa Rosada', 1, true),
  ('Encacorradora', 2, true),
  ('BBQ', 3, true),
  ('Piña', 4, true),
  ('Sin salsa', 5, true)
ON CONFLICT DO NOTHING;
