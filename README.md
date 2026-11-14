# 🌦️ Pakistan Weather Analytics Platform

A containerized full-stack weather monitoring and statistical visualization web application built with **React**, **Python Flask**, **Seaborn/Matplotlib**, and **Google Firebase Firestore**, orchestrated via **Docker Compose**.

The platform fetches real-time meteorological data from the **OpenWeatherMap API** across **7 major Pakistani cities** (*Karachi, Lahore, Islamabad, Peshawar, Quetta, Multan, and Faisalabad*), stores the telemetry in Cloud Firestore, and renders live KPI summaries, city weather cards, and comparative analytical charts.

---

## 🏗️ System Architecture

| Service / Tier | Technology / Base Image | Exposed Port | Responsibilities |
| :--- | :--- | :--- | :--- |
| **`react-frontend`** | React (`node:18-slim`) | `3000:3000` | Interactive dashboard UI displaying national KPI cards, live city weather metrics, and Seaborn analytical charts. |
| **`python-backend`** | Python Flask (`python:3.10-slim`) | `5000:5000` | REST API syncing live OpenWeather data to Firestore and generating high-resolution Seaborn PNG visualizations. |
| **Cloud Database** | Google Firebase Firestore | HTTPS / TLS | Serverless NoSQL document store persisting city weather records under the `weather_data` collection. |

---

## 📁 Project Structure

```text
Weather_Visualization_Project/
├── backend/
│   ├── Dockerfile              # Python 3.10 slim container configuration
│   ├── app.py                  # Flask REST API, Firestore sync & Seaborn chart endpoints
│   ├── requirements.txt        # Python dependencies (Flask, Seaborn, Firebase Admin, etc.)
│   ├── .env                    # Local environment variables (ignored by Git)
│   └── serviceAccountKey.json  # Firebase Admin SDK credentials (ignored by Git)
├── frontend/
│   ├── Dockerfile              # Node 18 slim container configuration
│   ├── package.json            # React dependencies & scripts
│   └── src/                    # React dashboard components & styling
├── docker-compose.yml          # Multi-container orchestration & persistent volume setup
├── .gitignore                  # Protects credentials, .env, and node_modules
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started (Run with Docker)

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
* An active [OpenWeatherMap API Key](https://openweathermap.org/api)
* A Google Firebase project with **Cloud Firestore** enabled and an Admin SDK `serviceAccountKey.json` file

### 1. Clone the Repository
```bash
git clone https://github.com/waniya-asim03/Weather_Visualization_Project.git
cd Weather_Visualization_Project
```

### 2. Configure Local Credentials
Because sensitive credentials are excluded from version control via `.gitignore`, add your local keys before starting the containers:

1. **Firebase Service Account Key:** Place your downloaded `serviceAccountKey.json` file inside the `backend/` directory.
2. **OpenWeather API Key:** Create a `.env` file inside `backend/` with your API key:
   ```env
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

### 3. Build and Launch Containers
```bash
docker compose up --build -d
```

Verify both containers are running:
```bash
docker ps
```

### 4. Access the Application
* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
* **Backend API Health / Endpoints:** `http://localhost:5000`

Click **Sync Live Weather Data** on the dashboard to fetch fresh readings for all 7 cities, store them in Firestore, and render updated Seaborn temperature and humidity comparison charts.

---

## 🔌 Backend REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/fetch-and-store` | Fetches current weather from OpenWeatherMap for 7 Pakistani cities and saves records to Firestore. |
| `GET` | `/api/weather-cards` | Retrieves all stored city weather documents from Firestore. |
| `GET` | `/api/kpi-summary` | Computes the hottest city, coldest city, and national average humidity. |
| `GET` | `/api/visualizations/temperature` | Generates and returns a grouped bar chart (`PNG`) comparing Min, Current, and Max temperatures (`°C`). |
| `GET` | `/api/visualizations/humidity` | Generates and returns a bar chart (`PNG`) comparing relative humidity (`%`) across all 7 cities. |

---

## 🛑 Stopping & Restarting Containers

* **Stop containers:**
  ```bash
  docker compose stop
  ```
* **Start containers again (fast startup using cached volume):**
  ```bash
  docker compose start
  ```

---

## 👤 Author
* **Waniya Asim** — [@waniya-asim03](https://github.com/waniya-asim03)