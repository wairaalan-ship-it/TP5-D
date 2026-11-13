# Cielo Abierto – TP 4

Página web escolar sobre el clima con datos meteorológicos reales.

## Archivos
- `index.html`: estructura de la página.
- `styles.css`: diseño adaptable a celulares y computadoras.
- `app.js`: consulta y muestra el clima en tiempo real.
- `data.json`: información de los cinco skills y ejemplos.

## Ciudades
Buenos Aires, Córdoba, Bariloche, Rosario y Miramar (Buenos Aires).

## Datos meteorológicos
La página consulta la API pública de Open-Meteo (sin clave):
https://open-meteo.com/

Muestra temperatura actual, sensación térmica, humedad, viento, probabilidad máxima de precipitación del día, amanecer, atardecer y pronóstico de seis días. Los datos se actualizan al cambiar de ciudad, al tocar el botón «Actualizar clima» y automáticamente cada 15 minutos.

Se necesita conexión a internet y abrir la página desde un servidor web, por ejemplo GitHub Pages. Si la API no responde, la página avisa que los datos no están disponibles; no inventa valores.

## Skills incluidos
Los cinco repositorios públicos y sus explicaciones están en `data.json` y en el PDF de la tabla del TP 4.
