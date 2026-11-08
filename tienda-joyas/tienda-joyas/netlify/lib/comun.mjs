import { createHmac } from "node:crypto";
import { getStore } from "@netlify/blobs";

/* ===== TU CATÁLOGO (precios y stock inicial). Máximo 15 productos. =====
   El stock inicial se usa solo la primera vez; después el stock real
   vive en el servidor y se descuenta solo cuando alguien paga. */
export const PRODUCTOS = [
  { id: "argolla-minimal",   nombre: "Argolla minimal",   material: "Plata 925",        precio: 18900, imagen: "", stock: 3 },
  { id: "collar-gota",       nombre: "Collar gota",       material: "Plata 925",        precio: 24900, imagen: "", stock: 2 },
  { id: "aros-trepadores",   nombre: "Aros trepadores",   material: "Acero quirúrgico", precio: 12900, imagen: "", stock: 5 },
  { id: "pulsera-eslabones", nombre: "Pulsera eslabones", material: "Baño de oro 18k",  precio: 21900, imagen: "", stock: 1 }
];
export const MINUTOS_RESERVA = 20;

/* ---------- Estado (stock, reservas, pagos procesados) ---------- */
const tienda = () => getStore("tienda");

export async function leerEstado() {
  const e = (await tienda().get("estado", { type: "json" })) || {};
  e.stock ||= {}; e.reservas ||= {}; e.pagadas ||= {};
  for (const p of PRODUCTOS) if (!(p.id in e.stock)) e.stock[p.id] = p.stock;
  const ahora = Date.now();
  for (const [k, r] of Object.entries(e.reservas)) if (r.exp < ahora) delete e.reservas[k];
  return e;
}
export const guardar = (e) => tienda().setJSON("estado", e);
export const disponible = (e, id) =>
  Math.max(0, (e.stock[id] ?? 0) - Object.values(e.reservas).filter((r) => r.id === id).length);

export const json = (d, status = 200) =>
  new Response(JSON.stringify(d), { status, headers: { "Content-Type": "application/json" } });

/* ---------- Flow ---------- */
const API = () => process.env.FLOW_API_URL || "https://sandbox.flow.cl/api";
const firmar = (p) =>
  createHmac("sha256", process.env.FLOW_SECRET_KEY)
    .update(Object.keys(p).sort().map((k) => k + p[k]).join(""))
    .digest("hex");

async function llamar(ruta, params, metodo) {
  const p = { apiKey: process.env.FLOW_API_KEY, ...params };
  const q = new URLSearchParams({ ...p, s: firmar(p) });
  const r = await (metodo === "POST"
    ? fetch(API() + ruta, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: q })
    : fetch(API() + ruta + "?" + q));
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || "Error de Flow");
  return d;
}
export const flowPost = (ruta, params) => llamar(ruta, params, "POST");
export const flowGet = (ruta, params) => llamar(ruta, params, "GET");
