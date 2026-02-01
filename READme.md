# 🏭 PredictMaintAI - Industrial Predictive Maintenance System

> AI-powered predictive maintenance platform for industrial equipment monitoring and failure prediction

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Machine Learning Model](#machine-learning-model)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

**PredictMaintAI** is an enterprise-grade predictive maintenance system that leverages machine learning and AI to monitor industrial equipment health, predict failures, and provide actionable maintenance recommendations. The system continuously analyzes sensor data from 8 different types of industrial machines and uses RAG (Retrieval-Augmented Generation) powered AI to provide expert maintenance insights.

### Key Capabilities

- ⚡ **Real-time Monitoring** - Live sensor data ingestion and processing
- 🤖 **AI-Powered Predictions** - ML model predicts equipment failures with 88% confidence
- 🔍 **Health Scoring** - Industry-standard health metrics for all equipment
- 🚨 **Smart Alerting** - Automated alert generation with severity classification
- 💬 **AI Chat Assistant** - RAG-based maintenance engineer chatbot
- 📊 **Trend Analysis** - Historical data visualization and pattern detection
- 📑 **Report Generation** - Automated fleet health reports (TXT, JSON, PDF)
- 👥 **Worker Management** - Role-based access control system

## ✨ Features

### 🎛️ Dashboard & Monitoring

- **Fleet Health Overview** - Real-time fleet-wide health metrics
- **Machine Status Cards** - Individual machine health with trend analysis
- **Live Data Streaming** - Real-time sensor data updates every 5 seconds
- **Health Distribution Charts** - Visual breakdown of fleet status
- **Mini Trend Charts** - 6-hour health trends for each machine

### 🔮 Predictive Analytics

- **Failure Probability** - ML-based failure risk assessment
- **Time-to-Failure Estimation** - Hours until predicted failure
- **Confidence Scoring** - Prediction reliability metrics
- **AI Recommendations** - Automated maintenance action suggestions
- **Historical Predictions** - Track prediction accuracy over time

### 🚨 Alert System

- **Automated Alert Generation** - Creates alerts from predictions
- **Severity Classification** - CRITICAL, WARNING, NORMAL levels
- **Alert Acknowledgement** - Track and manage alert responses
- **Escalation Rules** - Automatic severity escalation
- **Alert History** - Complete audit trail of all alerts

### 💬 AI Maintenance Engineer

- **RAG-Powered Chat** - Contextual AI responses using real system data
- **Machine-Specific Queries** - Ask about individual machines
- **Fleet-Wide Analysis** - Get fleet overview and insights
- **Natural Language Interface** - Ask questions in plain English
- **Expert Recommendations** - AI provides maintenance guidance

### 📈 Analytics & Reports

- **Trend Visualization** - Line charts for health metrics
- **Anomaly Detection** - Identify unusual patterns
- **Report Downloads** - Export in TXT, JSON, or PDF format
- **Custom Time Ranges** - Analyze specific time periods
- **Summary Statistics** - Aggregate fleet metrics

### 🏭 Machine Management

- **8 Industrial Machines** - PUMP_01, PUMP_02, HVAC_01, HVAC_02, MOTOR_01, MOTOR_02, BEARING_01, COMPRESSOR_01
- **Machine Specifications** - Complete technical details
- **Maintenance Scheduling** - Plan and track maintenance dates
- **Machine History** - Complete operational timeline
- **Manufacturing & Expiry Dates** - Equipment lifecycle tracking

### 👤 User Management

- **JWT Authentication** - Secure token-based auth
- **Profile Management** - User account settings
- **Worker Access Control** - Manage team permissions
- **Settings Dashboard** - Customize notifications and preferences
- **Pro Subscription** - Tiered pricing plans (Starter, Pro, Enterprise)

## 🛠️ Technology Stack

### Backend

- **FastAPI** - High-performance Python web framework
- **MongoDB Atlas** - Cloud-hosted NoSQL database
- **Scikit-learn** - Machine learning model training
- **Pandas** - Data manipulation and analysis
- **ReportLab** - PDF report generation
- **OpenRouter** - AI model API integration
- **Python-JWT** - Authentication tokens

### Frontend

- **Next.js 15** - React framework with server-side rendering
- **React 19** - UI component library
- **GSAP** - Advanced animations
- **Recharts** - Data visualization charts
- **CSS-in-JS** - Styled components

### Machine Learning

- **Random Forest Classifier** - Primary prediction model
- **Feature Engineering** - 5 sensor input features
- **Binary Classification** - Failure/No-Failure prediction
- **Probability Estimation** - Confidence scoring
- **Model Persistence** - Pickle serialization

### AI & RAG

- **LLaMA 3** - Primary language model
- **Mistral 7B** - Fallback model
- **RAG Architecture** - Context retrieval + generation
- **OpenRouter API** - Multi-model inference
- **Prompt Engineering** - Expert system prompts

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 15 + React 19 + GSAP + Recharts                   │
│  (Dashboard, Charts, Alerts, Predictions, Chat UI)         │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST API
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  FastAPI + Python 3.11                                      │
│  ├── Auth (JWT)                                             │
│  ├── Health Monitoring                                      │
│  ├── Prediction Engine (ML)                                 │
│  ├── Alert Generator                                        │
│  ├── AI Chat (RAG)                                          │
│  └── Report Generator                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌─────────┐  ┌─────────┐  ┌──────────┐
│ MongoDB │  │ ML Model│  │ OpenRouter│
│ Atlas   │  │ (.pkl)  │  │ AI API   │
└─────────┘  └─────────┘  └──────────┘
    ▲
    │ Sensor Data
    │
┌─────────────────┐
│   IoT Simulator │
│  (Real-time)    │
└─────────────────┘
```

### Data Flow

1. **Sensor Simulator** → Generates realistic sensor data every 2 seconds
2. **Backend Ingestion** → Stores data in MongoDB sensor collection
3. **Health Calculation** → Analyzes data using industry-standard algorithms
4. **Prediction Engine** → ML model generates failure predictions
5. **Alert Scheduler** → Automatically creates alerts every 5 minutes
6. **AI Chat** → RAG system provides contextual responses
7. **Frontend Display** → Real-time updates via REST API

## 📦 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/predictive-maintenance.git
cd "c:\Users\HP\Documents\jain uni"

# Create virtual environment
python -m venv autoflow
autoflow\Scripts\activate  # Windows
# source autoflow/bin/activate  # Linux/Mac

# Install dependencies
cd backend
pip install -r requirements.txt

# Create .env file
echo MONGO_URL=your_mongodb_atlas_connection_string > .env
echo OPENROUTER_API_KEY=your_openrouter_api_key >> .env
echo JWT_SECRET=your_secret_key >> .env

# Start backend server
python main.py
```

### Frontend Setup

```bash
# Navigate to frontend
cd "../frontend"

# Install dependencies
npm install

# Create .env.local file
echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 > .env.local

# Start development server
npm run dev
```

### Simulator Setup

```bash
# In a new terminal, start the simulator
cd backend
python simulator.py
```

### Alert Scheduler Setup

```bash
# In another terminal, start the alert scheduler
cd backend
python alert_scheduler.py
```

## 🚀 Usage

### Starting the System

1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   python main.py
   ```

2. **Start Simulator** (Terminal 2):
   ```bash
   cd backend
   python simulator.py
   ```

3. **Start Alert Scheduler** (Terminal 3):
   ```bash
   cd backend
   python alert_scheduler.py
   ```

4. **Start Frontend** (Terminal 4):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open Browser**:
   - Navigate to `http://localhost:3000`
   - Login with: `test@test.com` / `test123`

### Accessing Features

- **Dashboard**: `http://localhost:3000/dashboard`
- **Live Monitoring**: `http://localhost:3000/dashboard/live`
- **Health Monitor**: `http://localhost:3000/dashboard/health`
- **Alerts**: `http://localhost:3000/dashboard/alerts`
- **Predictions**: `http://localhost:3000/dashboard/predictions`
- **Trends**: `http://localhost:3000/dashboard/trends`
- **Machines**: Access via Profile Menu → Machines

## 📚 API Documentation

### Authentication

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { "access_token": "jwt_token" }
```

### Health Monitoring

```http
# Get fleet health
GET /api/health

# Get specific machine health
GET /api/health/{machine_id}
```

### Predictions

```http
POST /api/predict
Content-Type: application/json

{
  "air_temp": 300.5,
  "process_temp": 310.2,
  "rpm": 1500,
  "torque": 45.0,
  "tool_wear": 120,
  "machine_id": "PUMP_01"
}
```

### Alerts

```http
# Get all alerts
GET /api/alerts?acknowledged=false

# Acknowledge alert
POST /api/alerts/{alert_id}/ack

# Check all machines
POST /api/alerts/check
```

### AI Chat

```http
POST /api/chat
Content-Type: application/json

{
  "message": "What is the status of PUMP_01?",
  "machine_id": "PUMP_01"
}
```

### Reports

```http
# Download fleet report
GET /api/report/download?format=pdf
# formats: txt, json, pdf
```

## 🤖 Machine Learning Model

### Model Details

- **Algorithm**: Random Forest Classifier
- **Features**: 5 sensor inputs
  - Air Temperature [K]
  - Process Temperature [K]
  - Rotational Speed [RPM]
  - Torque [Nm]
  - Tool Wear [min]
- **Output**: Binary classification (Failure/No Failure)
- **Probability**: Confidence score (0-1)
- **Trained On**: Industrial equipment dataset
- **Accuracy**: ~88% on test set

### Prediction Logic

```python
if probability < 0.3:
    status = "HEALTHY"
    time_to_failure = 48-168 hours
elif probability < 0.5:
    status = "AT RISK"
    time_to_failure = 24-48 hours
else:
    status = "FAILURE LIKELY"
    time_to_failure = 6-24 hours
```

## 📸 Screenshots

### Dashboard
![Dashboard Overview](screenshots/dashboard.png)

### Health Monitor
![Health Monitor](screenshots/health.png)

### AI Chat
![AI Chat Interface](screenshots/chat.png)

### Alerts
![Alert Management](screenshots/alerts.png)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- **Backend**: Follow PEP 8 Python style guide
- **Frontend**: Use ESLint and Prettier
- **Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- FastAPI documentation and community
- Next.js team for the amazing framework
- MongoDB Atlas for reliable cloud database
- OpenRouter for AI model access
- All contributors and supporters

## 📞 Contact

- **Email**: your.email@example.com
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- **Project Link**: [https://github.com/yourusername/predictive-maintenance](https://github.com/yourusername/predictive-maintenance)

---

**⭐ Star this repo if you found it helpful!**

Made with ❤️ for industrial IoT and predictive maintenance
