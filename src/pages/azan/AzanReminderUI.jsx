import React, { useEffect, useState } from "react";
import { Card, Button, message } from "antd";
import { CloudDownloadOutlined, BellOutlined } from "@ant-design/icons";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import axios from "axios";

const prayerMap = {
  Fajr: "Subuh",
  Sunrise: "Terbit",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};
const quotes = [
  "“Sesungguhnya salat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.” — (QS. An-Nisa: 103)",
  "“Perjanjian antara kami dan mereka adalah salat; siapa yang meninggalkannya maka ia telah kafir.” — (HR. Tirmidzi)",
  "“Salatlah kamu sebelum disalatkan.” — (HR. Ibnu Majah)",
  "“Salat adalah tiang agama; siapa yang mendirikannya maka ia menegakkan agama.” — (HR. Baihaqi)",
  "“Yang pertama kali akan dihisab dari amal manusia pada hari kiamat adalah salatnya.” — (HR. Abu Dawud)",
];
function normalizeTime(t) {
  if (!t) return "";
  const m = t.match(/(\d{1,2}:\d{2})/);
  return m ? m[1] : t;
}

export default function AzanReminderUI() {
  const [lat, setLat] = useState(-6.2088);
  const [lon, setLon] = useState(106.8456);
  const [city, setCity] = useState("Jakarta");
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [isNight, setIsNight] = useState(false);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [randomQuote, setRandomQuote] = useState("");

  async function fetchCityName(latitude, longitude) {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      if (res.data && res.data.address) {
        return (
          res.data.address.city ||
          res.data.address.town ||
          res.data.address.village ||
          res.data.address.county ||
          "Kota Anda"
        );
      }
      return "Kota Anda";
    } catch (err) {
      console.error("Gagal ambil nama kota:", err);
      return "Kota Anda";
    }
  }

  async function fetchTimings(latVal = lat, lonVal = lon) {
    try {
      setLoading(true);
      const url = `https://api.aladhan.com/v1/timings?latitude=${latVal}&longitude=${lonVal}&method=20`;
      const res = await axios.get(url);

      if (res.data?.data?.timings) {
        setTimings(res.data.data.timings);
        setDate(res.data.data.date.readable);
        const cityName = await fetchCityName(latVal, lonVal);
        setCity(cityName);
      } else {
        message.error("Gagal mengambil jadwal salat.");
      }
    } catch (e) {
      console.error(e);
      message.error("Terjadi kesalahan saat memanggil API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLon(longitude);
          message.success("Lokasi otomatis berhasil diambil!");
          await fetchTimings(latitude, longitude);
        },
        (err) => {
          console.warn("Tidak dapat mengambil lokasi:", err.message);
          message.warning("Gagal ambil lokasi, gunakan default (Jakarta)");
          fetchTimings();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      message.error("Browser tidak mendukung geolocation");
      fetchTimings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tentukan mode siang/malam
  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 5);
  }, []);

  // Deteksi waktu salat berikutnya
  useEffect(() => {
    if (!timings) return;

    const now = new Date();
    let upcoming = null;
    let minDiff = Infinity;

    Object.entries(timings).forEach(([key, time]) => {
      const [h, m] = normalizeTime(time).split(":").map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(h, m, 0, 0);

      const diff = prayerTime - now;
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        upcoming = { key, diff };
      }
    });

    setNextPrayer(upcoming);
  }, [timings]);

  useEffect(() => {
    const index = Math.floor(Math.random() * quotes.length);
    setRandomQuote(quotes[index]);
  }, []);

  function isWithin30Minutes(key) {
    if (!nextPrayer || nextPrayer.key !== key) return false;
    const diffMin = nextPrayer.diff / 1000 / 60;
    return diffMin <= 30;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-700 flex justify-center items-start p-4 sm:p-8 ${
        isNight
          ? "bg-gradient-to-b from-slate-800 via-slate-900 to-black text-white"
          : "bg-gradient-to-b from-blue-50 to-white text-slate-800"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <Card
          className={`shadow-lg rounded-2xl p-6 sm:p-8 backdrop-blur-md border-none ${
            isNight ? "bg-slate-800/80" : "bg-white/90"
          }`}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold">
                Jadwal Sholat
              </h1>
              <p className="text-sm opacity-70">
                {city} — {date || "Mengambil data..."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                {isNight ? (
                  <motion.div
                    key="moon"
                    initial={{ opacity: 0, rotate: -90, y: -10 }}
                    animate={{ opacity: 1, rotate: 0, y: 0 }}
                    exit={{ opacity: 0, rotate: 90, y: 10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Moon className="text-yellow-400 w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ opacity: 0, rotate: 90, y: -10 }}
                    animate={{ opacity: 1, rotate: 0, y: 0 }}
                    exit={{ opacity: 0, rotate: -90, y: 10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Sun className="text-yellow-500 w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                icon={<CloudDownloadOutlined />}
                onClick={() => fetchTimings()}
                loading={loading}
                type="primary"
                className="rounded-full"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Jadwal Salat */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.keys(prayerMap).map((key) => {
              const isUpcoming = isWithin30Minutes(key);
              return (
                <motion.div
                  key={key}
                  animate={{
                    scale: isUpcoming ? [1, 1.05, 1] : 1,
                    boxShadow: isUpcoming
                      ? "0 0 20px rgba(59,130,246,0.7)"
                      : "none",
                  }}
                  transition={{
                    repeat: isUpcoming ? Infinity : 0,
                    repeatType: "mirror",
                    duration: 1.5,
                  }}
                  className={`p-4 rounded-xl border shadow-sm relative overflow-hidden ${
                    isNight
                      ? "bg-slate-700/50 border-slate-600"
                      : "bg-gradient-to-br from-white to-blue-50 border-blue-100"
                  }`}
                >
                  <div
                    className={`text-sm ${
                      isNight ? "text-gray-300" : "text-slate-500"
                    }`}
                  >
                    {prayerMap[key]}
                  </div>
                  <div
                    className={`text-xl font-bold mt-1 ${
                      isNight ? "text-yellow-300" : "text-blue-600"
                    }`}
                  >
                    {timings ? normalizeTime(timings[key]) : "—"}
                  </div>

                  {isUpcoming && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full shadow-sm"
                    >
                      <BellOutlined />
                      <span>30 menit lagi menuju {prayerMap[key]}</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <footer
            className={`mt-8 text-center text-sm ${
              isNight ? "text-gray-400" : "text-slate-500"
            }`}
          >
            {randomQuote}
          </footer>
        </Card>
      </motion.div>
    </div>
  );
}
