import { PRODUCTOS, leerEstado, disponible, json } from "../lib/comun.mjs";
export default async () => {
  const e = await leerEstado();
  return json(PRODUCTOS.map(({ stock, ...p }) => ({ ...p, disponible: disponible(e, p.id) })));
};
export const config = { path: "/api/stock" };
