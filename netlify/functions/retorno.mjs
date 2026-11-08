import { flowGet } from "../lib/comun.mjs";
/* Flow devuelve al cliente aquí tras pagar; lo mandamos de vuelta a la tienda. */
export default async (req) => {
  const token = new URLSearchParams(await req.text()).get("token") || new URL(req.url).searchParams.get("token");
  let ok = false;
  try { ok = (await flowGet("/payment/getStatus", { token })).status === 2; } catch {}
  return Response.redirect(new URL(ok ? "/?pago=ok" : "/?pago=fallo", req.url), 303);
};
export const config = { path: "/api/retorno" };
