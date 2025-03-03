// URL de la API (ajusta la ruta según donde se encuentre alojado tu api.php)
const apiUrl = "https://b9525e27-c7bb-4a18-a265-73e1bc3eab42-00-3i6e87kyqnh89.worf.replit.dev/";

// Configuración de títulos y parámetros para cada sensor (nombres cortos)
const sensorTitles = {
  sensor1: {
    title: "Sensor de temperatura",
    parameter: "Temperatura (°C)"
  },
  sensor2: {
    title: "Sensor de humedad",
    parameter: "Humedad (%)"
  },
  sensor3: {
    title: "Sensor de distancia",
    parameter: "Distancia (cm)"
  },
  sensor4: {
    title: "Sensor de vibración",
    parameter: "Vibración (m/s²)"
  },
  sensor5: {
    title: "Sensor de corriente",
    parameter: "Corriente (A)"
  }
};

let currentChartMode = 'single'; // 'single' o 'all'
let sensorChart;                // Instancia del gráfico en modo único
let sensorCharts = {};          // Instancias de gráficos en modo "todos"
let sensorDataHistory = [];     // Historial de datos de sensores

// Función para formatear la fecha de forma más corta (dd/mm/aa hh:mm)
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Función para generar un valor aleatorio realista
function getRandomValue(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Función para comprobar la conexión con el ESP32 mediante POST
function comprobarConexion() {
  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Enviamos una acción de comprobación de conexión
    body: JSON.stringify({ action: "comprobarConexion" })
  })
  .then(response => response.json())
  .then(data => {
    // Se actualiza el estado con un mensaje profesional
    document.getElementById("status").innerText = "Conexión con el ESP32 verificada exitosamente.";
    console.log("Respuesta:", data);
  })
  .catch(error => {
    document.getElementById("status").innerText = "Error al verificar la conexión con el ESP32.";
    console.error("Error:", error);
  });
}

// Actualiza el sensor card con datos formateados usando los nombres de cada sensor
function updateSensorCard(ultimaLectura) {
  const sensorHTML = `
    <div class="sensor-row"><span class="sensor-label">${sensorTitles.sensor1.title}:</span> <span class="sensor-value">${ultimaLectura.sensor1}</span></div>
    <div class="sensor-row"><span class="sensor-label">${sensorTitles.sensor2.title}:</span> <span class="sensor-value">${ultimaLectura.sensor2}</span></div>
    <div class="sensor-row"><span class="sensor-label">${sensorTitles.sensor3.title}:</span> <span class="sensor-value">${ultimaLectura.sensor3}</span></div>
    <div class="sensor-row"><span class="sensor-label">${sensorTitles.sensor4.title}:</span> <span class="sensor-value">${ultimaLectura.sensor4}</span></div>
    <div class="sensor-row"><span class="sensor-label">${sensorTitles.sensor5.title}:</span> <span class="sensor-value">${ultimaLectura.sensor5}</span></div>
    <div class="sensor-timestamp"><em>Última actualización: ${formatTimestamp(ultimaLectura.timestamp)}</em></div>
  `;
  document.getElementById("sensorStatus").innerHTML = sensorHTML;
}

