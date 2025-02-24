# Consejos y Recomendaciones

## 1. Uso de la API en Replit
Debido a que **GitHub Pages** no admite PHP, se recomienda utilizar la API alojada en **Replit**.

## 2. Visualización en Dispositivos Móviles
La página actual **no se adapta** automáticamente a dispositivos móviles.  
Para verla correctamente, activa el **modo de escritorio** en tu navegador.

## 3. Pruebas de la API
Puedes realizar pruebas enviando datos mediante el siguiente comando `curl`:

```bash
curl -X POST -H "Content-Type: application/json" -d "{\"sensorData\": {\"sensor1\": 24, \"sensor2\": 29, \"sensor3\": 46, \"sensor4\": 65, \"sensor5\": 65}}" "https://07d4156a-7ffe-48fa-a08b-84fab5048dad-00-xr9pxzhzg06z.janeway.replit.dev/"
```

Nota: Asegúrate de actualizar el link de replit y de ejecutar el comando curl en la línea de comandos (CMD, terminal o símbolo del sistema).

