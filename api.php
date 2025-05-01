<?php
phpinfo();
error_reporting(E_ALL);
ini_set('display_errors', 1);

$input = file_get_contents('php://input');
file_put_contents('debug.log', $input, FILE_APPEND);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$db_host = 'localhost';
$db_name = 'gas_monitoring';
$db_user = 'root';
$db_pass = '';

// Thresholds (in ppm)
$thresholds = [
    'co' => 50,
    'co2' => 5000,
    'so2' => 5,
    'ch4' => 1000,
    'butane' => 800,
    'lpg' => 1000,
    'smoke' => 300
];

// Database connection
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed']));
}

// Handle POST requests from NodeMCU
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['device_id'])) {
        http_response_code(400);
        die(json_encode(['status' => 'error', 'message' => 'Invalid data']));
    }
    
    // Register device if not exists
    $stmt = $pdo->prepare("INSERT IGNORE INTO devices (device_id) VALUES (?)");
    $stmt->execute([$data['device_id']]);
    
    // Insert measurements
    $stmt = $pdo->prepare("INSERT INTO gas_measurements 
        (device_id, co, co2, so2, ch4, butane, lpg, smoke, temperature, humidity) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['device_id'],
        $data['co'] ?? null,
        $data['co2'] ?? null,
        $data['so2'] ?? null,
        $data['ch4'] ?? null,
        $data['butane'] ?? null,
        $data['lpg'] ?? null,
        $data['smoke'] ?? null,
        $data['temperature'] ?? null,
        $data['humidity'] ?? null
    ]);
    
    // Update device last seen
    $stmt = $pdo->prepare("UPDATE devices SET last_seen = NOW() WHERE device_id = ?");
    $stmt->execute([$data['device_id']]);
    
    // Check for threshold alerts
    foreach ($thresholds as $gas => $threshold) {
        if (isset($data[$gas]) && $data[$gas] > $threshold) {
            $stmt = $pdo->prepare("INSERT INTO alerts 
                (device_id, gas_type, value, threshold) 
                VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['device_id'],
                $gas,
                $data[$gas],
                $threshold
            ]);
        }
    }
    
    echo json_encode(['status' => 'success', 'message' => 'Measurements saved']);
}

// Handle GET requests from web interface
elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $device_id = $_GET['device_id'] ?? null;
    
    if (!$device_id) {
        http_response_code(400);
        die(json_encode(['status' => 'error', 'message' => 'Device ID required']));
    }
    
    // Get latest readings
    if (isset($_GET['latest'])) {
        $limit = min(100, (int)($_GET['limit'] ?? 1));
        $stmt = $pdo->prepare("SELECT * FROM gas_measurements 
                              WHERE device_id = ? 
                              ORDER BY reading_time DESC 
                              LIMIT ?");
        $stmt->execute([$device_id, $limit]);
        $readings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'data' => $readings]);
    }
    // Get historical data
    elseif (isset($_GET['history'])) {
        $hours = (int)($_GET['hours'] ?? 24);
        $date = $_GET['date'] ?? date('Y-m-d');
        
        if ($hours > 0) {
            $stmt = $pdo->prepare("SELECT * FROM gas_measurements 
                                  WHERE device_id = ? 
                                  AND reading_time >= DATE_SUB(NOW(), INTERVAL ? HOUR)
                                  ORDER BY reading_time ASC");
            $stmt->execute([$device_id, $hours]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM gas_measurements 
                                  WHERE device_id = ? 
                                  AND DATE(reading_time) = ?
                                  ORDER BY reading_time ASC");
            $stmt->execute([$device_id, $date]);
        }
        
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $history]);
    }
    // Get active alerts
    elseif (isset($_GET['alerts'])) {
        $stmt = $pdo->prepare("SELECT * FROM alerts 
                              WHERE device_id = ? 
                              AND status = 'active'
                              ORDER BY alert_time DESC");
        $stmt->execute([$device_id]);
        $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'data' => $alerts]);
    }
    // Invalid request
    else {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
    }
}

// Handle unsupported methods
else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>