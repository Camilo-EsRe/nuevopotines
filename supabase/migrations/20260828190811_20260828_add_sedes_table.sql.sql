/*
# Tabla sedes para modalidad "Pide y pasa"

## Resumen
El frontend SedeSelection.tsx lee de la tabla `sedes` pero esta no existe,
causando que la pantalla de seleccion de sede aparezca vacia.

## Tabla nueva
### sedes
- id (uuid, pk)
- nombre (text, unique) - Nombre de la sede
- direccion (text) - Direccion de la sede
- telefono (text) - Telefono de contacto
- activo (bool) - Si la sede esta activa/visible
- orden (int) - Orden de visualizacion
- created_at (timestamptz)

## Seguridad (RLS)
- Lectura publica (anon + authenticated) para que los clientes vean las sedes
- Escritura solo authenticated (panel de despacha)

## Seed
- 4 sedes iniciales con datos de ejemplo (editar despues)
*/

CREATE TABLE IF NOT EXISTS sedes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  direccion text NOT NULL DEFAULT '',
  telefono text NOT NULL DEFAULT '',
  activo boolean NOT NULL DEFAULT true,
  orden int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_sedes" ON sedes;
CREATE POLICY "anon_read_sedes" ON sedes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_sedes" ON sedes;
CREATE POLICY "auth_insert_sedes" ON sedes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_sedes" ON sedes;
CREATE POLICY "auth_update_sedes" ON sedes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_sedes" ON sedes;
CREATE POLICY "auth_delete_sedes" ON sedes FOR DELETE
  TO authenticated USING (true);

-- Seed: 4 sedes iniciales (reemplazar con datos reales)
INSERT INTO sedes (nombre, direccion, telefono, activo, orden) VALUES
  ('Sede Centro', 'Calle 23 # 10-20, Centro', '311 000 0001', true, 1),
  ('Sede La Pradera', 'Av. 4 # 30-15, La Pradera', '311 000 0002', true, 2),
  ('Sede Bellavista', 'Carrera 5 # 12-34, Bellavista', '311 000 0003', true, 3),
  ('Sede La Esperanza', 'Calle 18 # 7-89, La Esperanza', '311 000 0004', true, 4)
ON CONFLICT (nombre) DO NOTHING;
