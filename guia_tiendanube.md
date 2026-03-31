# 🛒 Guía de Integración: Klic Systemas + Tienda Nube

Esta guía explica cómo conectamos la Inteligencia Artificial de **Klic** con el catálogo de productos de un cliente para automatizar ventas reales.

## 1. El Flujo de Información
1. **Consulta del Cliente**: El usuario escribe al DM: *"¿Tienen cuadros de conejitos?"*.
2. **Razonamiento IA**: El cerebro de Klic detecta una "Intención de Compra" y activa la herramienta de búsqueda.
3. **Consulta API**: Nuestro servidor se comunica con la API de **Tienda Nube** filtrando por palabras clave (`keyword="conejitos"`).
4. **Respuesta Visual**: La IA recibe el catálogo dinámico y responde en Instagram con una galería de imágenes (Cards) con link de pago directo.

## 2. Requerimientos Técnicos
Para activar esta función, el cliente debe proporcionar:
* **Access Token de Tienda Nube**: Se genera desde el panel administrador de la tienda.
* **ID de la Tienda**: Identificador único del comercio.

## 3. Beneficios para el Cliente
* **Stock en Tiempo Real**: Si un producto se agota en la web, el bot deja de ofrecerlo automáticamente.
* **Cierre de Venta Instantáneo**: El cliente recibe el link de pago exacto sin intervención humana.
* **Catálogo Infinito**: No importa cuántos productos tenga la tienda, la IA los conoce todos.

---
**Klic Systemas** | *Optimizando el futuro del E-commerce.*
