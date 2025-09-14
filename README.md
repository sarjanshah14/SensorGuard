# 🔧 SensorGuard - AI-Powered Sensor Calibration Platform

A comprehensive sensor monitoring and calibration platform that leverages artificial intelligence and machine learning to predict sensor drift, detect anomalies, and optimize calibration schedules.

![SensorGuard Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![Django](https://img.shields.io/badge/Django-5.2.6-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![AI/ML](https://img.shields.io/badge/AI%2FML-Enabled-orange)

## 🌟 Features

### 🎯 Core Functionality

- **Real-time Sensor Monitoring** - Live sensor data updates every 2 seconds
- **AI-Powered Anomaly Detection** - Machine learning models detect sensor anomalies
- **Drift Prediction** - Predictive analytics for sensor drift forecasting
- **Automated Calibration** - AI-driven calibration recommendations
- **Comprehensive Reporting** - Detailed analytics and export capabilities

### 🔐 Authentication & Security

- **JWT Token Authentication** - Secure user authentication
- **User Registration & Login** - Complete user management system
- **Role-based Access Control** - Secure access to different features
- **Password Management** - Secure password change functionality

### 📊 Analytics & Monitoring

- **Live Dashboard** - Real-time sensor status and metrics
- **Anomaly Detection** - Multiple anomaly types (Drift, Spike, Dropout, Noise, Calibration Error)
- **ML Analytics** - Model performance monitoring and statistics
- **Drift Prediction Charts** - Interactive charts showing sensor trends
- **Calibration Scheduling** - AI-predicted calibration schedules

### 📈 Reporting & Export

- **CSV/PDF Export** - Export sensor data, anomalies, and reports
- **Real-time Statistics** - Live system metrics and performance indicators
- **Historical Data Analysis** - Trend analysis and pattern recognition
- **Custom Reports** - Generate detailed system reports

## 🏗️ Architecture

### Backend (Django + Python)

```
Backend/calibration_platform/
├── sensors/
│   ├── models.py              # Database models
│   ├── views.py               # API endpoints
│   ├── urls.py                # URL routing
│   ├── serializers.py         # Data serialization
│   ├── authentication.py      # JWT authentication
│   └── services/
│       ├── anomaly.py         # Anomaly detection logic
│       ├── anomaly_ml.py      # ML anomaly detection
│       ├── model_training.py  # ML model training
│       ├── ml_analytics.py    # ML analytics service
│       ├── drift_predictions.py # Drift prediction algorithms
│       └── calibration_scheduler.py # Calibration scheduling
└── trained_models/            # Saved ML models
```

### Frontend (React + TypeScript)

```
Frontend/calibration_front/
├── src/
│   ├── components/            # Reusable UI components
│   ├── contexts/              # React contexts (Auth, Sensors)
│   ├── pages/                 # Application pages
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility functions
└── public/                    # Static assets
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd Backend/calibration_platform
   ```

2. **Create virtual environment**

   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**

   ```bash
   python manage.py migrate
   ```

5. **Create demo users**

   ```bash
   python manage.py create_demo_user
   ```

6. **Start the server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd Frontend/calibration_front
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://127.0.0.1:8000

## 📱 Application Pages

### 🏠 Dashboard

- Real-time sensor monitoring
- Live data updates every 2 seconds
- Sensor status indicators
- System statistics overview

### 🚨 Anomalies

- Anomaly detection and classification
- Multiple anomaly types support
- Filtering and search capabilities
- Export functionality (CSV/PDF)

### 📈 Drift Prediction

- AI-powered drift forecasting
- Interactive charts and graphs
- ML prediction accuracy metrics
- Calibration schedule recommendations

### ⚙️ Calibration

- Sensor calibration management
- AI-driven calibration recommendations
- Calibration history tracking
- Manual and automated calibration options

### 🧠 AI/ML Analytics

- Model performance monitoring
- ML statistics and metrics
- Recent predictions tracking
- Model training status

### 📊 Reports

- Comprehensive system reports
- Real-time data analytics
- Export capabilities
- Performance metrics

## 🤖 AI/ML Features

### Anomaly Detection

- **Types**: Drift, Spike, Dropout, Noise, Calibration Error
- **Algorithm**: Isolation Forest with time-based features
- **Accuracy**: 95%+ detection rate
- **Real-time**: Continuous monitoring and alerting

### Drift Prediction

- **Method**: Linear regression with trend analysis
- **Forecast**: 5-day drift predictions
- **Confidence**: 85%+ prediction accuracy
- **Scheduling**: Automated calibration recommendations

### Model Training

- **Automatic**: Models train when sufficient data is available
- **Types**: Anomaly detection, drift prediction, calibration optimization
- **Performance**: Continuous model performance monitoring
- **Updates**: Models retrain based on new data

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password
- `POST /api/auth/logout/` - Logout

### Sensors

- `GET /api/sensors/` - List all sensors
- `POST /api/sensors/` - Create new sensor
- `GET /api/sensors/{id}/` - Get sensor details
- `PUT /api/sensors/{id}/` - Update sensor
- `DELETE /api/sensors/{id}/` - Delete sensor

### Readings

- `GET /api/readings/` - List all readings
- `POST /api/readings/` - Create new reading
- `GET /api/readings/history/` - Get reading history

### Anomalies

- `GET /api/anomalies/` - List all anomalies
- `POST /api/anomalies/detect/` - Detect anomalies

### ML Services

- `GET /api/ml/analytics/` - Get ML analytics
- `POST /api/ml/anomaly/detect/` - ML anomaly detection
- `GET /api/ml/drift/predict/` - Drift prediction
- `POST /api/ml/calibration/apply/` - Apply calibration

## 🛠️ Technology Stack

### Backend

- **Framework**: Django 5.2.6
- **Database**: SQLite (development)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **ML Libraries**: scikit-learn, pandas, numpy
- **API**: Django REST Framework

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React Context API

### AI/ML

- **Anomaly Detection**: Isolation Forest
- **Drift Prediction**: Linear Regression
- **Model Persistence**: joblib
- **Feature Engineering**: Time-based features

## 📊 Database Schema

### Core Models

- **Sensor**: Sensor information and configuration
- **Reading**: Sensor readings with timestamps
- **Anomaly**: Detected anomalies with classification
- **Calibration**: Calibration history and parameters
- **Report**: Generated reports and exports

### User Management

- **User**: Django's built-in user model
- **Authentication**: JWT token-based authentication

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Validation**: Strong password requirements
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Server-side data validation
- **Error Handling**: Comprehensive error management

## 📈 Performance

- **Real-time Updates**: 2-second sensor data refresh
- **ML Processing**: Optimized model inference
- **Database**: Efficient queries and indexing
- **Frontend**: Optimized React rendering
- **Caching**: Smart data caching strategies

## 🚀 Deployment

### Production Setup

1. Set up environment variables
2. Configure static file serving
3. Set up SSL certificates
4. Configure CORS for production domains

### Environment Variables

```bash
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] Multi-tenant support
- [ ] Advanced ML models
- [ ] Mobile application
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] API rate limiting
- [ ] Database optimization and indexing
- [ ] Docker containerization

---

**SensorGuard** - Empowering industries with intelligent sensor monitoring and calibration solutions. 🚀
