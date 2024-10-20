import axios from "axios";

// Base URL for your backend API, using environment variables for flexibility
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1/";

// Create an Axios instance with the base URL
const api = axios.create({
  baseURL: API_URL,
});

/**
 * Request Interceptor
 * - Attaches the JWT token from localStorage to every request (if available).
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error) // Handle request errors
);

/**
 * Response Interceptor
 * - Handles token refresh if the access token expires.
 * - If refresh succeeds, retries the original request.
 * - If refresh fails, logs the user out by clearing tokens and redirecting to login.
 */
api.interceptors.response.use(
  (response) => response, // Return the response if successful
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 && // If unauthorized
      !originalRequest._retry && // Ensure it hasn’t been retried yet
      localStorage.getItem("refresh_token") // Check for refresh token
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token
        const res = await api.post("token/refresh/", {
          refresh: localStorage.getItem("refresh_token"),
        });

        const { access } = res.data;
        localStorage.setItem("access_token", access);
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        originalRequest.headers["Authorization"] = `Bearer ${access}`;

        return api(originalRequest); // Retry the original request with new token
      } catch (err) {
        // If refresh token is invalid or expired, log the user out
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(err); // Reject the error
      }
    }

    return Promise.reject(error); // Pass any other errors
  }
);

/// --- Authentication Endpoints --- ///

/**
 * Register a new user.
 * @param {Object} userData - User registration details.
 */
export const register = (userData) => api.post("register/", userData);

/**
 * Login a user with username and password.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 */
export const login = (username, password) =>
  api.post("token/", { username, password }); // JWT login endpoint

/// --- City Endpoints --- ///

/**
 * Fetch the list of all available cities.
 */
export const fetchCities = () => api.get("cities/");
// Add a new city
export const addCity = (cityData) => api.post("city/add/", cityData);

//  Delete City Endpoint
export const deleteCity = (cityId) => api.delete(`city/delete/${cityId}/`);

/// --- Weather Data Endpoints --- ///

/**
 * Fetch the latest weather data for all cities.
 */
export const fetchLatestWeatherAllCities = () =>
  api.get("weather-data/latest/all/");

/**
 * Fetch weather data with optional query parameters (e.g., by city).
 * @param {Object} params - Query parameters for filtering data.
 */
export const fetchWeatherData = (params) =>
  api.get("weather-data/", { params });

/**
 * Fetch the latest weather data for a specific city.
 * @param {number} cityId - ID of the city to fetch data for.
 */
export const fetchLatestWeatherDataByCity = (cityId) =>
  api.get("weather-data/latest/", { params: { city: cityId } });

/// --- Daily Summaries Endpoints --- ///

/**
 * Fetch all daily summaries.
 */
export const fetchDailySummaries = () => api.get("daily-summaries/");

/**
 * Fetch daily summaries for a specific city.
 * @param {number} cityId - ID of the city to fetch summaries for.
 */
export const fetchDailySummariesByCity = (cityId) =>
  api.get("daily-summaries/", { params: { city: cityId } });

/// --- Forecast Endpoints --- ///

/**
 * Fetch the forecast data for all cities.
 */
export const fetchForecastData = () => api.get("forecast/");

/**
 * Fetch forecast data for a specific city.
 * @param {number} cityId - ID of the city to fetch forecast for.
 */
export const fetchForecastDataByCity = (cityId) =>
  api.get("forecast/", { params: { city: cityId } });

/// --- Alerts Endpoints --- ///

/**
 * Fetch all alerts.
 */
export const fetchAlerts = () => api.get("alerts/");

/**
 * Fetch alerts for a specific city.
 * @param {number} cityId - ID of the city to fetch alerts for.
 */
export const fetchAlertsByCity = (cityId) =>
  api.get("alerts/", { params: { city: cityId } });

/// --- Thresholds Endpoints --- ///

/**
 * Fetch all threshold settings.
 */
export const fetchThresholds = () => api.get("thresholds/");

/**
 * Create a new threshold.
 * @param {Object} data - Threshold data to create.
 */
export const createThreshold = (data) => api.post("thresholds/", data);

/**
 * Update an existing threshold by ID.
 * @param {number} id - ID of the threshold to update.
 * @param {Object} data - Updated threshold data.
 */
export const updateThreshold = (id, data) => api.put(`thresholds/${id}/`, data);

/**
 * Delete a threshold by ID.
 * @param {number} id - ID of the threshold to delete.
 */
export const deleteThreshold = (id) => api.delete(`thresholds/${id}/`);

/// --- User Preferences Endpoints --- ///

/**
 * Fetch the current user's preferences.
 */
export const fetchUserPreferences = () => api.get("preferences/");

/**
 * Update the user's preferences.
 * @param {Object} data - Updated preferences data.
 */
export const updateUserPreferences = (data) => api.put("preferences/", data);