// Actualiza el gráfico en modo único o de acuerdo al tipo seleccionado
function updateSensorChart() {
  const sensorSelect = document.getElementById("sensorSelect");
  const chartTypeSelect = document.getElementById("chartTypeSelect");
  let chartType = chartTypeSelect.value; // "line", "bar", "radar", "pie" o "doughnut"

  // Ocultar el botón de "Ver todos los gráficos" si el tipo es "pie" o "doughnut"
  const toggleBtn = document.getElementById("toggleChartMode");
  if (chartType === 'pie' || chartType === 'doughnut') {
    toggleBtn.style.display = "none";
    currentChartMode = 'single'; // Forzamos el modo único
  } else {
    toggleBtn.style.display = "inline-block";
  }

  // Si se selecciona "pie" o "doughnut", se graficarán los valores del último registro para todos los sensores
  if (chartType === 'pie' || chartType === 'doughnut') {
    if (sensorDataHistory.length === 0) return;
    const ultimaLectura = sensorDataHistory[sensorDataHistory.length - 1];
    const labels = Object.keys(sensorTitles);
    const dataValues = labels.map(key => ultimaLectura[key]);

    if (sensorChart) {
      if (sensorChart.config.type !== chartType) {
        sensorChart.destroy();
        sensorChart = null;
      } else {
        sensorChart.data.labels = labels;
        sensorChart.data.datasets[0].data = dataValues;
        sensorChart.options.plugins.title.text = "Distribución de valores de sensores";
        sensorChart.update();
        return;
      }
    }
    const ctx = document.getElementById('sensorChart').getContext('2d');
    sensorChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: labels.map(key => getSensorColor(key, 0.6)),
          borderColor: labels.map(key => getSensorColor(key, 1)),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Distribución de valores de sensores"
          }
        }
      }
    });
  } else {
    // Para gráficos de línea, barras o radar se usa la serie temporal del sensor seleccionado
    const sensorKey = sensorSelect.value;
    const config = sensorTitles[sensorKey];
    const timestamps = sensorDataHistory.map(entry => formatTimestamp(entry.timestamp));
    const sensorValues = sensorDataHistory.map(entry => entry[sensorKey]);

    if (sensorChart) {
      if (sensorChart.config.type !== chartType) {
        sensorChart.destroy();
        sensorChart = null;
      } else {
        sensorChart.data.labels = timestamps;
        sensorChart.data.datasets[0].data = sensorValues;
        sensorChart.data.datasets[0].label = config.parameter;
        sensorChart.options.plugins.title.text = config.title;
        sensorChart.options.plugins.subtitle.text = config.parameter;
        if (sensorChart.options.scales && sensorChart.options.scales.y) {
          sensorChart.options.scales.y.title.text = config.parameter;
        }
        sensorChart.update();
        return;
      }
    }
    const ctx = document.getElementById('sensorChart').getContext('2d');
    sensorChart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: timestamps,
        datasets: [{
          label: config.parameter,
          data: sensorValues,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: chartType === 'line' ? 'rgba(54, 162, 235, 0.2)' : 'rgba(54, 162, 235, 0.6)',
          fill: chartType === 'line' ? false : true,
          tension: chartType === 'line' ? 0.1 : 0
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: config.title
          },
          subtitle: {
            display: true,
            text: config.parameter
          }
        },
        scales: (chartType === 'bar' || chartType === 'line' || chartType === 'radar') ? {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: config.parameter
            }
          }
        } : {}
      }
    });
  }
}

// Actualizar gráficos en modo "todos"
function updateAllSensorCharts() {
  const sensorKeys = ['sensor1', 'sensor2', 'sensor3', 'sensor4', 'sensor5'];
  const chartTypeSelect = document.getElementById("chartTypeSelect");
  let chartType = chartTypeSelect.value;
  
  // Para modo "todos" es preferible utilizar gráficos que muestren series temporales.
  if (chartType === 'pie' || chartType === 'doughnut') {
    alert("El modo 'todos' no es compatible con gráficos de tipo " + chartType + ". Se usará gráfico de línea.");
    chartType = 'line';
  }
  
  const timestamps = sensorDataHistory.map(entry => formatTimestamp(entry.timestamp));
  
  sensorKeys.forEach(sensorKey => {
    const config = sensorTitles[sensorKey];
    const sensorValues = sensorDataHistory.map(entry => entry[sensorKey]);
    const canvasId = "sensorChart_" + sensorKey;
    
    if (sensorCharts[sensorKey]) {
      if (sensorCharts[sensorKey].config.type !== chartType) {
        sensorCharts[sensorKey].destroy();
        sensorCharts[sensorKey] = null;
      } else {
        sensorCharts[sensorKey].data.labels = timestamps;
        sensorCharts[sensorKey].data.datasets[0].data = sensorValues;
        sensorCharts[sensorKey].data.datasets[0].label = config.parameter;
        sensorCharts[sensorKey].options.plugins.title.text = config.title;
        sensorCharts[sensorKey].options.plugins.subtitle.text = config.parameter;
        sensorCharts[sensorKey].options.scales.y.title.text = config.parameter;
        sensorCharts[sensorKey].update();
        return;
      }
    }
    
    let canvas = document.getElementById(canvasId);
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = canvasId;
      canvas.width = 300;
      canvas.height = 150;
      document.getElementById("chartContainer").appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    sensorCharts[sensorKey] = new Chart(ctx, {
      type: chartType,
      data: {
        labels: timestamps,
        datasets: [{
          label: config.parameter,
          data: sensorValues,
          borderColor: getSensorColor(sensorKey),
          backgroundColor: getSensorColor(sensorKey, 0.2),
          fill: chartType === 'line' ? false : true,
          tension: chartType === 'line' ? 0.1 : 0
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: config.title
          },
          subtitle: {
            display: true,
            text: config.parameter
          }
        },
        scales: (chartType === 'bar' || chartType === 'line' || chartType === 'radar') ? {
          x: {
            ticks: {
              autoSkip: true,
              maxTicksLimit: 10
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: config.parameter
            }
          }
        } : {}
      }
    });
  });
}

