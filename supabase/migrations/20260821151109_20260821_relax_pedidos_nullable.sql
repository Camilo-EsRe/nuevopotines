/*
# Relajar NOT NULL en pedidos para modalidad recogida

## Resumen
Para la modalidad "Pide y pasa" (recogida en sede), no se solicita nombre, celular,
barrio ni dirección. Se relajan esas columnas NOT NULL para permitir pedidos de
recogida sin esos datos.

## Cambios
- pedidos.nombre: DROP NOT NULL
- pedidos.celular: DROP NOT NULL
- pedidos.barrio: DROP NOT NULL
- pedidos.direccion: DROP NOT NULL

## Notas
1. Para recogida, domicilio = 0 y sede contiene el nombre de la sede elegida.
2. tipo_pedido = 'recogida' distingue de 'domicilio'.
3. No se envían notificaciones; el cliente reclama con su número de orden en caja.
*/

ALTER TABLE pedidos ALTER COLUMN nombre DROP NOT NULL;
ALTER TABLE pedidos ALTER COLUMN celular DROP NOT NULL;
ALTER TABLE pedidos ALTER COLUMN barrio DROP NOT NULL;
ALTER TABLE pedidos ALTER COLUMN direccion DROP NOT NULL;
