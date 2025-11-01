import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  // load .env file sesuai mode (development / production)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: "https://services-api.ilhamboy.site",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    define: {
      "process.env": {
        VITE_API_URL: "https://services-api.ilhamboy.site",
      },
    },
  };
});
