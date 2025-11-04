import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  //   withCredentials: true, // kalau nanti butuh cookie/session
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
});

// (Opsional) Logging request & response
AxiosInstance.interceptors.request.use((config) => {
  console.log("➡️ [API Request]", config.method?.toUpperCase(), config.url);
  return config;
});

AxiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ [API Error]", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default AxiosInstance;
