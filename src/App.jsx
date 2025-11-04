import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
// import formbricks from "@formbricks/js";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/dashboard";
import TodoApp from "./pages/todolist";
import WeatherApp from "./pages/LandingPage";
import Photobooth from "./components/camera";
import FormbricksInitializer from "./pages/formbrick";
import EmbedFormbrick from "./pages/embed-formbrick";
import PdfToolkit from "./pages/ilovepdf";
import PdfMerge from "./pages/PdfMerge";
import Home from "./pages/HomePage";
import AzanReminderUI from "./pages/azan/AzanReminderUI";
import HomePasskey from "./pages/passkey/home";

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" />;
}
// const environmentId = import.meta.env.VITE_FORMBRICKS_ENVIRONMENT_ID;
// const apiHost = import.meta.env.VITE_FORMBRICKS_API_HOST;
// if (typeof window !== "undefined") {
//   formbricks.setup({
//     environmentId: environmentId,
//     appUrl: apiHost,
//   });
// }
export default function App() {
  // useEffect(() => {
  //   async function initFormbricks() {
  //     try {
  //       await formbricks.setup({
  //         environmentId: "cmgtl4n7k000ar701ugmi28ps",
  //         appUrl: "https://formbricks.ilhamboy.site?formbricksDebug=true",
  //       });

  //       console.log("✅ Formbricks initialized successfully");
  //     } catch (error) {
  //       console.error("❌ Failed to initialize Formbricks:", error);
  //     }
  //   }

  //   initFormbricks();
  // }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/weather" element={<WeatherApp />} />
      <Route path="/photobooth" element={<Photobooth />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/todos" element={<TodoApp />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
      <Route path="/formbrick" element={<FormbricksInitializer />} />
      <Route path="/embed-formbrick" element={<EmbedFormbrick />} />
      <Route path="/ilove-pdf" element={<PdfToolkit />} />
      <Route path="/pdf" element={<PdfMerge />} />
      <Route path="/azan-reminder" element={<AzanReminderUI />} />
      <Route path="/passkey" element={<HomePasskey />} />
    </Routes>
  );
}
