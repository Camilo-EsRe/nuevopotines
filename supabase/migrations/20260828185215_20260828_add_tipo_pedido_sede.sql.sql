/*
# Añadir columnas tipo_pedido y sede a pedidos

## Resumen
El frontend envía tipo_pedido ('domicilio' | 'recogida') y sede (nombre de sede
para recogida). Estas columnas no existían en la tabla pedidos, causando error
al guardar el pedido.

## Cambios
- pedidos.tipo_pedido: text, nullable, default 'domicilio'
- pedidos.sede: text, nullable
*/

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_pedido text DEFAULT 'domicilio';
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS sede text;
