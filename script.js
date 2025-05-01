// Navigation active state
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// WebSocket connection to ESP32
// Update WebSocket connection to use the Python server
const ws = new WebSocket('ws://localhost:8765');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // Handle regular gas data updates
    if (!data.type) {
        updateGasLevels(data);
        saveToHistory(data);
    }
    // Handle alerts
    else if (data.type === 'alert') {
        showAlert(data);
    }
};

// Add this new function to handle alerts
function showAlert(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'gas-alert';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${alert.message}</span>
    `;
    document.body.appendChild(alertDiv);
    
    // Remove alert after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Add this function to save data to history
function saveToHistory(data) {
    const historyData = JSON.parse(localStorage.getItem('gasHistory') || '[]');
    historyData.push(data);
    // Keep only last 100 readings
    if (historyData.length > 100) {
        historyData.shift();
    }
    localStorage.setItem('gasHistory', JSON.stringify(historyData));
}

function updateGasLevels(data) {
    const gases = ['co', 'co2', 'so2', 'ch4', 'butane', 'lpg', 'smoke'];
    
    gases.forEach(gas => {
        if (data[gas] !== undefined) {
            const gauge = document.getElementById(`${gas}-gauge`);
            const reading = document.getElementById(`${gas}-reading`);
            const status = document.getElementById(`${gas}-status`);
            
            if (gauge && reading && status) {
                // Update gauge
                const percentage = (data[gas] / getMaxValue(gas)) * 100;
                gauge.style.background = `conic-gradient(var(--secondary) ${percentage}%, var(--dark) 0%)`;
                
                // Update reading display
                reading.textContent = `${data[gas]} ppm`;
                
                // Update status
                const statusClass = getStatusClass(gas, data[gas]);
                status.className = `status ${statusClass}`;
                status.textContent = getStatus(gas, data[gas]);
            }
        }
    });
}

function updateHistoryList(data) {
    const historyItems = document.querySelector('.history-items');
    historyItems.innerHTML = '';

    data.readings.forEach(reading => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <div class="history-time">${reading.timestamp}</div>
            <div class="history-details">
                <div class="gas-readings-list">
                    ${['co', 'co2', 'so2', 'ch4', 'butane', 'lpg', 'smoke'].map(gas => `
                        <div class="gas-reading-row">
                            <span class="gas-icon ${gas}"></span>
                            <span class="gas-name">${getGasName(gas)}</span>
                            <span class="gas-value">${reading[gas]} ppm</span>
                            <span class="status ${getStatusClass(gas, reading[gas])}">${getStatus(gas, reading[gas])}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        historyItems.appendChild(historyItem);
    });
}

// Add this helper function for gas names
function getGasName(gas) {
    const names = {
        co: 'CO',
        co2: 'CO₂',
        so2: 'SO₂',
        ch4: 'CH₄',
        butane: 'C₄H₁₀',
        lpg: 'LPG',
        smoke: 'Smoke'
    };
    return names[gas] || gas.toUpperCase();
}

function getMaxValue(gas) {
    const maxValues = {
        co: 50,
        co2: 5000,
        so2: 5,
        ch4: 1000,
        butane: 800,
        lpg: 1000,
        smoke: 300
    };
    return maxValues[gas];
}

function getStatus(gas, value) {
    const max = getMaxValue(gas);
    if (value < max * 0.5) return 'Safe';
    if (value < max * 0.8) return 'Warning';
    return 'Danger';
}

function getStatusClass(gas, value) {
    const max = getMaxValue(gas);
    if (value < max * 0.5) return 'safe';
    if (value < max * 0.8) return 'warning';
    return 'danger';
}

// History chart functionality
let historyChart;

apdocument.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker with current date
    const historyDate = document.getElementById('historyDate');
    const today = new Date();
    historyDate.value = formatDate(today);

    // Add click handler to show date picker
    historyDate.addEventListener('click', function() {
        const temp = document.createElement('input');
        temp.type = 'date';
        temp.style.display = 'none';
        document.body.appendChild(temp);
        temp.focus();
        temp.click();

        temp.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            historyDate.value = formatDate(selectedDate);
            document.body.removeChild(temp);
        });
    });
});

function formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Update your existing loadHistory function
function loadHistory() {
    const dateInput = document.getElementById('historyDate').value;
    const [month, day, year] = dateInput.split('/');
    const formattedDate = `${year}-${month}-${day}`; // Format for API request
    
    fetch(`/api/history?date=${formattedDate}`)
        .then(response => response.json())
        .then(data => {
            updateHistoryList(data);
        });
}

function updateHistoryList(data) {
    const historyItems = document.querySelector('.history-items');
    historyItems.innerHTML = '';

    data.readings.forEach(reading => {
        // Convert timestamp to MM/DD/YYYY HH:MM format
        const timestamp = new Date(reading.timestamp).toLocaleString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <div class="history-time">${reading.timestamp}</div>
            <div class="history-details">
                <div class="gas-readings-list">
                    <div class="gas-reading-row">
                        <span class="gas-icon co"></span>
                        <span class="gas-name">CO</span>
                        <span class="gas-value">${reading.co} ppm</span>
                        <span class="status ${getStatusClass('co', reading.co)}">${getStatus('co', reading.co)}</span>
                    </div>
                    <div class="gas-reading-row">
                        <span class="gas-icon co2"></span>
                        <span class="gas-name">CO₂</span>
                        <span class="gas-value">${reading.co2} ppm</span>
                        <span class="status ${getStatusClass('co2', reading.co2)}">${getStatus('co2', reading.co2)}</span>
                    </div>
                    <div class="gas-reading-row">
                        <span class="gas-icon so2"></span>
                        <span class="gas-name">SO₂</span>
                        <span class="gas-value">${reading.so2} ppm</span>
                        <span class="status ${getStatusClass('so2', reading.so2)}">${getStatus('so2', reading.so2)}</span>
                    </div>
                    <div class="gas-reading-row">
                        <span class="gas-icon ch4"></span>
                        <span class="gas-name">CH₄</span>
                        <span class="gas-value">${reading.ch4} ppm</span>
                        <span class="status ${getStatusClass('ch4', reading.ch4)}">${getStatus('ch4', reading.ch4)}</span>
                    </div>
                    <div class="gas-reading-row">
                        <span class="gas-icon butane"></span>
                        <span class="gas-name">C₄H₁₀</span>
                        <span class="gas-value">${reading.butane} ppm</span>
                        <span class="status ${getStatusClass('butane', reading.butane)}">${getStatus('butane', reading.butane)}</span>
                    </div>
                    <div class="gas-reading-row">
                        <span class="gas-icon lpg"></span>
                        <span class="gas-name">LPG</span>
                        <span class="gas-value">${reading.lpg} ppm</span>
                        <span class="status ${getStatusClass('lpg', reading.lpg)}">${getStatus('lpg', reading.lpg)}</span>
                    </div>
                    <div class="gas-reading-row">
                        <span class="gas-icon smoke"></span>
                        <span class="gas-name">Smoke</span>
                        <span class="gas-value">${reading.smoke} ppm</span>
                        <span class="status ${getStatusClass('smoke', reading.smoke)}">${getStatus('smoke', reading.smoke)}</span>
                    </div>
                </div>
            </div>
        `;
        
        historyItems.appendChild(historyItem);
    });
}

function updateHistoryChart(data) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    
    if (historyChart) {
        historyChart.destroy();
    }

    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.timestamps,
            datasets: data.gases.map(gas => ({
                label: gas.name,
                data: gas.values,
                borderColor: getGasColor(gas.name),
                tension: 0.1
            }))
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getGasColor(gas) {
    const colors = {
        co: '#ff4444',
        co2: '#00C851',
        so2: '#ffbb33',
        ch4: '#33b5e5',
        butane: '#2BBBAD',
        lpg: '#4285F4',
        smoke: '#aa66cc'
    };
    return colors[gas.toLowerCase()];
}

// Add these functions to your script.js
function downloadPDFReport() {
    const selectedDate = document.getElementById('historyDate').value;
    if (!selectedDate) {
        alert('Please select a date first');
        return;
    }

    // Create PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add custom font
    doc.addFont('fonts/OldManBookstyle.ttf', 'OldManBookstyle', 'normal');
    doc.setFont('OldManBookstyle');
    
    // Add header with custom font
    doc.setFontSize(22);
    doc.text('Gas Monitoring Report', 20, 20);
    
    // Add date
    doc.setFontSize(14);
    doc.text(`Date: ${formatDate(selectedDate)}`, 20, 30);
    
    // Add gas readings with custom font
    doc.setFontSize(12);
    let yPos = 50;
    
    // Get all gas readings for the day
    const gasReadings = getGasReadingsForDate(selectedDate);
    
    gasReadings.forEach(reading => {
        doc.text(`Time: ${reading.time}`, 20, yPos);
        yPos += 10;
        
        // Add each gas reading with custom font
        doc.text(`CO: ${reading.co} ppm - ${reading.coStatus}`, 30, yPos);
        yPos += 7;
        doc.text(`CO₂: ${reading.co2} ppm - ${reading.co2Status}`, 30, yPos);
        yPos += 7;
        doc.text(`SO₂: ${reading.so2} ppm - ${reading.so2Status}`, 30, yPos);
        yPos += 7;
        doc.text(`CH₄: ${reading.ch4} ppm - ${reading.ch4Status}`, 30, yPos);
        yPos += 7;
        doc.text(`Butane: ${reading.butane} ppm - ${reading.butaneStatus}`, 30, yPos);
        yPos += 7;
        doc.text(`LPG: ${reading.lpg} ppm - ${reading.lpgStatus}`, 30, yPos);
        yPos += 7;
        doc.text(`Smoke: ${reading.smoke} ppm - ${reading.smokeStatus}`, 30, yPos);
        yPos += 15;
    });

    // Save the PDF
    doc.save(`gas-report-${selectedDate}.pdf`);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getGasReadingsForDate(date) {
    // This function should return the actual gas readings from your database/storage
    // This is a sample data structure
    return [
        {
            time: '09:00 AM',
            co: '25',
            coStatus: 'Safe',
            co2: '1000',
            co2Status: 'Safe',
            so2: '2',
            so2Status: 'Safe',
            ch4: '500',
            ch4Status: 'Safe',
            butane: '300',
            butaneStatus: 'Safe',
            lpg: '400',
            lpgStatus: 'Safe',
            smoke: '100',
            smokeStatus: 'Safe'
        }
        // Add more readings as needed
    ];
}

// Call button functionality
document.querySelectorAll('.call-btn').forEach(button => {
    button.addEventListener('click', function() {
        const phone = this.parentElement.querySelector('.phone').textContent;
        window.location.href = `tel:${phone}`;
    });
});


function updateGasDisplay(gasType, value) {
    // Update gauge
    const gauge = document.getElementById(`${gasType}-gauge`);
    const percentage = (value / getMaxValue(gasType)) * 100;
    gauge.style.background = `conic-gradient(var(--secondary) ${percentage}%, var(--dark) 0%)`;

    // Update reading display
    const reading = document.getElementById(`${gasType}-reading`);
    reading.textContent = `${value} ppm`;

    // Update status
    const status = document.getElementById(`${gasType}-status`);
    const statusClass = getStatusClass(gasType, value);
    status.className = `status ${statusClass}`;
    status.textContent = statusClass.charAt(0).toUpperCase() + statusClass.slice(1);
}

// Add this function to send email with history data
// Add or update this function in your script.js file
function sendEmailWithHistory() {
    const email = prompt("Enter your email address:");
    
    // Check if user clicked Cancel
    if (email === null || email === "") {
        // User clicked Cancel or entered nothing, just return without showing error
        return;
    }
    
    // Now check if the email is valid
    if (!email.includes('@')) {
        alert("Please enter a valid email address");
        return;
    }
    
    // Get the history data
    const historyItems = document.querySelector('.history-items');
    if (!historyItems || !historyItems.children.length) {
        alert("No history data available to send");
        return;
    }
    
    // Format the history data for email
    let historyText = "Gas Monitoring History Report\n\n";
    historyText += "Date: " + document.getElementById('historyDate').value + "\n\n";
    
    // Collect gas readings data
    const gasReadingsData = [];
    Array.from(historyItems.children).forEach(item => {
        const timestamp = item.querySelector('.history-time').textContent;
        const gasRows = item.querySelectorAll('.gas-reading-row');
        
        const readingData = {
            timestamp: timestamp,
            readings: {}
        };
        
        gasRows.forEach(row => {
            const gasName = row.querySelector('.gas-name').textContent;
            const gasValue = row.querySelector('.gas-value').textContent;
            const status = row.querySelector('.status').textContent;
            readingData.readings[gasName] = {
                value: gasValue,
                status: status
            };
            historyText += `${gasName}: ${gasValue} - ${status}\n`;
        });
        
        gasReadingsData.push(readingData);
        historyText += "\n";
    });
    
    // Show sending indicator
    const sendingIndicator = document.createElement('div');
    sendingIndicator.className = 'sending-indicator';
    sendingIndicator.innerHTML = '<span>Sending email...</span>';
    document.body.appendChild(sendingIndicator);
    
    // Send the email data to the server
    fetch('/api/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            subject: "Gas Monitoring History Report",
            body: historyText,
            data: gasReadingsData
        })
    })
    .then(response => response.json())
    .then(data => {
        // Remove sending indicator
        document.body.removeChild(sendingIndicator);
        
        if (data.success) {
            alert(`Email successfully sent to ${email}`);
        } else {
            alert(`Failed to send email: ${data.error}`);
        }
    })
    .catch(error => {
        // Remove sending indicator
        document.body.removeChild(sendingIndicator);
        alert(`Error sending email: ${error.message}`);
    });
    
    // Create a notification element
    const notification = document.createElement('div');
    notification.className = 'email-notification';
    notification.innerHTML = '<span>Sending email to ' + email + '...</span>';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);
    
    // Send the email data to the server
    fetch('/api/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            subject: "Gas Monitoring History Report",
            body: historyText,
            data: gasReadingsData
        })
    })
    .then(response => response.json())
    .then(data => {
        // Update notification with success message
        if (data.success) {
            notification.innerHTML = '<span>✓ Email successfully sent to ' + email + '</span>';
            notification.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
            
            // Add to sent emails log in localStorage
            const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
            sentEmails.push({
                email: email,
                date: new Date().toISOString(),
                success: true
            });
            localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
            
            // Remove notification after 5 seconds
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 5000);
        } else {
            notification.innerHTML = '<span>✗ Failed to send email: ' + data.error + '</span>';
            notification.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
            
            // Remove notification after 5 seconds
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 5000);
        }
    })
    .catch(error => {
        // Update notification with error message
        notification.innerHTML = '<span>✗ Error sending email: ' + error.message + '</span>';
        notification.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    });
}

// Update live gas readings every 5 seconds
// Complete fetch implementation for live data
// LIVE MONITORING - COMPLETE WORKING VERSION
function updateLiveReadings() {
    fetch('/api/live_data')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log("Live Data Received:", data); // Debug log
  
        // Update all gas displays
        ['co', 'co2', 'so2', 'ch4', 'butane', 'lpg', 'smoke'].forEach(gas => {
          const ppm = data[gas] || 0;
          
          // Update numeric value
          const readingEl = document.getElementById(`${gas}-reading`);
          if (readingEl) readingEl.textContent = `${ppm} ppm`;
          
          // Update status
          const statusEl = document.getElementById(`${gas}-status`);
          if (statusEl) {
            const isDanger = ppm > getGasThreshold(gas);
            statusEl.textContent = isDanger ? 'DANGER' : 'SAFE';
            statusEl.className = `status ${isDanger ? 'danger' : 'safe'}`;
          }
        });
      })
      .catch(error => {
        console.error("Live update failed:", error);
        document.getElementById('api-status').textContent = "Connection Error";
      });
  }
  
  // Thresholds per gas type
  function getGasThreshold(gas) {
    const thresholds = {
      co: 50,       // CO becomes dangerous above 50ppm
      co2: 5000,     // CO2 threshold
      so2: 5,        // SO2 threshold
      ch4: 1000,     // Methane threshold
      butane: 800,   // Butane threshold
      lpg: 1000,     // LPG threshold
      smoke: 300     // Smoke threshold
    };
    return thresholds[gas] || 0;
  }
  
  // Initialize and refresh every 5 seconds
  updateLiveReadings(); 
  setInterval(updateLiveReadings, 5000);
  // Helper function - define your thresholds per gas
  function getThresholdForGas(gas) {
    const thresholds = {
      co: 50,
      co2: 5000,
      so2: 5,
      ch4: 1000,
      butane: 800,
      lpg: 1000,
      smoke: 300
    };
    return thresholds[gas] || 50;
  }
  
  // Call initially and set interval for updates
  updateLiveReadings();
  setInterval(updateLiveReadings, 5000); // Update every 5 seconds
  // Load historical data
// HISTORY SECTION - COMPLETE WORKING VERSION
function loadHistory() {
    fetch('/api/history')
      .then(response => {
        if (!response.ok) throw new Error("Network response not OK");
        return response.json();
      })
      .then(data => {
        console.log("History Data:", data); // Debug log
        
        // Clear previous entries
        const container = document.querySelector('.history-items');
        container.innerHTML = '';
        
        // Add new entries
        data.forEach(entry => {
          const entryEl = document.createElement('div');
          entryEl.className = 'history-item';
          
          entryEl.innerHTML = `
            <div class="history-time">
              ${new Date(entry.timestamp).toLocaleTimeString()}
            </div>
            <div class="history-details">
              ${generateGasReadingsHTML(entry)}
            </div>
          `;
          
          container.appendChild(entryEl);
        });
      })
      .catch(error => {
        console.error("History load failed:", error);
        document.querySelector('.history-items').innerHTML = `
          <div class="error">Failed to load history. Try refreshing.</div>
        `;
      });
  }
  
  // Helper: Generate HTML for gas readings
  function generateGasReadingsHTML(entry) {
    return ['co', 'co2', 'so2', 'ch4', 'butane', 'lpg', 'smoke']
      .map(gas => `
        <div class="gas-reading-row">
          <span class="gas-icon ${gas}"></span>
          <span class="gas-name">${gas.toUpperCase()}</span>
          <span class="gas-value">${entry[gas] || 0} ppm</span>
          <span class="status ${entry[gas] > getGasThreshold(gas) ? 'danger' : 'safe'}">
            ${entry[gas] > getGasThreshold(gas) ? 'DANGER' : 'SAFE'}
          </span>
        </div>
      `).join('');
  }
  
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
  });
// Change all API endpoints to point to app.py (port 5000)
const API_BASE = 'http://localhost:5000';

async function fetchLiveData() {
    try {
        const response = await fetch(`${API_BASE}/api/live_data`);
        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        updateGasLevels(data);
    } catch (error) {
        console.error("Failed to fetch live data:", error);
        showError("Connection error - using demo data");
        // Fallback to demo data
        updateGasLevels({
            co: 25, co2: 400, so2: 2, 
            ch4: 500, butane: 300, 
            lpg: 400, smoke: 100
        });
    }
}

// Main function to load history
async function loadHistory() {
  try {
      const response = await fetch(`${API_BASE}/api/history`);
    if (!response.ok) throw new Error("Network response was not ok");
    const historyData = await response.json();
    
    // 2. Update the chart
    updateHistoryChart(historyData);
    
    // 3. Update the history list
    renderHistoryList(historyData);
    
  } catch (error) {
    console.error("History load error:", error);
    showError("Couldn't load history");
}
}

// Chart rendering function
function updateHistoryChart(data) {
  const ctx = document.getElementById('historyChart').getContext('2d');
  
  // Prepare dataset for each gas
  const datasets = Object.keys(GAS_COLORS).map(gas => ({
    label: gas.toUpperCase(),
    data: data.map(entry => entry[gas]),
    borderColor: GAS_COLORS[gas],
    backgroundColor: `${GAS_COLORS[gas]}33`, // Add transparency
    borderWidth: 2,
    tension: 0.1
  }));

  // Create or update chart
  if (window.historyChart) {
    window.historyChart.data.labels = data.map(entry => 
      new Date(entry.timestamp).toLocaleTimeString()
    );
    window.historyChart.data.datasets = datasets;
    window.historyChart.update();
  } else {
    window.historyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(entry => 
          new Date(entry.timestamp).toLocaleTimeString()
        ),
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'PPM Value'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });
  }
}

// History list rendering
function renderHistoryList(data) {
  const container = document.getElementById('history-items-container');
  
  container.innerHTML = data.map(entry => `
    <div class="history-item">
      <div class="history-time">
        ${new Date(entry.timestamp).toLocaleString()}
      </div>
      <div class="history-details">
        <div class="gas-readings-list">
          ${Object.entries(entry)
            .filter(([key]) => key !== 'timestamp')
            .map(([gas, ppm]) => `
              <div class="gas-reading-row">
                <span class="gas-icon ${gas}" style="color: ${GAS_COLORS[gas]}"></span>
                <span class="gas-name">${gas.toUpperCase()}</span>
                <span class="gas-value">${ppm} ppm</span>
                <span class="status ${ppm > getThresholdForGas(gas) ? 'danger' : 'safe'}">
                  ${ppm > getThresholdForGas(gas) ? 'DANGER' : 'Safe'}
                </span>
              </div>
            `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
  
  // Set up date picker functionality
  document.getElementById('historyDate').addEventListener('change', (e) => {
    loadHistoryByDate(e.target.value);
  });
});

// Optional: Date filtering
async function loadHistoryByDate(date) {
  try {
    const response = await fetch(`/api/history?date=${date}`);
    const data = await response.json();
    renderHistoryList(data);
  } catch (error) {
    console.error("Date filter failed:", error);
  }
}

// Database Dashboard Functions
function openDbTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.db-tab-content').forEach(tab => {
      tab.style.display = 'none';
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.db-tab').forEach(tab => {
      tab.classList.remove('active');
  });
  
  // Show the selected tab content
  document.getElementById(tabId).style.display = 'block';
  
  // Add active class to clicked tab
  event.currentTarget.classList.add('active');
  
  // Load data if not already loaded
  if (tabId === 'readings' && !window.readingsLoaded) loadReadings();
  else if (tabId === 'gas' && !window.gasLoaded) loadGasMeasurements();
  else if (tabId === 'alerts' && !window.alertsLoaded) loadAlerts();
  else if (tabId === 'notifications' && !window.notificationsLoaded) loadNotifications();
  else if (tabId === 'sensors' && !window.sensorsLoaded) loadSensors();
}

