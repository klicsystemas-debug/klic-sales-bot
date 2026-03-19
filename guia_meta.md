# Guía de Conexión: Klic Systemas a Meta API

Sigue estos pasos para obtener las llaves que harán que tu bot cobre vida.

## 1. Crear la App en Meta
1. Ve a [Meta for Developers](https://developers.facebook.com/) e inicia sesión.
2. Haz clic en **"Crear aplicación"**.
3. Selecciona **"Otro"** > **"Siguiente"**.
4. Elige **"Empresa"** como tipo de app.
5. Nombre de la app: `Klic Sales Bot`.

## 2. Agregar Productos
Dentro del panel de tu nueva app, busca y agrega los siguientes productos:
- **Instagram Graph API**
- **Messenger** (esto es necesario para los DMs de Instagram ahora)
- **Webhooks**

## 3. Configurar el Webhook
Para que Instagram le avise a tu código cuando alguien escribe:
1. En el menú lateral, ve a **Webhooks**.
2. Selecciona **Instagram** en el menú desplegable.
3. Haz clic en **Subscribe to this object**.
4. **URL de devolución:** Aquí necesitarás una URL pública (puedes usar `ngrok` para pruebas locales).
5. **Token de verificación:** Usa el que definimos en el código: `sales_bot_secret_token`.
6. **Suscripciones de campos:** Activa `messages` y `comments`.

## 4. Obtener el Access Token (La Llave Maestra)
1. Ve a **Herramientas** > **Explorador de la Graph API**.
2. En **App de Meta**, elige `Klic Sales Bot`.
3. En **Permisos**, agrega:
   - `instagram_basic`
   - `instagram_manage_messages`
   - `instagram_manage_comments`
   - `pages_show_list`
   - `pages_read_engagement`
4. Haz clic en **Generate Access Token**.
5. Copia ese código y pégalo en tu archivo `D:\instagram-sales-bot\.env`.

---

> [!IMPORTANT]
> **El Paso Crítico:** Asegúrate de que en la configuración de tu página de Facebook "Laboratorio de Bots", hayas vinculado la cuenta de Instagram "klic.systemas". Si no están vinculadas, el token no funcionará para Instagram.
