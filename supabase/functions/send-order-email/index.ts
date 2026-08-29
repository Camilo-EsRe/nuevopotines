import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderItem {
  tipo: string;
  nombre: string;
  cantidad: number;
  precio: number;
  salsas?: string[];
}

interface OrderEmailPayload {
  numeroOrden: string;
  pedidoId: string;
  items: OrderItem[];
  subtotal: number;
  domicilio: number;
  total: number;
  metodoPago: string;
  tipoPedido: string;
  cliente?: {
    nombre: string;
    celular: string;
    barrio: string;
    direccion: string;
    referencia?: string;
  };
  sede?: string | null;
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function buildHtmlEmail(payload: OrderEmailPayload): string {
  const isRecogida = payload.tipoPedido === "recogida";

  const itemsHtml = payload.items
    .map((item) => {
      const lineTotal = item.precio * item.cantidad;
      const salsasText =
        item.salsas && item.salsas.length > 0
          ? `<br/><span style="color:#888;font-size:13px;">Salsas: ${item.salsas.join(", ")}</span>`
          : "";
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #333;">
            <strong>${item.nombre}</strong> ×${item.cantidad}${salsasText}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #333;text-align:right;white-space:nowrap;">
            ${formatCOP(lineTotal)}
          </td>
        </tr>`;
    })
    .join("");

  const clienteInfo = isRecogida
    ? `
      <tr><td style="padding:4px 0;"><strong>Sede:</strong> ${payload.sede ?? "N/A"}</td></tr>
      <tr><td style="padding:4px 0;"><strong>Modalidad:</strong> Pide y pasa</td></tr>`
    : `
      <tr><td style="padding:4px 0;"><strong>Cliente:</strong> ${payload.cliente?.nombre ?? ""}</td></tr>
      <tr><td style="padding:4px 0;"><strong>Celular:</strong> ${payload.cliente?.celular ?? ""}</td></tr>
      <tr><td style="padding:4px 0;"><strong>Direccion:</strong> ${payload.cliente?.direccion ?? ""}, ${payload.cliente?.barrio ?? ""}</td></tr>
      ${payload.cliente?.referencia ? `<tr><td style="padding:4px 0;"><strong>Referencia:</strong> ${payload.cliente.referencia}</td></tr>` : ""}
      <tr><td style="padding:4px 0;"><strong>Modalidad:</strong> Domicilio</td></tr>`;

  const domicilioRow =
    !isRecogida && payload.domicilio > 0
      ? `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #333;">Domicilio</td>
          <td style="padding:8px 0;border-bottom:1px solid #333;text-align:right;">${formatCOP(payload.domicilio)}</td>
        </tr>`
      : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0a0a0a;color:#fff;padding:24px;border-radius:12px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#fbbf24;margin:0;font-size:24px;">POTINES</h1>
        <p style="color:#888;margin:4px 0 0;">Nuevo pedido #${payload.numeroOrden}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        ${itemsHtml}
        ${domicilioRow}
        <tr>
          <td style="padding:12px 0;font-size:18px;"><strong>Total</strong></td>
          <td style="padding:12px 0;font-size:18px;text-align:right;color:#fbbf24;"><strong>${formatCOP(payload.total)}</strong></td>
        </tr>
      </table>

      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #333;">
        <p style="color:#fbbf24;margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Datos del pedido</p>
        <table style="width:100%;font-size:14px;color:#ccc;">
          ${clienteInfo}
          <tr><td style="padding:4px 0;"><strong>Pago:</strong> ${payload.metodoPago === "transferencia" ? "Transferencia" : "Efectivo"}</td></tr>
        </table>
      </div>
    </div>`;
}

function buildTextEmail(payload: OrderEmailPayload): string {
  const isRecogida = payload.tipoPedido === "recogida";
  const lines: string[] = [];
  lines.push(`POTINES - Nuevo pedido #${payload.numeroOrden}`);
  lines.push("");

  payload.items.forEach((item) => {
    const salsas =
      item.salsas && item.salsas.length > 0 ? ` (Salsas: ${item.salsas.join(", ")})` : "";
    lines.push(`  ${item.nombre} x${item.cantidad} - ${formatCOP(item.precio * item.cantidad)}${salsas}`);
  });

  lines.push("");
  lines.push(`Subtotal: ${formatCOP(payload.subtotal)}`);
  if (!isRecogida && payload.domicilio > 0) {
    lines.push(`Domicilio: ${formatCOP(payload.domicilio)}`);
  }
  lines.push(`Total: ${formatCOP(payload.total)}`);
  lines.push("");

  if (isRecogida) {
    lines.push(`Modalidad: Pide y pasa`);
    lines.push(`Sede: ${payload.sede ?? "N/A"}`);
  } else {
    lines.push(`Modalidad: Domicilio`);
    lines.push(`Cliente: ${payload.cliente?.nombre ?? ""}`);
    lines.push(`Celular: ${payload.cliente?.celular ?? ""}`);
    lines.push(`Direccion: ${payload.cliente?.direccion ?? ""}, ${payload.cliente?.barrio ?? ""}`);
    if (payload.cliente?.referencia) lines.push(`Ref: ${payload.cliente.referencia}`);
  }
  lines.push(`Pago: ${payload.metodoPago === "transferencia" ? "Transferencia" : "Efectivo"}`);

  return lines.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY no configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload: OrderEmailPayload = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const cashierEmail = (await supabase
      .from("configuracion")
      .select("valor")
      .eq("clave", "cajero_email")
      .maybeSingle()).data?.valor;

    if (!cashierEmail) {
      return new Response(
        JSON.stringify({ error: "Correo de cajera no configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "POTINES <onboarding@resend.dev>",
        to: [cashierEmail],
        subject: `Nuevo pedido #${payload.numeroOrden}`,
        html: buildHtmlEmail(payload),
        text: buildTextEmail(payload),
      }),
    });

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text();
      return new Response(
        JSON.stringify({ error: `Error enviando correo: ${errorBody}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
