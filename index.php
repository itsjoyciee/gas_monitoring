<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gas Monitoring System</title>
    <link rel="stylesheet" href="style.css" type="text/css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>

<body>
    <nav>
        <div class="logo">Gas Monitor</div>
        <ul>
            <li><a href="#home" class="active">Home</a></li>
            <li><a href="#monitoring">Live Monitoring</a></li>
            <li><a href="#history">History</a></li>
            <li><a href="#emergency">Emergency Contacts</a></li>
            <li><a href="#about">About Us</a></li>
        </ul>
    </nav>

    <!-- 1. Home Section -->
    <section id="home">
        <div class="hero">
            <h1>Real-Time Gas Detection System</h1>
            <p>Monitor multiple gas levels for safety and compliance</p>
        </div>
    </section>

    
<!-- Live Monitoring Section -->
<section id="monitoring">
    <h2>Live Gas Monitoring</h2>
    
    <div class="monitoring-controls">
        <div class="time-selector">
            <label for="history-hours">Show History:</label>
            <select id="history-hours">
                <option value="1">Last 1 Hour</option>
                <option value="6">Last 6 Hours</option>
                <option value="24" selected>Last 24 Hours</option>
                <option value="168">Last 7 Days</option>
            </select>
        </div>
        <button id="refresh-btn" onclick="loadLiveData()">
            <i class="fas fa-sync-alt"></i> Refresh
        </button>
    </div>
    
    <div class="gas-list">
        <!-- CO -->
        <div class="gas-list-item">
            <div class="gas-info">
                <i class="fas fa-skull-crossbones gas-icon"></i>
                <div class="gas-title">
                    <h3>Carbon Monoxide (CO)</h3>
                    <div class="gas-history-toggle" onclick="toggleHistoryChart('co')">
                        <i class="fas fa-chart-line"></i> History
                    </div>
                </div>
                <div class="gas-details">
                    <p class="gas-description">Colorless, odorless toxic gas. Dangerous above 50 ppm.</p>
                    <div class="gas-value">
                        <div class="gauge" id="co-gauge">
                            <svg class="gauge-circle" viewBox="0 0 36 36">
                                <path class="gauge-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="gauge-circle-fill" id="co-gauge-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="gauge-value" id="co-gauge-value">0</div>
                        </div>
                        <div class="gas-reading" id="co-reading">0 ppm</div>
                        <div class="status safe" id="co-status">Safe</div>
                    </div>
                    <div class="gas-history" id="co-history">
                        <canvas id="co-chart"></canvas>
                        <div class="recent-readings" id="co-readings">
                            <h4>Recent Readings</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- CO2 -->
        <div class="gas-list-item">
            <div class="gas-info">
                <i class="fas fa-cloud gas-icon"></i>
                <div class="gas-title">
                    <h3>Carbon Dioxide (CO₂)</h3>
                    <div class="gas-history-toggle" onclick="toggleHistoryChart('co2')">
                        <i class="fas fa-chart-line"></i> History
                    </div>
                </div>
                <div class="gas-details">
                    <p class="gas-description">Greenhouse gas, harmful in high concentrations above 5000 ppm.</p>
                    <div class="gas-value">
                        <div class="gauge" id="co2-gauge">
                            <svg class="gauge-circle" viewBox="0 0 36 36">
                                <path class="gauge-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="gauge-circle-fill" id="co2-gauge-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="gauge-value" id="co2-gauge-value">0</div>
                        </div>
                        <div class="gas-reading" id="co2-reading">0 ppm</div>
                        <div class="status safe" id="co2-status">Safe</div>
                    </div>
                    <div class="gas-history" id="co2-history">
                        <canvas id="co2-chart"></canvas>
                        <div class="recent-readings" id="co2-readings">
                            <h4>Recent Readings</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- SO2 -->
        <div class="gas-list-item">
            <div class="gas-info">
                <i class="fas fa-biohazard gas-icon"></i>
                <div class="gas-title">
                    <h3>Sulfur Dioxide (SO₂)</h3>
                    <div class="gas-history-toggle" onclick="toggleHistoryChart('so2')">
                        <i class="fas fa-chart-line"></i> History
                    </div>
                </div>
                <div class="gas-details">
                    <p class="gas-description">Toxic gas with strong odor. Hazardous above 5 ppm.</p>
                    <div class="gas-value">
                        <div class="gauge" id="so2-gauge">
                            <svg class="gauge-circle" viewBox="0 0 36 36">
                                <path class="gauge-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="gauge-circle-fill" id="so2-gauge-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="gauge-value" id="so2-gauge-value">0</div>
                        </div>
                        <div class="gas-reading" id="so2-reading">0 ppm</div>
                        <div class="status safe" id="so2-status">Safe</div>
                    </div>
                    <div class="gas-history" id="so2-history">
                        <canvas id="so2-chart"></canvas>
                        <div class="recent-readings" id="so2-readings">
                            <h4>Recent Readings</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- CH4 -->
        <div class="gas-list-item">
            <div class="gas-info">
                <i class="fas fa-biohazard gas-icon"></i>
                <div class="gas-title">
                    <h3>Methane (CH₄)</h3>
                    <div class="gas-history-toggle" onclick="toggleHistoryChart('ch4')">
                        <i class="fas fa-chart-line"></i> History
                    </div>
                </div>
                <div class="gas-details">
                    <p class="gas-description">Highly flammable natural gas. Dangerous above 1000 ppm.</p>
                    <div class="gas-value">
                        <div class="gauge" id="ch4-gauge">
                            <svg class="gauge-circle" viewBox="0 0 36 36">
                                <path class="gauge-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="gauge-circle-fill" id="ch4-gauge-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="gauge-value" id="ch4-gauge-value">0</div>
                        </div>
                        <div class="gas-reading" id="ch4-reading">0 ppm</div>
                        <div class="status safe" id="ch4-status">Safe</div>
                    </div>
                    <div class="gas-history" id="ch4-history">
                        <canvas id="ch4-chart"></canvas>
                        <div class="recent-readings" id="ch4-readings">
                            <h4>Recent Readings</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Butane -->
        <div class="gas-list-item">
            <div class="gas-info">
                <i class="fas fa-burn gas-icon"></i>
                <div class="gas-title">
                    <h3>Butane (C₄H₁₀)</h3>
                    <div class="gas-history-toggle" onclick="toggleHistoryChart('butane')">
                        <i class="fas fa-chart-line"></i> History
                    </div>
                </div>
                <div class="gas-details">
                    <p class="gas-description">Flammable hydrocarbon gas. Critical above 800 ppm.</p>
                    <div class="gas-value">
                        <div class="gauge" id="butane-gauge">
                            <svg class="gauge-circle" viewBox="0 0 36 36">
                                <path class="gauge-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="gauge-circle-fill" id="butane-gauge-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="gauge-value" id="butane-gauge-value">0</div>
                        </div>
                        <div class="gas-reading" id="butane-reading">0 ppm</div>
                        <div class="status safe" id="butane-status">Safe</div>
                    </div>
                    <div class="gas-history" id="butane-history">
                        <canvas id="butane-chart"></canvas>
                        <div class="recent-readings" id="butane-readings">
                            <h4>Recent Readings</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- LPG -->
        <div class="gas-list-item">
            <div class="gas-info">
                <i class="fas fa-gas-pump gas-icon"></i>
                <div class="gas-title">
                    <h3>LPG</h3>
                    <div class="gas-history-toggle" onclick="toggleHistoryChart('lpg')">
                        <i class="fas fa-chart-line"></i> History
                    </div>
                </div>
                <div class="gas-details">
                    <p class="gas-description">Liquefied Petroleum Gas. Explosive above 1000 ppm.</p>
                    <div class="gas-value">
                        <div class="gauge" id="lpg-gauge">
                            <svg class="gauge-circle" viewBox="0 0 36 36">
                                <path class="gauge-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="gauge-circle-fill" id="lpg-gauge-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="gauge-value" id="lpg-gauge-value">0</div>
                        </div>
                        <div class="gas-reading" id="lpg-reading">0 ppm</div>
                        <div class="status safe" id="lpg-status">Safe</div>
                    </div>
                    <div class="gas-history" id="lpg-history">
                        <canvas id="lpg-chart"></canvas>
                        <div class="recent-readings" id="lpg-readings">
                            <h4>Recent Readings</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Smoke -->
        <div class="gas-list-item">
            <div class="gas-info">
                <i class="fas fa-smog gas-icon"></i>
                <div class="gas-title">
                    <h3>Smoke</h3>
                    <div class="gas-history-toggle" onclick="toggleHistoryChart('smoke')">
                        <i class="fas fa-chart-line"></i> History
                    </div>
                </div>
                <div class="gas-details">
                    <p class="gas-description">Particulate matter from combustion. Hazardous above 300 ppm.</p>
                    <div class="gas-value">
                        <div class="gauge" id="smoke-gauge">
                            <svg class="gauge-circle" viewBox="0 0 36 36">
                                <path class="gauge-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="gauge-circle-fill" id="smoke-gauge-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="gauge-value" id="smoke-gauge-value">0</div>
                        </div>
                        <div class="gas-reading" id="smoke-reading">0 ppm</div>
                        <div class="status safe" id="smoke-status">Safe</div>
                    </div>
                    <div class="gas-history" id="smoke-history">
                        <canvas id="smoke-chart"></canvas>
                        <div class="recent-readings" id="smoke-readings">
                            <h4>Recent Readings</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

    <!-- 3. History Section -->
    <section id="history">
        <h2>Historical Data</h2>
        <div class="history-container">
            <div class="history-list">
                <div class="history-controls">
                    <div class="date-selector">
                        <input type="date" id="historyDate" data-date-format="MM/DD/YYYY">
                        <button onclick="loadHistory()">Load Data</button>
                        <button onclick="downloadPDFReport()" class="download-btn">
                            <i class="fas fa-file-pdf"></i> Download PDF Report
                        </button>
                        <button id="sendEmailBtn" class="btn btn-primary">Send History via Email</button>
                    </div>
                    <div class="gas-legend">
                        <span class="legend-item"><span class="dot co"></span>CO</span>
                        <span class="legend-item"><span class="dot co2"></span>CO₂</span>
                        <span class="legend-item"><span class="dot so2"></span>SO₂</span>
                        <span class="legend-item"><span class="dot ch4"></span>CH₄</span>
                        <span class="legend-item"><span class="dot butane"></span>C₄H₁₀</span>
                        <span class="legend-item"><span class="dot lpg"></span>LPG</span>
                        <span class="legend-item"><span class="dot smoke"></span>Smoke</span>
                    </div>
                </div>
                
                <!-- Add Chart Canvas Here -->
                
                <div class="history-items">
                    <div class="history-item">
                        <div class="history-time">09:00 AM</div>
                        <div class="history-details">
                            <div class="gas-readings-list">
                                <div class="gas-reading-row">
                                    <span class="gas-icon co"></span>
                                    <span class="gas-name">CO</span>
                                    <span class="gas-value">25 ppm</span>
                                    <span class="status safe">Safe</span>
                                </div>
                                <!-- Repeat for other gases -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 4. Emergency Section -->
    <section id="emergency">
        <h2>Emergency Contacts</h2>
        <div class="emergency-grid">
            <div class="emergency-card">
                <h3>Gas Leak Emergency</h3>
                <p class="phone">911</p>
                <p>National Emergency Hotline</p>
                <a href="tel:911" class="call-btn">Call Now</a>
            </div>

            <div class="emergency-card">
                <h3>Fire Department</h3>
                <p class="phone">912</p>
                <p>Fire and Rescue Services</p>
                <a href="tel:912" class="call-btn">Call Now</a>
            </div>

            <div class="emergency-card">
                <h3>Poison Control</h3>
                <p class="phone">1-800-222-1222</p>
                <p>National Poison Control Center</p>
                <a href="tel:1-800-222-1222" class="call-btn">Call Now</a>
            </div>

            <div class="emergency-card">
                <h3>Gas Company</h3>
                <p class="phone">1-800-427-2200</p>
                <p>24/7 Emergency Service</p>
                <a href="tel:1-800-427-2200" class="call-btn">Call Now</a>
            </div>

            <div class="emergency-card">
                <h3>Local Police</h3>
                <p class="phone">913</p>
                <p>Non-Emergency Police Line</p>
                <a href="tel:913" class="call-btn">Call Now</a>
            </div>

            <div class="emergency-card">
                <h3>Emergency Management</h3>
                <p class="phone">914</p>
                <p>Disaster Response Team</p>
                <a href="tel:914" class="call-btn">Call Now</a>
            </div>
        </div>
    </section>

    <!-- 5. About Us Section -->
    <section id="about">
        <h2>About Us</h2>
        <div class="about-container">
            <div class="about-content">
                <div class="about-text">
                    <h3>Our Mission</h3>
                    <p>We are dedicated to creating safer environments through advanced gas monitoring technology. Our system provides real-time detection and alerts for various harmful gases, helping protect lives and maintain workplace safety standards.</p>
                    
                    <h3>What We Do</h3>
                    <p>Our Gas Monitoring System offers comprehensive solutions for:</p>
                    <ul>
                        <li>Real-time gas level monitoring</li>
                        <li>Instant alert notifications</li>
                        <li>Historical data tracking</li>
                        <li>Emergency response coordination</li>
                        <li>Compliance reporting</li>
                    </ul>

                    <h3>Our Vision</h3>
                    <p>To become the leading provider of innovative gas monitoring solutions, ensuring safety across industrial, commercial, and residential environments.</p>
                </div>

                <div class="about-features">
                    <div class="feature-card">
                        <i class="fas fa-clock"></i>
                        <h4>24/7 Monitoring</h4>
                        <p>Continuous real-time monitoring of gas levels</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-bell"></i>
                        <h4>Instant Alerts</h4>
                        <p>Immediate notifications for dangerous gas levels</p>
                    </div>
                    <div class="feature-card">
                        <i class="fas fa-chart-line"></i>
                        <h4>Data Analytics</h4>
                        <p>Comprehensive historical data analysis</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 6. Quick Links Section -->
    <section id="quick-links">
        <h2>Quick Links</h2>
        <div class="quick-links-grid">
            <a href="#home" class="quick-link">
                <i class="fas fa-home"></i>
                <h4>Home</h4>
                <p>Return to main page</p>
            </a>
            <a href="#monitoring" class="quick-link">
                <i class="fas fa-desktop"></i>
                <h4>Live Monitor</h4>
                <p>View real-time gas levels</p>
            </a>
            <a href="#history" class="quick-link">
                <i class="fas fa-history"></i>
                <h4>History</h4>
                <p>Check historical data</p>
            </a>
            <a href="#emergency" class="quick-link">
                <i class="fas fa-phone-alt"></i>
                <h4>Emergency</h4>
                <p>Important contact numbers</p>
            </a>
            <a href="#about" class="quick-link">
                <i class="fas fa-info-circle"></i>
                <h4>About Us</h4>
                <p>Learn more about our system</p>
            </a>
        </div>
    </section>

    <script src="script.js"></script>
    <script>
        document.getElementById('sendEmailBtn').addEventListener('click', function() {
            const email = prompt("Enter your email address:");
            if (email && email.includes('@')) {
                // Get the gas history data from your history panel
                const gasHistoryData = document.getElementById('historyData').innerText;
                
                // Create email subject and body
                const subject = "Gas Detection History Report";
                const body = `Gas Detection History Report\n\nBelow is the recent history of gas detection readings:\n\n${gasHistoryData}\n\nThis is an automated message from your Gas Monitoring System.`;
                
                // Create and open mailto link
                const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.open(mailtoUrl);
            } else {
                alert("Please enter a valid email address");
            }
        });
    </script>
</body>
</html>