function loadReadings() {
  fetch('/api/readings')
      .then(response => response.json())
      .then(data => {
          const tbody = document.querySelector('#readings-table tbody');
          tbody.innerHTML = '';
          
          data.data.forEach(reading => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${reading.reading_id}</td>
                  <td>${reading.sensor_id}</td>
                  <td>${new Date(reading.timestamp).toLocaleString()}</td>
              `;
              tbody.appendChild(row);
          });
          
          window.readingsLoaded = true;
      });
}

function loadGasMeasurements() {
  fetch('/api/gas_measurements')
      .then(response => response.json())
      .then(data => {
          const tbody = document.querySelector('#gas-table tbody');
          tbody.innerHTML = '';
          
          data.forEach(measurement => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${measurement.measurement_id}</td>
                  <td>${measurement.reading_id}</td>
                  <td>${measurement.gas_type}</td>
                  <td>${measurement.ppm_value}</td>
              `;
              tbody.appendChild(row);
          });
          
          window.gasLoaded = true;
      });
}

function loadAlerts() {
  fetch('/api/alerts')
      .then(response => response.json())
      .then(data => {
          const tbody = document.querySelector('#alerts-table tbody');
          tbody.innerHTML = '';
          
          data.data.forEach(alert => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${alert.alert_id}</td>
                  <td>${alert.gas_type}</td>
                  <td>${alert.current_value}</td>
                  <td>${alert.threshold}</td>
                  <td><span class="severity-badge ${alert.severity}">${alert.severity}</span></td>
                  <td>${new Date(alert.timestamp).toLocaleString()}</td>
              `;
              tbody.appendChild(row);
          });
          
          window.alertsLoaded = true;
      });
}

function loadNotifications() {
  fetch('/api/notifications')
      .then(response => response.json())
      .then(data => {
          const tbody = document.querySelector('#notifications-table tbody');
          tbody.innerHTML = '';
          
          data.forEach(notification => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${notification.notification_id}</td>
                  <td>${notification.message}</td>
                  <td>${new Date(notification.created_at).toLocaleString()}</td>
              `;
              tbody.appendChild(row);
          });
          
          window.notificationsLoaded = true;
      });
}