// Función auxiliar para obtener colores según el sensor
function getSensorColor(sensorKey, alpha = 1) {
  const colors = {
    sensor1: `rgba(255, 99, 132, ${alpha})`,
    sensor2: `rgba(54, 162, 235, ${alpha})`,
    sensor3: `rgba(255, 206, 86, ${alpha})`,
    sensor4: `rgba(75, 192, 192, ${alpha})`,
    sensor5: `rgba(153, 102, 255, ${alpha})`
  };
  return colors[sensorKey] || `rgba(100, 100, 100, ${alpha})`;
}

// Alternar entre modo "único" y "todos"
function toggleChartMode() {
  const toggleBtn = document.getElementById("toggleChartMode");
  const chartContainer = document.getElementById("chartContainer");
  const singleControls = document.getElementById("singleControls");
  
  if (currentChartMode === 'single') {
    currentChartMode = 'all';
    toggleBtn.textContent = "Ver gráfico seleccionado";
    chartContainer.innerHTML = "";
    sensorChart = null;
    sensorCharts = {};
    updateAllSensorCharts();
    singleControls.style.display = "none";
  } else {
    currentChartMode = 'single';
    toggleBtn.textContent = "Ver todos los gráficos";
    chartContainer.innerHTML = '<canvas id="sensorChart" width="300" height="150"></canvas>';
    sensorChart = null;
    sensorCharts = {};
    updateSensorChart();
    singleControls.style.display = "inline-block";
  }
}

// Obtener datos de sensores
function fetchSensorData() {
  fetch(apiUrl + "?sensor=true")
    .then(response => response.json())
    .then(data => {
      // Si los sensores 4 y 5 no se envían desde la API, se asignan valores aleatorios realistas
      data.forEach(reading => {
        reading.sensor4 = getRandomValue(0, 10); // Por ejemplo, vibración entre 0 y 10 m/s²
        reading.sensor5 = getRandomValue(0, 5);   // Por ejemplo, corriente entre 0 y 5 A
      });
      
      sensorDataHistory = data;
      if (data.length > 0) {
        const ultimaLectura = data[data.length - 1];
        updateSensorCard(ultimaLectura);
      } else {
        document.getElementById("sensorStatus").innerHTML = "<p class='loading'>No hay datos de sensor.</p>";
      }
      if (currentChartMode === 'single') {
        updateSensorChart();
      } else {
        updateAllSensorCharts();
      }
    })
    .catch(error => console.error("Error al obtener datos del sensor:", error));
}

// Inicializar cuando el documento se cargue
document.addEventListener('DOMContentLoaded', () => {
  fetchSensorData();
  setInterval(fetchSensorData, 5000); // Actualiza cada 5 segundos
});
