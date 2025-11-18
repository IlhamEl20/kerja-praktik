import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
// import formbricks from "@formbricks/js";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/dashboard";
import TodoApp from "./pages/todolist";
import Photobooth from "./components/camera";
import FormbricksInitializer from "./pages/formbrick";
import EmbedFormbrick from "./pages/embed-formbrick";
import Home from "./pages/HomePage";
import AzanReminderUI from "./pages/azan/AzanReminderUI";
import HomePasskey from "./pages/passkey/home";
import PdfToolsContainer from "./pages/pdf/PdfToolsContainer";
import WeatherApp from "./pages/WeatherPage";
import formbricks from "@formbricks/js";
import KotakSaran from "./pages/FormBrik";
import TwoFADemo from "./pages/2fa/2fa-google";

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" />;
}
const environmentId = import.meta.env.VITE_FORMBRICKS_ENVIRONMENT_ID;
const apiHost = import.meta.env.VITE_FORMBRICKS_API_HOST;
if (typeof window !== "undefined") {
  formbricks.setup({
    environmentId: environmentId,
    appUrl: apiHost,
  });
}
export default function App() {
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
      <Route path="/pdf" element={<PdfToolsContainer />} />
      <Route path="/azan-reminder" element={<AzanReminderUI />} />
      <Route path="/passkey" element={<HomePasskey />} />
      <Route path="/kotak-saran" element={<KotakSaran />} />
      <Route path="/2fa-google" element={<TwoFADemo />} />
    </Routes>
  );
}
