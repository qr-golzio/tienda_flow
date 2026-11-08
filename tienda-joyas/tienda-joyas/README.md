# Tienda de joyas: Netlify + API de Flow

## Qué hace
- La página lee el stock desde `/api/stock` y muestra "Quedan 2" o "Agotado".
- Al comprar, `/api/crear-pago` reserva la pieza 20 minutos y crea la orden en Flow.
- Flow avisa a `/api/confirmar-pago`; ahí se verifica el pago con Flow y se descuenta el stock.
- El cliente vuelve a la tienda por `/api/retorno`.

## Puesta en marcha
1. Sube esta carpeta a un repositorio de GitHub y conéctalo en Netlify (Add new site > Import from Git). No necesitas comando de build.
2. En Netlify: Site configuration > Environment variables. Crea:
   - `FLOW_API_KEY` y `FLOW_SECRET_KEY`: las de tu cuenta **sandbox** (Mi cuenta Flow > Mis datos).
   - `FLOW_API_URL`: `https://sandbox.flow.cl/api`
   - `ADMIN_KEY`: una clave larga inventada por ti.
3. Haz un nuevo deploy y prueba una compra completa en sandbox. Revisa que baje el stock.
4. Para producción cambia las 3 variables de Flow por las de producción (`FLOW_API_URL` = `https://www.flow.cl/api`) y vuelve a desplegar.

## Editar catálogo
- Productos, precios y fotos: `netlify/lib/comun.mjs` (lista `PRODUCTOS`). Las fotos van en `public/img/`, con la ruta `img/nombre.jpg`.
- Tu WhatsApp y nombre: al inicio del `<script>` en `public/index.html`.
- Reponer stock desde el celular: `https://TU-SITIO.netlify.app/api/admin?clave=TU_ADMIN_KEY&id=collar-gota&stock=4`

## Notas
- Los precios los define el servidor, no el navegador.
- Con muchas compras simultáneas podría haber cruces de stock. Para un catálogo pequeño no es un problema.
- Nunca subas tus claves de Flow al repositorio; van solo en las variables de Netlify.
