let lastCity = "";
let isLoading = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  // Add enter key listener for search input
  const cityInput = document.getElementById('cityInput');
  cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      getWeather();
    }
  });

  // Try to get user's location on load
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      error => {
        console.log('Location access denied or unavailable');
        // Load default city (Nagpur) if location is not available
        document.getElementById('cityInput').value = 'Nagpur';
        getWeather();
      }
    );
  } else {
    // Fallback for browsers without geolocation
    document.getElementById('cityInput').value = 'Nagpur';
    getWeather();
  }
});

function showLoading() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  const weatherResult = document.getElementById('weatherResult');
  const forecastContainer = document.getElementById('forecastContainer');
  
  loadingSpinner.classList.remove('hidden');
  weatherResult.innerHTML = '';
  forecastContainer.innerHTML = '';
  isLoading = true;
}

function hideLoading() {
  const loadingSpinner = document.getElementById('loadingSpinner');
  loadingSpinner.classList.add('hidden');
  isLoading = false;
}

function showError(message) {
  const weatherResult = document.getElementById('weatherResult');
  weatherResult.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Oops! Something went wrong</h3>
      <p>${message}</p>
      <button onclick="getWeather()" class="btn btn-primary">
        <i class="fas fa-redo"></i> Try Again
      </button>
    </div>
  `;
}

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    showNotification("Please enter a city name.", "warning");
    return;
  }

  if (isLoading) {
    return; // Prevent multiple simultaneous requests
  }

  lastCity = city;
  showLoading();

  fetch("http://127.0.0.1:5000/weather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("✅ Received from /weather:", data);
      hideLoading();
      
      if (data.error) {
        showError(data.error);
        return;
      }

      const { city: cityName, temperature, condition, humidity, icon, lat, lon } = data;
      displayCurrentWeather(cityName, temperature, condition, humidity, icon);
      
      // Get forecast data
      getForecast(lat, lon);



      // Render map
      displayCurrentWeather(cityName, temperature, condition, humidity, icon);
      renderMap(lat, lon, cityName);



    })
    .catch((err) => {
      hideLoading();
      console.error("Weather fetch error:", err);
      showError("Unable to fetch weather data. Please check your internet connection and try again.");
    });
}

function getWeatherByCoords(lat, lon) {
  if (isLoading) {
    return;
  }

  showLoading();

  fetch("http://127.0.0.1:5000/weather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lon }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      hideLoading();
      
      if (data.error) {
        showError(data.error);
        return;
      }

      const { city: cityName, temperature, condition, humidity, icon, lat, lon } = data;
      lastCity = cityName;
      document.getElementById('cityInput').value = cityName;
      displayCurrentWeather(cityName, temperature, condition, humidity, icon);
      
      // Get forecast data
      getForecast(lat, lon);

      
    })
    .catch((err) => {
      hideLoading();
      console.error("Weather fetch error:", err);
      showError("Unable to fetch weather data for your location.");
    });
}

function displayCurrentWeather(cityName, temperature, condition, humidity, icon) {
  const weatherResult = document.getElementById('weatherResult');
  console.log(cityName)
  // Add additional weather details (you can enhance this with more data from your API)
  const html = `
    <div class="weather-main">
      <h2><i class="fas fa-map-marker-alt"></i> ${cityName}</h2>
      <img src="${icon}" alt="${condition}" class="weather-icon" />
      <div class="weather-temp">${temperature}°C</div>
      <div class="weather-condition">${condition}</div>
    </div>
    <div class="weather-details">
      <div class="weather-detail">
        <i class="fas fa-thermometer-half"></i>
        <div class="label">Temperature</div>
        <div class="value">${temperature}°C</div>
      </div>
      <div class="weather-detail">
        <i class="fas fa-tint"></i>
        <div class="label">Humidity</div>
        <div class="value">${humidity}%</div>
      </div>
      <div class="weather-detail">
        <i class="fas fa-eye"></i>
        <div class="label">Condition</div>
        <div class="value">${condition}</div>
      </div>
      <div class="weather-detail">
        <i class="fas fa-clock"></i>
        <div class="label">Updated</div>
        <div class="value">${new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  `;
  
  weatherResult.innerHTML = html;
  
  // Add animation class
  weatherResult.classList.add('weather-card');
  
  // Show success notification
  showNotification(`Weather updated for ${cityName}!`, "success");
}

function getForecast(lat, lon) {
  fetch("http://127.0.0.1:5000/forecast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lon }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      if (data.error) {
        console.error("Forecast error:", data.error);
        return;
      }

      displayForecast(data);
    })
    .catch((err) => {
      console.error("Forecast fetch error:", err);
      // Don't show error for forecast as it's secondary data
    });
}

function displayForecast(data) {
  const container = document.getElementById("forecastContainer");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="no-forecast">
        <i class="fas fa-calendar-times"></i>
        <p>Forecast data not available</p>
      </div>
    `;
    return;
  }

  data.forEach((day, index) => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <h4>${day.date}</h4>
      <img src="${day.icon}" alt="${day.condition}" />
      <div class="condition">${day.condition}</div>
      <div class="temps">
        <span class="max-temp">${day.max}°</span>
        <span class="min-temp">${day.min}°</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function refreshWeather() {
  if (!lastCity) {
    showNotification("No city to refresh. Please enter a city first.", "warning");
    return;
  }
  
  document.getElementById("cityInput").value = lastCity;
  getWeather();
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icon = type === 'success' ? 'fas fa-check-circle' : 
               type === 'warning' ? 'fas fa-exclamation-triangle' : 
               type === 'error' ? 'fas fa-times-circle' : 'fas fa-info-circle';
  
  notification.innerHTML = `
    <i class="${icon}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add notification styles dynamically
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .notification i {
    margin-right: 10px;
  }

  .notification-success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }

  .notification-warning {
    background: linear-gradient(135deg, #f39c12 0%, #f1c40f 100%);
  }

  .notification-error {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  }

  .notification-info {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  }

  .notification.fade-out {
    animation: slideOut 0.3s ease-in;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0%);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0%);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

function renderMap(lat, lon, cityName) {
  const mapDiv = document.getElementById("map");

  // If a map already exists, remove it
  if (window.weatherMap) {
    window.weatherMap.remove();
  }

  // Initialize map
  const map = L.map("map").setView([lat, lon], 10);
  window.weatherMap = map;

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  // Add marker
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`<b>${cityName}</b><br>📍 ${lat.toFixed(2)}, ${lon.toFixed(2)}`)
    .openPopup();
}





//Inject the styles into the HTML document
const styleTag = document.createElement('style');
styleTag.innerHTML = notificationStyles;
document.head.appendChild(styleTag);

