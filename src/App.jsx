import React from "react";
import "./index.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router } from 'react-router-dom';
import { PrivateRoute } from "./components/PrivateRoute";

// Layout & Components
import DashboardLayout from "./components/DashboardLayout";

// Pages
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SchedulePage from "./pages/SchedulePage";
import InterviewerDashboardPage from "./pages/InterviewerDashboardPage";
import CandidateDashboardPage from "./pages/CandidateDashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import InterviewPage from './pages/InterviewPage';

// ✅ Role-based Route Component
const RoleRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#fcc250]" />
      </div>
    );
  }

  return user && allowedRoles.includes(user.role) ? (
    children
  ) : (
    <Navigate to="/unauthorized" />
  );
};

// ✅ Authenticated User Redirect
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#fcc250]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "interviewer") {
    return <Navigate to="/interviewer/dashboard" replace />;
  }

  if (user.role === "candidate") {
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ✅ Protected Routes */}
          <Route
            path="/schedule"
            element={
              <RoleRoute allowedRoles={["interviewer", "candidate"]}>
                <SchedulePage />
              </RoleRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={["interviewer", "candidate"]}>
                <ProfilePage />
              </RoleRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <RoleRoute allowedRoles={["interviewer", "candidate"]}>
                <SettingsPage />
              </RoleRoute>
            }
          />

          {/* ✅ Role-based Routes */}
          <Route
            path="/interviewer/*"
            element={
              <RoleRoute allowedRoles={["interviewer"]}>
                <Routes>
                  <Route
                    path="dashboard"
                    element={<InterviewerDashboardPage />}
                  />
                  <Route path="schedule" element={<SchedulePage />} />
                </Routes>
              </RoleRoute>
            }
          />
          <Route
            path="/candidate/*"
            element={
              <RoleRoute allowedRoles={["candidate"]}>
                <Routes>
                  <Route path="dashboard" element={<CandidateDashboardPage />} />
                </Routes>
              </RoleRoute>
            }
          />

          {/* ✅ Default Redirect for Unknown Paths */}
          <Route path="*" element={<RoleBasedRedirect />} />

          {/* Interview Routes */}
          <Route
            path="/interview/:interviewId"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["interviewer", "candidate"]}>
                  <InterviewPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
