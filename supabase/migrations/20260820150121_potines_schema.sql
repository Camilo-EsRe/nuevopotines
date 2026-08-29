/*
# POTINES - Sistema de pedidos de comida a domicilio

## Resumen
Crea el esquema completo de POTINES: sistema de pedidos de comida a domicilio con flujo de combos, salsas, bebidas, adiciones, domicilio por barrio, y panel de despacha en tiempo real.

## Tablas nuevas

### pedidos
- `id` (uuid, pk)
- `numero_orden` (text, unique) - Número de orden generado automáticamente (ej: POT-0001)
- `nombre` (text) - Nombre del cliente
- `celular` (text) - Celular del cliente
- `barrio` (text) - Barrio seleccionado
- `direccion` (text) - Dirección de entrega
- `referencia` (text, opcional) - Referencia de la dirección
- `subtotal` (numeric) - Subtotal de productos
- `domicilio` (numeric) - Valor del domicilio según barrio
- `total` (numeric) - Total a pagar
- `metodo_pago` (text) - 'transferencia' o 'efectivo'
- `estado` (text) - 'pendiente', 'preparando', 'en_camino', 'entregado'
- `fecha` (timestamptz) - Fecha y hora del pedido

### pedido_items
- `id` (uuid, pk)
- `pedido_id` (uuid, fk → pedidos)
- `tipo` (text) - 'combo', 'bebida', 'adicion'
- `nombre` (text) - Nombre del producto
- `cantidad` (int) - Cantidad
- `precio` (numeric) - Precio unitario
- `combo_index` (int) - Índice del combo (para identificar combos repetidos)

### pedido_salsas
- `id` (uuid, pk)
- `pedido_item_id` (uuid, fk → pedido_items)
- `salsa` (text) - Nombre de la salsa seleccionada

### tarifas_barrios
- `id` (uuid, pk)
- `barrio` (text, unique) - Nombre del barrio
- `precio` (numeric) - Valor del domicilio

### configuracion
- `id` (uuid, pk)
- `clave` (text, unique)
- `valor` (text)

## Seguridad (RLS)
- pedidos, pedido_items, pedido_salsas: lectura/escritura anon + authenticated (app de pedidos pública + panel despacha con login simple por configuración)
- tarifas_barrios: lectura pública anon+authenticated, escritura authenticated
- configuracion: lectura pública anon+authenticated, escritura authenticated

## Notas
1. Las tarifas de domicilio se guardan en la BD, el frontend no las controla.
2. El número de orden se genera con una función RPC `generar_numero_orden()`.
3. Se insertan datos seed de barrios y configuración.
*/

-- ============================================================
-- tarifas_barrios
-- ============================================================
CREATE TABLE IF NOT EXISTS tarifas_barrios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barrio text UNIQUE NOT NULL,
  precio numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tarifas_barrios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_tarifas" ON tarifas_barrios;
CREATE POLICY "anon_read_tarifas" ON tarifas_barrios FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_write_tarifas" ON tarifas_barrios;
CREATE POLICY "auth_write_tarifas" ON tarifas_barrios FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_tarifas" ON tarifas_barrios;
CREATE POLICY "auth_update_tarifas" ON tarifas_barrios FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_tarifas" ON tarifas_barrios;
CREATE POLICY "auth_delete_tarifas" ON tarifas_barrios FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- configuracion
-- ============================================================
CREATE TABLE IF NOT EXISTS configuracion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave text UNIQUE NOT NULL,
  valor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_config" ON configuracion;
CREATE POLICY "anon_read_config" ON configuracion FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_write_config" ON configuracion;
CREATE POLICY "auth_write_config" ON configuracion FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_config" ON configuracion;
CREATE POLICY "auth_update_config" ON configuracion FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_config" ON configuracion;
CREATE POLICY "auth_delete_config" ON configuracion FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_orden text UNIQUE NOT NULL,
  nombre text NOT NULL,
  celular text NOT NULL,
  barrio text NOT NULL,
  direccion text NOT NULL,
  referencia text,
  subtotal numeric NOT NULL DEFAULT 0,
  domicilio numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  metodo_pago text NOT NULL DEFAULT 'efectivo',
  estado text NOT NULL DEFAULT 'pendiente',
  fecha timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_pedidos" ON pedidos;
CREATE POLICY "anon_read_pedidos" ON pedidos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pedidos" ON pedidos;
CREATE POLICY "anon_insert_pedidos" ON pedidos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_pedidos" ON pedidos;
CREATE POLICY "auth_update_pedidos" ON pedidos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pedidos" ON pedidos;
CREATE POLICY "anon_delete_pedidos" ON pedidos FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- pedido_items
-- ============================================================
CREATE TABLE IF NOT EXISTS pedido_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  nombre text NOT NULL,
  cantidad int NOT NULL DEFAULT 1,
  precio numeric NOT NULL DEFAULT 0,
  combo_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_items" ON pedido_items;
CREATE POLICY "anon_read_items" ON pedido_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_items" ON pedido_items;
CREATE POLICY "anon_insert_items" ON pedido_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_items" ON pedido_items;
CREATE POLICY "auth_update_items" ON pedido_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_items" ON pedido_items;
CREATE POLICY "anon_delete_items" ON pedido_items FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- pedido_salsas
-- ============================================================
CREATE TABLE IF NOT EXISTS pedido_salsas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_item_id uuid NOT NULL REFERENCES pedido_items(id) ON DELETE CASCADE,
  salsa text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pedido_salsas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_salsas" ON pedido_salsas;
CREATE POLICY "anon_read_salsas" ON pedido_salsas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_salsas" ON pedido_salsas;
CREATE POLICY "anon_insert_salsas" ON pedido_salsas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_salsas" ON pedido_salsas;
CREATE POLICY "auth_update_salsas" ON pedido_salsas FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_salsas" ON pedido_salsas;
CREATE POLICY "anon_delete_salsas" ON pedido_salsas FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_id ON pedido_items(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_salsas_item_id ON pedido_salsas(pedido_item_id);

-- ============================================================
-- Función para generar número de orden
-- ============================================================
CREATE OR REPLACE FUNCTION generar_numero_orden()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contador int;
  numero text;
BEGIN
  SELECT COUNT(*) + 1 INTO contador FROM pedidos;
  numero := 'POT-' || lpad(contador::text, 4, '0');
  RETURN numero;
END;
$$;

-- ============================================================
-- Seed: Tarifas de barrios
-- ============================================================
INSERT INTO tarifas_barrios (barrio, precio) VALUES
  ('Bellavista', 2000),
  ('La Esperanza', 2000),
  ('La Pradera', 4000),
  ('Centro', 6000),
  ('Andalucía', 7000),
  ('La Aguacatala', 5000),
  ('La Chuscala', 5000),
  ('Salinas', 13000)
ON CONFLICT (barrio) DO NOTHING;

-- ============================================================
-- Seed: Configuración
-- ============================================================
INSERT INTO configuracion (clave, valor) VALUES
  ('horario_apertura', '10:00'),
  ('horario_cierre', '22:00'),
  ('telefono_transferencia', '3110000000'),
  ('banco_transferencia', 'Nequi'),
  ('titular_transferencia', 'POTINES'),
  ('mensaje_bienvenida', 'Bienvenido a POTINES')
ON CONFLICT (clave) DO NOTHING;
