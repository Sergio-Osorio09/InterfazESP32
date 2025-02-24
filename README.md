# Consejos y Recomendaciones

## 1. Uso de la API en Replit
Debido a que **GitHub Pages** no admite PHP, se recomienda utilizar la API alojada en **Replit**.

## 2. Visualización en Dispositivos Móviles
La página actual **no se adapta** automáticamente a dispositivos móviles.  
Para verla correctamente, activa el **modo de escritorio** en tu navegador.

## 3. Pruebas de la API
Puedes realizar pruebas enviando datos mediante el siguiente comando `curl`:

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"sensorData": {"sensor1": 14, "sensor2": 24, "sensor3": 44, "sensor4": 64, "sensor5": 44}}' \
"Enlace_de_tu_servidor_en_replit"

Nota: Asegúrate de ejecutar el comando curl en la línea de comandos (CMD, terminal o símbolo del sistema).

