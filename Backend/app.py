from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load API keys from .env file
load_dotenv()
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
TOMORROW_API_KEY = os.getenv('TOMORROW_API_KEY')

# Optional: Return emoji or icon based on weather code
def get_weather_icon(code):
    icon_map = {
        1000: "https://cdn-icons-png.flaticon.com/512/869/869869.png",  # Clear
        1001: "https://cdn-icons-png.flaticon.com/512/414/414825.png",  # Cloudy
        4000: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png", # Drizzle
        4001: "https://cdn-icons-png.flaticon.com/512/3076/3076129.png", # Rain
        4200: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png", # Light Rain
        4201: "https://cdn-icons-png.flaticon.com/512/3736/3736942.png", # Heavy Rain
        8000: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png", # Thunderstorm
    }
    return icon_map.get(code, "https://cdn-icons-png.flaticon.com/512/1163/1163624.png")  # Default


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/weather', methods=['POST'])
def get_weather():
    try:
        data = request.get_json()
        city = data.get('city')
        lat = data.get('lat')
        lon = data.get('lon')

        if city:
            # Forward geocoding
            geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={OPENWEATHER_API_KEY}"
            geo_response = requests.get(geo_url).json()
            if not geo_response:
                return jsonify({"error": "City not found"}), 400

            lat = geo_response[0]['lat']
            lon = geo_response[0]['lon']
        elif lat and lon:
            # Reverse geocoding
            geo_url = f"https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={OPENWEATHER_API_KEY}"
            geo_response = requests.get(geo_url).json()
            if geo_response and isinstance(geo_response, list) and 'name' in geo_response[0]:
                city = geo_response[0]['name']
            else:
                city = "Unknown Location"
        else:
            return jsonify({"error": "City or coordinates required"}), 400

        # Weather data
        weather_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        weather_response = requests.get(weather_url).json()

        temperature = weather_response['main']['temp']
        humidity = weather_response['main']['humidity']
        condition = weather_response['weather'][0]['main']
        icon_code = weather_response['weather'][0]['icon']
        icon_url = f"https://openweathermap.org/img/wn/{icon_code}@2x.png"

        return jsonify({
            "city": city,
            "temperature": temperature,
            "humidity": humidity,
            "condition": condition,
            "icon": icon_url,
            "lat": lat,
            "lon": lon
        })

    except Exception as e:
        print("[Weather Error]", e)
        return jsonify({"error": "Unable to fetch weather data"}), 500

# Map Tomorrow.io weather code to readable condition
def map_weather_code(code):
    code_map = {
        1000: "Clear",
        1100: "Mostly Clear",
        1101: "Partly Cloudy",
        1102: "Mostly Cloudy",
        1001: "Cloudy",
        4000: "Drizzle",
        4001: "Rain",
        4200: "Light Rain",
        4201: "Heavy Rain",
        5000: "Snow",
        5100: "Light Snow",
        5101: "Heavy Snow",
        8000: "Thunderstorm",
    }
    return code_map.get(code, "Unknown")




@app.route('/forecast', methods=['POST'])
def get_forecast():
    try:
        data = request.get_json()
        lat = data.get('lat')
        lon = data.get('lon')

        if not lat or not lon:
            return jsonify({"error": "Latitude or longitude not provided"}), 400

        url = f"https://api.tomorrow.io/v4/weather/forecast?location={lat},{lon}&timesteps=1d&apikey={TOMORROW_API_KEY}"
        response = requests.get(url)
        forecast_data = response.json()

        print("[DEBUG] Raw Forecast Response:")
        print(forecast_data)

        daily = forecast_data['timelines']['daily'][:5]  # Only first 5 days
        result = []

        for day in daily:
            values = day['values']
            result.append({
                "date": day['time'][:10],
                "condition": map_weather_code(values['weatherCodeMax']),
                "max": round(values['temperatureMax'], 1),
                "min": round(values['temperatureMin'], 1),
                "icon": get_weather_icon(values['weatherCodeMax'])  # Optional icon logic
            })

        return jsonify(result)

    except Exception as e:
        print("[Forecast Error]", e)
        return jsonify({"error": "Failed to fetch forecast"}), 500

if __name__ == '__main__':
    app.run(debug=True)
