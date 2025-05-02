<?php
// Database connection
$host = "localhost";
$port = "5432";
$dbname = "joyce";
$user = "joyce_user";
$password = "B2640Hzk7ATDNpNGojCetjQ3Er1DxaAM";

// PostgreSQL connection string
$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");

if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to the database"]);
    exit;
}

// Query to get the latest sensor data
$query = "SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1";
$result = pg_query($conn, $query);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Query failed"]);
    exit;
}

$row = pg_fetch_assoc($result);

// Output as JSON
header('Content-Type: application/json');
echo json_encode($row);

// Close connection
pg_close($conn);
?>
