import { useEffect, useState, useContext } from "react";
import {
  fetchThresholds,
  fetchCities,
  createThreshold,
  updateThreshold,
  deleteThreshold,
} from "../../api/api";
import { UserPreferencesContext } from "../contexts/UserPreferencesContext";
import { FaEdit, FaTrash } from "react-icons/fa"; // Import React Icons
import { motion } from "framer-motion"; // Import Framer Motion

function Thresholds() {
  const { temp_unit } = useContext(UserPreferencesContext);
  const [thresholds, setThresholds] = useState([]);
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    id: null,
    city: "",
    temp_threshold: "",
    condition_threshold: "",
    consecutive_updates: 2,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const getThresholdsAndCities = async () => {
      try {
        const [thresholdsResponse, citiesResponse] = await Promise.all([
          fetchThresholds(),
          fetchCities(),
        ]);
        setThresholds(thresholdsResponse.data);
        setCities(citiesResponse.data);
      } catch (err) {
        setError("Failed to fetch thresholds or cities.");
      }
    };
    getThresholdsAndCities();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.city) errors.city = "City is required.";
    if (form.temp_threshold === "") {
      errors.temp_threshold = "Temperature threshold is required.";
    } else if (isNaN(form.temp_threshold)) {
      errors.temp_threshold = "Temperature must be a number.";
    }
    if (form.consecutive_updates < 1) {
      errors.consecutive_updates = "Must be at least 1.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload = {
      city_id: form.city,
      temp_threshold: parseFloat(form.temp_threshold),
      condition_threshold: form.condition_threshold || null,
      consecutive_updates: parseInt(form.consecutive_updates, 10) || 2,
    };
    try {
      if (form.id) {
        const response = await updateThreshold(form.id, payload);
        setThresholds(
          thresholds.map((t) => (t.id === form.id ? response.data : t))
        );
        setSuccess("Threshold updated successfully.");
      } else {
        const response = await createThreshold(payload);
        setThresholds([...thresholds, response.data]);
        setSuccess("Threshold added successfully.");
      }
      resetForm();
    } catch {
      setError("Failed to save threshold.");
    }
  };

  const handleEdit = (threshold) => {
    setForm({
      id: threshold.id,
      city: threshold.city.id,
      temp_threshold: threshold.temp_threshold || "",
      condition_threshold: threshold.condition_threshold || "",
      consecutive_updates: threshold.consecutive_updates,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this threshold?"))
      return;
    try {
      await deleteThreshold(id);
      setThresholds(thresholds.filter((t) => t.id !== id));
      setSuccess("Threshold deleted successfully.");
    } catch {
      setError("Failed to delete threshold.");
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      city: "",
      temp_threshold: "",
      condition_threshold: "",
      consecutive_updates: 2,
    });
    setFieldErrors({});
  };

  return (
    <motion.div
      className="p-8 max-w-5xl mx-auto space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        Configure Alerts
      </h2>

      {error && <div className="text-red-500 text-center">{error}</div>}
      {success && <div className="text-green-500 text-center">{success}</div>}

      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-80 p-6 rounded-lg shadow-lg backdrop-filter backdrop-blur-md space-y-6"
      >
        <div>
          <label className="block mb-2 font-medium">
            City <span className="text-red-500">*</span>
          </label>
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          >
            <option value="" disabled>
              Select a city
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Temperature Threshold (°{temp_unit}){" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="temp_threshold"
            value={form.temp_threshold}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder={`e.g., ${temp_unit === "Fahrenheit" ? "95" : "35"}`}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Condition Threshold</label>
          <input
            type="text"
            name="condition_threshold"
            value={form.condition_threshold}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="e.g., Rain, Snow"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Consecutive Updates <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="consecutive_updates"
            value={form.consecutive_updates}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            min="1"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {form.id ? "Update Threshold" : "Add Threshold"}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-gray-800 text-center">
          Existing Thresholds
        </h3>
        {thresholds.length === 0 ? (
          <div className="text-center text-gray-500">
            No thresholds configured.
          </div>
        ) : (
          <ul className="space-y-4">
            {thresholds.map((threshold) => (
              <li
                key={threshold.id}
                className="flex justify-between items-center bg-white bg-opacity-80 p-4 rounded-lg shadow-lg"
              >
                <div>
                  <p className="font-semibold">{threshold.city.name}</p>
                  <p className="text-sm text-gray-500">
                    Temp: {threshold.temp_threshold}° | Condition:{" "}
                    {threshold.condition_threshold} | Updates:{" "}
                    {threshold.consecutive_updates}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(threshold)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(threshold.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

export default Thresholds;
