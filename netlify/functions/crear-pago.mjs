import { PRODUCTOS, MINUTOS_RESERVA, leerEstado, guardar, disponible, flowPost, json } from "../lib/comun.mjs";
export default async (req) => {
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const { id, email } = await req.json().catch(() => ({}));
  const prod = PRODUCTOS.find((p) => p.id === id);
  if (!prod || !/^\S+@\S+\.\S+$/.test(email || "")) return json({ error: "Datos inválidos" }, 400);

  const e = await leerEstado();
  if (disponible(e, id) < 1) return json({ error: "Este producto ya no está disponible" }, 409);

  const orden = crypto.randomUUID();
  e.reservas[orden] = { id, exp: Date.now() + MINUTOS_RESERVA * 60000 };
  await guardar(e);

  const base = process.env.SITE_URL || process.env.URL;
  try {
    const r = await flowPost("/payment/create", {
      commerceOrder: orden, subject: "Compra: " + prod.nombre, currency: "CLP",
      amount: prod.precio, email, optional: JSON.stringify({ id }),
      urlConfirmation: base + "/api/confirmar-pago", urlReturn: base + "/api/retorno"
    });
    return json({ url: r.url + "?token=" + r.token });
  } catch (err) {
    console.error(err);
    delete e.reservas[orden]; await guardar(e);
    return json({ error: "No pudimos iniciar el pago. Intenta de nuevo." }, 502);
  }
};
export const config = { path: "/api/crear-pago" };
