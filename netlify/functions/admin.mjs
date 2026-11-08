import { PRODUCTOS, leerEstado, guardar, json } from "../lib/comun.mjs";
/* Reponer stock desde el celular:  /api/admin?clave=TU_CLAVE&id=collar-gota&stock=4 */
export default async (req) => {
  const u = new URL(req.url).searchParams;
  if (!process.env.ADMIN_KEY || u.get("clave") !== process.env.ADMIN_KEY) return json({ error: "No autorizado" }, 401);
  const id = u.get("id"), n = parseInt(u.get("stock"), 10);
  if (!PRODUCTOS.some((p) => p.id === id) || !(n >= 0)) return json({ error: "id o stock inválido" }, 400);
  const e = await leerEstado(); e.stock[id] = n; await guardar(e);
  return json({ ok: true, id, stock: n });
};
export const config = { path: "/api/admin" };
