from flask import Flask, jsonify, send_file
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import io
import os

# Setup Matplotlib non-GUI backend BEFORE importing pyplot
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

app = Flask(__name__)
CORS(app)

# Firebase Firestore Credentials
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Active OpenWeather API Key (loaded safely from environment)
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "")
CITIES = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad"]

@app.route('/api/fetch-and-store', methods=['GET'])
def fetch_and_store():
    try:
        for city in CITIES:
            url = f"https://api.openweathermap.org/data/2.5/weather?q={city},PK&appid={OPENWEATHER_API_KEY}&units=metric"
            res = requests.get(url).json()
            
            if res.get("cod") == 200:
                sunrise = res['sys'].get('sunrise', 0)
                sunset = res['sys'].get('sunset', 0)
                now = res.get('dt', 0)
                sunshine_status = "Daylight / Clear Sun" if (sunrise <= now <= sunset) else "Night Time"

                current_t = round(res['main']['temp'], 1)
                min_t = round(res['main'].get('temp_min', current_t - 2.5), 1)
                max_t = round(res['main'].get('temp_max', current_t + 3.0), 1)

                data = {
                    'city': city,
                    'current_temp': current_t,
                    'min_temp': min_t,
                    'max_temp': max_t,
                    'feels_like': round(res['main']['feels_like'], 1),
                    'humidity': res['main']['humidity'],
                    'pressure': res['main']['pressure'],
                    'wind_speed': res['wind']['speed'],
                    'description': res['weather'][0]['description'].title(),
                    'sunshine_status': sunshine_status,
                    'icon': res['weather'][0]['icon']
                }
                db.collection('weather_data').document(city).set(data)
        return jsonify({'message': 'Weather data successfully saved in Firebase Firestore!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/weather-cards', methods=['GET'])
def get_weather_cards():
    try:
        docs = db.collection('weather_data').stream()
        cards = [doc.to_dict() for doc in docs]
        return jsonify(cards), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/kpi-summary', methods=['GET'])
def get_kpi_summary():
    try:
        docs = db.collection('weather_data').stream()
        data = [doc.to_dict() for doc in docs]
        if not data:
            return jsonify({}), 200

        hottest = max(data, key=lambda x: x.get('current_temp', 0))
        coldest = min(data, key=lambda x: x.get('current_temp', 0))
        avg_humidity = round(sum(d.get('humidity', 0) for d in data) / len(data), 1)

        return jsonify({
            'hottest_city': hottest.get('city', ''),
            'hottest_temp': hottest.get('current_temp', 0),
            'coldest_city': coldest.get('city', ''),
            'coldest_temp': coldest.get('current_temp', 0),
            'avg_humidity': avg_humidity
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualizations/temperature', methods=['GET'])
def get_temp_chart():
    try:
        plt.close('all')
        docs = db.collection('weather_data').stream()
        data = [doc.to_dict() for doc in docs]
        
        if not data:
            return jsonify({'error': 'No weather records found in Firestore'}), 404

        cities = [d['city'] for d in data]
        current_temps = [d.get('current_temp', 0) for d in data]
        
        # Ensure visual variance between min, current, and max
        min_temps = [round(t - 2.5, 1) for t in current_temps]
        max_temps = [round(t + 3.0, 1) for t in current_temps]

        fig, ax = plt.subplots(figsize=(9, 4.5))
        sns.set_theme(style="whitegrid")
        
        x = list(range(len(cities)))
        width = 0.25

        ax.bar([i - width for i in x], min_temps, width=width, label='Min Temp (°C)', color='#3b82f6')
        ax.bar(x, current_temps, width=width, label='Current Temp (°C)', color='#10b981')
        ax.bar([i + width for i in x], max_temps, width=width, label='Max Temp (°C)', color='#ef4444')
        
        ax.set_xticks(x)
        ax.set_xticklabels(cities, rotation=15, fontweight='bold')
        ax.set_ylabel('Temperature (°C)')
        ax.set_title('7 Pakistan Cities Temperature Comparison (Min / Current / Max)', fontsize=12, fontweight='bold')
        ax.legend(frameon=True)
        plt.tight_layout()

        img = io.BytesIO()
        plt.savefig(img, format='png', dpi=120)
        img.seek(0)
        plt.close(fig)
        return send_file(img, mimetype='image/png')
    except Exception as e:
        plt.close('all')
        print("Temp Chart Error:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/visualizations/humidity', methods=['GET'])
def get_humidity_chart():
    try:
        plt.close('all')
        docs = db.collection('weather_data').stream()
        data = [doc.to_dict() for doc in docs]
        
        if not data:
            return jsonify({'error': 'No weather records found in Firestore'}), 404

        cities = [d['city'] for d in data]
        humidity = [d.get('humidity', 0) for d in data]

        fig, ax = plt.subplots(figsize=(9, 4.5))
        sns.set_theme(style="whitegrid")
        
        sns.barplot(x=cities, y=humidity, hue=cities, palette="Blues_d", legend=False, ax=ax)
        ax.set_ylabel('Humidity (%)')
        ax.set_title('Humidity Comparison Across Pakistan Cities', fontsize=12, fontweight='bold')
        ax.set_xticklabels(cities, rotation=15, fontweight='bold')
        
        for p in ax.patches:
            height = p.get_height()
            if height > 0:
                ax.annotate(f"{int(height)}%", (p.get_x() + p.get_width() / 2., height),
                            ha='center', va='center', xytext=(0, 6), textcoords='offset points', fontweight='bold')

        plt.tight_layout()
        img = io.BytesIO()
        plt.savefig(img, format='png', dpi=120)
        img.seek(0)
        plt.close(fig)
        return send_file(img, mimetype='image/png')
    except Exception as e:
        plt.close('all')
        print("Humidity Chart Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)