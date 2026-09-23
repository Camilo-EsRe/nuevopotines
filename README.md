# POTINES

Sistema de pedidos en línea para restaurante de papas artesanales. Los clientes arman su pedido (combo, salsas, bebidas, adiciones) por una interfaz móvil y lo envían a cocina en tiempo real. Incluye panel de despacho con autenticación, notificaciones por correo electrónico y seguimiento de estado del pedido.

## Requisitos Previos

| Software | Versión mínima |
|----------|---------------|
| Node.js  | 18.x          |
| npm      | 9.x           |
| Cuenta de Supabase | Proyecto activo |
| Cuenta de Resend    | API key configurada en Supabase |

## Instalación

```bash
git clone https://github.com/tu-usuario/potines.git
cd potines
npm install
```

## Configuración

### 1. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Estos valores se obtienen desde Supabase → Settings → API. Vite los incrusta automáticamente al compilar.

### 2. Base de datos (Supabase)

Las migraciones están en `supabase/migrations/`. Aplicarlas en orden crea las siguientes tablas:

| Tabla | Propósito |
|-------|-----------|
| `pedidos` | Registro de cada pedido con estado, total, datos del cliente |
| `pedido_items` | Productos individuales de cada pedido |
| `pedido_salsas` | Salsas seleccionadas por item |
| `tarifas_barrios` | Costo de domicilio por barrio |
| `sedes` | Sedes disponibles para recogida |
| `configuracion` | Parámetros generales (horario, email de cajera, datos bancarios) |

Las políticas de seguridad (RLS) permiten lectura pública y escritura desde clientes autenticados.

### 3. Edge Function: `send-order-email`

Función en Deno que envía el detalle del pedido al correo de la cajera usando Resend. Requiere estos secretos en Supabase → Edge Functions → Secrets:

- `RESEND_API_KEY` — API key de Resend
- `SUPABASE_URL` — URL del proyecto (inyectada automáticamente)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (inyectada automáticamente)

El correo destino se lee dinámicamente desde la tabla `configuracion` con la clave `cajero_email`.

### 4. Secretos de la Edge Function

Verifica que los secretos estén configurados:

```bash
# Desde el panel de Supabase: Edge Functions → send-order-email → Secrets
# Deben existir:
#   RESEND_API_KEY
```

## Uso

### Desarrollo

```bash
npm run dev
```

Abre `http://localhost:5173`.

### Producción

```bash
npm run build
```

Genera la carpeta `dist/` con archivos estáticos listos para servir con cualquier servidor web (Nginx, Apache, Vercel, Netlify, Hostinger).

### Acceso al panel de despacho

La aplicación tiene dos vistas:

- **Cliente** (vista por defecto): flujo de pedido en `https://potines.pro`
- **Despacho**: panel administrativo en `https://potines.pro/#despacho`

El panel de despacho requiere autenticación con Supabase Auth (email y contraseña).

## Estructura del Proyecto

```
potines/
├── public/                     # Assets estáticos (logo, QR, imágenes de productos)
│   └── productos/              # Fotos de cada producto
├── src/
│   ├── components/
│   │   ├── customer/           # Flujo del cliente (pedido)
│   │   │   ├── CustomerFlow.tsx     # Controlador de pasos del pedido
│   │   │   ├── SplashScreen.tsx     # Pantalla de inicio
│   │   │   ├── SedeSelection.tsx    # Selección de sede (recogida)
│   │   │   ├── ComboSelection.tsx   # Selección de combo
│   │   │   ├── SalsaSelection.tsx   # Selección de salsas
│   │   │   ├── BebidaSelection.tsx  # Selección de bebidas
│   │   │   ├── AdicionSelection.tsx # Adiciones extras
│   │   │   ├── DeliveryForm.tsx     # Datos de domicilio
│   │   │   ├── OrderSummary.tsx     # Resumen del pedido
│   │   │   ├── PaymentScreen.tsx    # Método de pago y confirmación
│   │   │   ├── OrderTracking.tsx    # Seguimiento del estado
│   │   │   └── ConsentModal.tsx     # Modal de consentimiento
│   │   ├── dispatcher/         # Panel de despacho (administrativo)
│   │   │   ├── DispatcherPanel.tsx  # Gate de autenticación
│   │   │   ├── DispatcherLogin.tsx  # Login
│   │   │   ├── DispatcherDashboard.tsx # Dashboard de pedidos
│   │   │   └── OrderCard.tsx        # Tarjeta individual de pedido
│   │   ├── ProductImage.tsx    # Componente de imagen con fallback
│   │   ├── ProgressBar.tsx     # Barra de progreso del flujo
│   │   └── QuantityButton.tsx  # Control de cantidad
│   ├── context/
│   │   └── OrderContext.tsx    # Estado global del pedido en curso
│   ├── data/
│   │   └── menu.ts             # Catálogo de combos, bebidas, adiciones y salsas
│   ├── lib/
│   │   ├── supabase.ts         # Cliente de Supabase
│   │   └── sound.ts            # Efectos de sonido
│   ├── types.ts                # Tipos TypeScript del dominio
│   ├── App.tsx                 # Punto de entrada, ruteo por hash
│   ├── main.tsx                # Bootstrap de React
│   └── index.css               # Estilos globales y Tailwind
├── supabase/
│   ├── migrations/             # Esquema de base de datos
│   ├── functions/
│   │   └── send-order-email/   # Edge Function: envío de correo con Resend
│   └── config.toml             # Configuración de Supabase
├── .env                        # Variables de entorno (no se sube al repositorio)
├── vite.config.ts              # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind CSS
└── package.json
```

## Stack Técnico

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Base de datos y Auth:** Supabase (PostgreSQL)
- **Correo:** Resend vía Edge Function en Deno

## Contribución

1. Crea un fork del repositorio.
2. Usa una rama con prefijo `feature/` o `fix/` según corresponda.
3. Asegúrate de que `npm run build` y `npm run typecheck` pasen sin errores antes de enviar un PR.
4. No subas el archivo `.env` ni secretos al repositorio.

## Licencia

Proyecto privado. Todos los derechos reservados por CERIX.
