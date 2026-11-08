import { PRODUCTOS, leerEstado, guardar, flowGet } from "../lib/comun.mjs";
/* Flow llama aquí cuando cambia el estado de un pago. Nunca confiamos en lo que
   llega: siempre se le pregunta a Flow el estado real con payment/getStatus. */
export default async (req) => {
  const token = new URLSearchParams(await req.text()).get("token");
  if (!token) return new Response("Falta token", { status: 400 });
  try {
    const s = await flowGet("/payment/getStatus", { token });
    const opt = typeof s.optional === "string" ? JSON.parse(s.optional || "{}") : (s.optional || {});
    const prod = PRODUCTOS.find((p) => p.id === opt.id);
    const e = await leerEstado();
    if (s.status === 2 && prod && Number(s.amount) === prod.precio) {   // 2 = pagada
      if (!e.pagadas[s.commerceOrder]) {
        e.pagadas[s.commerceOrder] = 1;
        e.stock[prod.id] = Math.max(0, e.stock[prod.id] - 1);
      }
    }
    if (s.status !== 1) delete e.reservas[s.commerceOrder];            // 1 = pendiente
    await guardar(e);
  } catch (err) { console.error(err); return new Response("Error", { status: 500 }); }
  return new Response("OK");
};
export const config = { path: "/api/confirmar-pago" };
