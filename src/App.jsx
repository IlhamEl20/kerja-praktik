import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/dashboard";
import TodoApp from "./pages/todolist";
import WeatherApp from "./pages/LandingPage";
import Photobooth from "./components/camera";

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WeatherApp />} />
      <Route path="/Photobooth" element={<Photobooth />} />
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
    </Routes>
  );
}
