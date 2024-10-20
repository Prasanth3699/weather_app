# Weather Monitoring System

## Overview

This project is a weather monitoring system that allows users to get real-time and forecasted weather data for different cities. The backend is built using Django 5+ and Django REST Framework, while the frontend (React-based) consumes the RESTful API endpoints. The system includes features such as user registration, weather alerts, user preferences, and city weather data aggregation.

The project also uses Celery for background tasks like fetching weather data, aggregating daily summaries, and managing alerts. Data is fetched from the OpenWeatherMap API and stored in the application's database for further use.

## Features

- User registration and authentication (JWT-based).
- Add and manage cities to monitor weather data.
- Real-time weather data fetching for cities.
- Daily weather data summaries with aggregated statistics.
- Weather forecast data for cities.
- User-defined thresholds for weather alerts and notifications.
- Scheduled tasks for periodic weather data fetching and data cleanup.

## Tech Stack

- **Backend**: Django 5+, Django REST Framework, Celery, SQLite
- **Frontend**: React, Vite, TailwindCSS
- **Task Queue**: Celery with Redis as the broker
- **External APIs**: OpenWeatherMap API
- **Authentication**: JWT (JSON Web Token)# Weather Monitoring System

## Prerequisites

- Python 3.8+
- Redis (for Celery broker)
- Docker (optional, for running in a containerized environment)
- Django 5+
- Django REST Framework
- Celery
- Node.js and npm (for frontend)

## Installation

### Backend Setup

#### 1. Clone the Repository

```bash
$ git clone https://github.com/yourusername/weather-monitoring.git
$ cd weather-monitoring
```

#### 2. Set Up a Virtual Environment

```bash
$ python -m venv venv
$ source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

#### 3. Install Dependencies

```bash
$ pip install -r requirements.txt
```

#### 4. Set Up Environment Variables

Create a `.env` file in the root directory of your project and add the following environment variables:

```env
SECRET_KEY=your_secret_key_here
DEBUG=True
OPENWEATHER_API_KEY=your_openweathermap_api_key_here
REDIS_URL=redis://localhost:6379/0
ACCESS_TOKEN_LIFETIME_MINUTES=60
REFRESH_TOKEN_LIFETIME_DAYS=1
```

#### 5. Apply Database Migrations

```bash
$ python manage.py migrate
```

#### 6. Create a Superuser

To access the Django admin panel:

```bash
$ python manage.py createsuperuser
```

#### 7. Start the Development Server

```bash
$ python manage.py runserver
```

The server will be running on `http://127.0.0.1:8000/`.

### Running Celery

To start the Celery worker and beat scheduler:

#### 1. Start Celery Worker

```bash
$ celery -A weather_monitoring worker --pool=solo --loglevel=info
```

#### 2. Start Celery Beat Scheduler

```bash
$ celery -A weather_monitoring beat --loglevel=info
```

#### Running Celery with Docker

Alternatively, you can use Docker to run Celery services. Create a `Dockerfile` in your backend directory with the following content, which includes a Redis image setup for task queuing:

```dockerfile
# Dockerfile
FROM python:3.8

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

CMD ["celery", "-A", "weather_monitoring", "worker", "--loglevel=info"]
```

Then build and run the Docker container:

```bash
$ docker build -t weather_monitoring_celery .
$ docker run -d --name celery_worker weather_monitoring_celery
```

To run Redis using Docker, you can use the following command:

```bash
$ docker run -d --name redis -p 6379:6379 redis
```

### Frontend Setup

#### 1. Navigate to the Frontend Directory

Assuming the frontend code is located in a `frontend` folder inside the main repository:

```bash
$ cd weather-frontend
```

#### 2. Install Dependencies

```bash
$ npm install
```

#### 3. Set Up Environment Variables

Create a `.env` file in the `frontend` directory and add the following variables:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

#### 4. Start the Development Server

```bash
$ npm run dev
```

The frontend will be running on `http://127.0.0.1:5173/`.

## API Endpoints

### Authentication

- **POST** `/api/register/` - Register a new user.
- **POST** `/api/token/` - Obtain JWT token.
- **POST** `/api/token/refresh/` - Refresh JWT token.

### City Endpoints

- **GET** `/api/cities/` - List all cities.
- **GET** `/api/cities/{id}/` - Get details of a specific city.

### Weather Data Endpoints

- **GET** `/api/weather-data/` - List all weather data with pagination.
- **GET** `/api/weather-data/latest/` - Get the latest weather data for a specific city.
- **GET** `/api/weather-data/{id}/` - Get specific weather data by ID.
- **GET** `/api/weather-data/latest/all/` - Get the latest weather data for all cities.

### Forecast Data Endpoints

- **GET** `/api/forecast/` - List all forecast data from today onwards with optional filtering by city.

### User Preferences

- **GET/PUT** `/api/preferences/` - Retrieve or update user preferences (e.g., temperature unit).

### Thresholds

- **GET/POST** `/api/thresholds/` - List or create thresholds for weather alerts.
- **GET/PUT/DELETE** `/api/thresholds/{id}/` - Retrieve, update, or delete a specific threshold.

### Alerts

- **GET** `/api/alerts/` - List all alerts for the authenticated user.
- **GET** `/api/alerts/{id}/` - Retrieve a specific alert by ID.

## Scheduled Tasks

This application uses Celery to manage scheduled tasks. Below are the tasks that run periodically:

- **Fetch Weather Data**: Every 15 minutes, current weather data for all cities is fetched.
- **Aggregate Daily Summary**: At midnight every day, a summary of daily weather data is aggregated.
- **Fetch Forecast Data**: Every 3 hours, forecast data for cities is fetched.
- **Cleanup Old Weather Data**: Deletes weather data older than 30 days every day at 1 AM.
- **Deactivate Old Alerts**: Deactivates alerts that have been active for more than 24 hours every hour.

## Usage

- Register a new user via `/api/register/` or the Django admin panel.
- Add cities to monitor weather data.
- Set thresholds to receive weather alerts based on temperature or conditions.
- Access city weather data, forecast data, and user preferences via the provided API endpoints.