function loadSensors() {
  fetch('/api/sensors')
      .then(response => response.json())
      .then(data => {
          const tbody = document.querySelector('#sensors-table tbody');
          tbody.innerHTML = '';
          
          data.forEach(sensor => {
              const row = document.createElement('tr');
              row.innerHTML = `
                  <td>${sensor.sensor_id}</td>
                  <td>${sensor.location || 'N/A'}</td>
                  <td><span class="status-badge ${sensor.status}">${sensor.status}</span></td>
                  <td>${new Date(sensor.installed_at).toLocaleDateString()}</td>
              `;
              tbody.appendChild(row);
          });
          
          window.sensorsLoaded = true;
      });
}

// Add to your DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the first tab
  loadReadings();
});

// Gas configuration
const gasConfig = {
  'co': { name: 'Carbon Monoxide', max: 50, color: '#FF6384', icon: 'fa-skull-crossbones' },
  'co2': { name: 'Carbon Dioxide', max: 5000, color: '#36A2EB', icon: 'fa-cloud' },
  'so2': { name: 'Sulfur Dioxide', max: 5, color: '#FFCE56', icon: 'fa-biohazard' },
  'ch4': { name: 'Methane', max: 1000, color: '#4BC0C0', icon: 'fa-biohazard' },
  'butane': { name: 'Butane', max: 800, color: '#9966FF', icon: 'fa-burn' },
  'lpg': { name: 'LPG', max: 1000, color: '#FF9F40', icon: 'fa-gas-pump' },
  'smoke': { name: 'Smoke', max: 300, color: '#8AC24A', icon: 'fa-smog' }
};

