<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Origin, X-Requested-With, Accept');

$statusFile = 'led_status.json';
$sensorFile = 'sensor_data.json';

// Manejar solicitud OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Manejar solicitudes GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['sensor'])) {
        // Devuelve los datos recopilados de los sensores
        if (file_exists($sensorFile)) {
            echo file_get_contents($sensorFile);
        } else {
            echo json_encode([]);
        }
    } else {
        // Devuelve el estado actual del LED
        if (file_exists($statusFile)) {
            echo file_get_contents($statusFile);
        } else {
            echo json_encode(["status" => "OFF"]);
        }
    }
    exit;
}

// Manejar solicitudes POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    // Actualizar estado del LED
    if (isset($input['status']) && in_array($input['status'], ['ON', 'OFF'])) {
        if (file_put_contents($statusFile, json_encode(["status" => $input['status']])) !== false) {
            echo json_encode(["message" => "Estado actualizado", "status" => $input['status']]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "No se pudo escribir en el archivo de estado"]);
        }
    }
    // Registrar datos de sensores (se esperan 5 sensores: sensor1 a sensor5)
    else if (isset($input['sensorData'])) {
        $requiredKeys = ['sensor1', 'sensor2', 'sensor3', 'sensor4', 'sensor5'];
        foreach ($requiredKeys as $key) {
            if (!isset($input['sensorData'][$key])) {
                http_response_code(400);
                echo json_encode(["error" => "Falta el dato de '$key'"]);
                exit;
            }
        }

        $sensorData = $input['sensorData'];
        $sensorData['timestamp'] = date('Y-m-d H:i:s');

        $data = [];
        if (file_exists($sensorFile)) {
            $data = json_decode(file_get_contents($sensorFile), true);
        }
        $data[] = $sensorData;

        if (file_put_contents($sensorFile, json_encode($data)) !== false) {
            echo json_encode(["message" => "Datos de sensores registrados"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Error al escribir datos de sensores"]);
        }
    }
    else {
        http_response_code(400);
        echo json_encode(["error" => "Solicitud POST inválida"]);
    }
    exit;
}

// Método no permitido para otros casos
http_response_code(405);
echo json_encode(["error" => "Método no permitido"]);
exit;
?>
