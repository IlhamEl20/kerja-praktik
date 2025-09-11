import React, { useEffect, useState } from "react";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const weatherIcons = {
  0: "☀️", // Cerah
  1: "🌤️",
  2: "🌤️",
  3: "⛅", // Berawan sebagian
  45: "🌫️",
  48: "🌫️", // Kabut
  51: "🌦️",
  53: "🌦️",
  55: "🌧️", // Gerimis
  61: "🌧️",
  63: "🌧️",
  65: "🌧️", // Hujan
  71: "❄️",
  73: "❄️",
  75: "❄️", // Salju
  95: "⛈️",
  96: "⛈️",
  99: "⛈️", // Badai petir
};

export default function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const [weatherRes, geoRes] = await Promise.all([
            axios.get("/api/weather", {
              params: { latitude: lat, longitude: lon },
            }),
            axios.get("https://nominatim.openstreetmap.org/reverse", {
              params: { lat, lon, format: "json" },
            }),
          ]);

          const data = weatherRes.data;
          setWeather(data.current_weather);
          setForecast(
            data.daily.time.map((date, i) => ({
              date,
              min: data.daily.temperature_2m_min[i],
              max: data.daily.temperature_2m_max[i],
              code: data.daily.weathercode[i],
            }))
          );

          const city =
            geoRes.data.address.city ||
            geoRes.data.address.town ||
            geoRes.data.address.village ||
            "-";
          const country = geoRes.data.address.country || "-";
          setLocation(`${city}, ${country}`);
        } catch (err) {
          console.error("Error fetching weather/location:", err);
        }
      });
    }
  }, []);

  if (!weather)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Memuat cuaca...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-600 text-white p-6 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg p-6"
      >
        <h1 className="text-2xl font-bold text-center mb-2">Prakiraan Cuaca</h1>
        {location && <p className="text-center text-sm mb-4">📍 {location}</p>}

        {/* Cuaca Saat Ini */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-6"
        >
          <span className="text-6xl mb-2">
            {weatherIcons[weather.weathercode] || "☁️"}
          </span>
          <p className="text-4xl font-semibold">{weather.temperature}°C</p>
          <p className="text-sm opacity-80">Angin {weather.windspeed} km/jam</p>
        </motion.div>

        {/* Prakiraan */}
        <h2 className="text-lg font-semibold mb-3">Prakiraan 5 Hari</h2>
        <div className="grid grid-cols-1 gap-3">
          {forecast.slice(0, 5).map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex justify-between items-center bg-white/10 rounded-xl px-4 py-2"
            >
              <span className="text-sm">
                {new Date(day.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
              <span className="text-2xl">{weatherIcons[day.code] || "☁️"}</span>
              <span className="text-sm font-medium">
                {day.min}°C / {day.max}°C
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
