# 🌦️ WeatherBot — Live Weather Forecasting App

**WeatherBot** is a sleek, responsive weather application that provides real-time weather updates, a 5-day forecast, and location-based services. Built with HTML, CSS, JavaScript (Frontend), and Flask (Backend), the app fetches weather data using external APIs and displays it in an intuitive UI.


---

## 🌐 Live Demo

- **Frontend (Vercel)**: [Visit WeatherBot →](https://live-weather-bot.vercel.app/)

---


## ✨ Features

- 🌍 **Search by City Name**
- 📍 **Auto-detect User Location (Geolocation)**
- ⛅ **Current Weather (Temp, Condition, Humidity, Icon)**
- 📅 **5-Day Forecast with Daily Stats**
- 🗺️ **Map View of the City (Leaflet.js)**
- 🧭 **Location-based Defaults**
- 🧪 **Error Handling & User Feedback**


---


## 🧰 Tech Stack

### 💻 Frontend
- HTML5, CSS3, JavaScript
- Leaflet.js (Map Integration)
- OpenWeatherMap Icons

### 🧪 Backend
- Python + Flask
- OpenWeatherMap API (Weather & Geocoding)
- Tomorrow.io API (5-Day Forecast)
- Flask-CORS (for cross-origin requests)

### 🌩️ APIs Used
- [OpenWeatherMap API](https://openweathermap.org/api) — current weather
- [Tomorrow.io API](https://www.tomorrow.io/weather-api/) — 5-day forecast

---


## 📁 Project Structure

WeatherBot/
│
├── Backend/
│ ├── app.py # Flask app (API endpoints)
│ ├── requirements.txt # Python dependencies
│ └── Procfile # For deployment (Render)
│
├── Frontend/
│ ├── index.html
│ ├── style.css
│ └── script.js


---


🛰️ Deployment
Frontend deployed on Vercel

Backend deployed on Render

CORS enabled to allow secure cross-origin communication


---



🙌 Acknowledgements
OpenWeather API

Tomorrow.io Forecast API

Render for backend deployment

Vercel for frontend hosting
