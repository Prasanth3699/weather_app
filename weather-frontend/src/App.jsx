import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard";
import Thresholds from "./components/Thresholds";
import Alerts from "./components/Alerts";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";
import { fetchAlerts } from "./api/api";
import { AnimatePresence } from "framer-motion";

function App() {
  const [alerts, setAlerts] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await fetchAlerts();
        const alertsArray = Array.isArray(response.data)
          ? response.data
          : response.data.alerts || [];
        setAlerts(alertsArray);
      } catch (error) {
        console.log(error);

        setAlerts([]);
      }
    };

    loadAlerts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Added pt-16 to offset the fixed Navbar */}
      <main className="flex-1 pt-16">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/thresholds"
                element={
                  <ProtectedRoute>
                    <Thresholds />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <Alerts alerts={alerts} />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default App;