// Chart instances
const gasCharts = {};
let refreshInterval;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load initial data
  loadLiveData();
  
  // Set up auto-refresh (every 30 seconds)
  refreshInterval = setInterval(loadLiveData, 30000);
  
  // Update when time range changes
  document.getElementById('history-hours').addEventListener('change', loadLiveData);
});

// Load live data with history
function loadLiveData() {
  // Show loading state
  document.getElementById('refresh-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  
  // First load current values (mock API call - replace with your actual API)
  fetchLiveData()
      .then(data => {
          // Update current values
          for (const [gas, value] of Object.entries(data)) {
              updateGasDisplay(gas, value);
          }
          
          // Then load historical data for each gas
          const hours = document.getElementById('history-hours').value;
          for (const gas of Object.keys(gasConfig)) {
              loadGasHistory(gas, hours);
          }
          
          // Restore refresh button
          document.getElementById('refresh-btn').innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
      })
      .catch(error => {
          console.error('Error loading data:', error);
          document.getElementById('refresh-btn').innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
      });
}

// Mock function to fetch live data - replace with your actual API call
function fetchLiveData() {
  // In a real implementation, this would be a fetch() call to your backend
  return new Promise(resolve => {
      // Simulate API delay
      setTimeout(() => {
          // Generate random values within safe ranges
          const data = {};
          for (const gas of Object.keys(gasConfig)) {
              data[gas] = Math.random() * gasConfig[gas].max * 0.8;
          }
          resolve(data);
      }, 500);
  });
}

// Update individual gas display
function updateGasDisplay(gas, value) {
  const config = gasConfig[gas];
  const element = document.getElementById(`${gas}-reading`);
  const statusElement = document.getElementById(`${gas}-status`);
  const gaugeValue = document.getElementById(`${gas}-gauge-value`);
  const gaugeFill = document.getElementById(`${gas}-gauge-fill`);
  
  // Update reading display
  element.textContent = `${value.toFixed(2)} ppm`;
  gaugeValue.textContent = value.toFixed(0);
  
  // Calculate gauge percentage (capped at 120% of max for visibility)
  const percentage = Math.min(value / (config.max * 1.2), 1);
  const circumference = 2 * Math.PI * 15.9155;
  const offset = circumference - (percentage * circumference);
  gaugeFill.style.strokeDashoffset = offset;
  
  // Update status
  let status = 'Safe';
  let statusClass = 'safe';
  if (value > config.max * 0.8) {
      status = 'Warning';
      statusClass = 'warning';
      gaugeFill.style.stroke = '#FFC107';
  }
  if (value > config.max) {
      status = 'Danger';
      statusClass = 'danger';
      gaugeFill.style.stroke = '#F44336';
  }
  
  statusElement.textContent = status;
  statusElement.className = `status ${statusClass}`;
  
  // Update gauge color if not in danger/warning
  if (status === 'Safe') {
      gaugeFill.style.stroke = '#4CAF50';
  }
}

// Load historical data for a gas
function loadGasHistory(gas, hours) {
  // In a real implementation, this would be a fetch() call to your backend
  // Here we'll generate mock historical data
  const now = new Date();
  const data = [];
  
  // Generate mock data points
  const numPoints = 24; // Points to generate
  const timeRange = hours * 60 * 60 * 1000; // Convert hours to milliseconds
  const config = gasConfig[gas];
  
  for (let i = 0; i < numPoints; i++) {
      const timeOffset = (timeRange / numPoints) * i;
      const timestamp = new Date(now.getTime() - timeOffset);
      
      // Generate a value that may trend up or down
      const baseValue = config.max * 0.3;
      const variation = Math.sin(i / 2) * config.max * 0.4;
      const randomFactor = Math.random() * config.max * 0.2;
      const value = Math.max(0, baseValue + variation + randomFactor);
      
      data.push({
          ppm_value: value,
          timestamp: timestamp.toISOString()
      });
  }
  
  // Update the display with this data
  updateHistoryChart(gas, data);
  updateRecentReadings(gas, data);
}

// Update history chart
function updateHistoryChart(gas, data) {
  const canvas = document.getElementById(`${gas}-chart`);
  const config = gasConfig[gas];
  
  // Prepare chart data
  const labels = data.map(item => new Date(item.timestamp).toLocaleTimeString()).reverse();
  const values = data.map(item => item.ppm_value).reverse();
  
  // Create or update chart
  if (!gasCharts[gas]) {
      gasCharts[gas] = new Chart(canvas, {
          type: 'line',
          data: {
              labels: labels,
              datasets: [{
                  label: `${config.name} (ppm)`,
                  data: values,
                  borderColor: config.color,
                  backgroundColor: `${config.color}20`,
                  fill: true,
                  tension: 0.1,
                  borderWidth: 2
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  y: {
                      beginAtZero: true,
                      max: config.max * 1.2,
                      title: {
                          display: true,
                          text: 'PPM'
                      },
                      grid: {
                          color: 'rgba(0,0,0,0.05)'
                      }
                  },
                  x: {
                      title: {
                          display: true,
                          text: 'Time'
                      },
                      grid: {
                          display: false
                      }
                  }
              },
              plugins: {
                  legend: {
                      display: false
                  },
                  tooltip: {
                      callbacks: {
                          label: function(context) {
                              return `${config.name}: ${context.parsed.y.toFixed(2)} ppm`;
                          }
                      }
                  }
              }
          }
      });
  } else {
      gasCharts[gas].data.labels = labels;
      gasCharts[gas].data.datasets[0].data = values;
      gasCharts[gas].update();
  }
}

// Update recent readings table
function updateRecentReadings(gas, data) {
  const tbody = document.querySelector(`#${gas}-readings tbody`);
  tbody.innerHTML = '';
  
  const config = gasConfig[gas];
  
  // Show the 10 most recent readings
  data.slice(0, 10).forEach(item => {
      const row = document.createElement('tr');
      const value = item.ppm_value;
      
      let status = 'Safe';
      let statusClass = 'safe';
      if (value > config.max * 0.8) {
          status = 'Warning';
          statusClass = 'warning';
      }
      if (value > config.max) {
          status = 'Danger';
          statusClass = 'danger';
      }
      
      row.innerHTML = `
          <td>${new Date(item.timestamp).toLocaleTimeString()}</td>
          <td>${value.toFixed(2)} ppm</td>
          <td><span class="${statusClass}">${status}</span></td>
      `;
      tbody.appendChild(row);
  });
}

// Toggle history chart visibility
function toggleHistoryChart(gas) {
  const historyElement = document.getElementById(`${gas}-history`);
  historyElement.classList.toggle('active');
  
  // Resize chart when made visible
  if (historyElement.classList.contains('active') && gasCharts[gas]) {
      setTimeout(() => {
          gasCharts[gas].resize();
      }, 10);
  }
}

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
  clearInterval(refreshInterval);
});