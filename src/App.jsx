import React from "react";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
// import { AuthProvider, AuthContext } from "./contexts/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SchedulePage from "./pages/SchedulePage";
import InterviewerDashboardPage from "./pages/InterviewerDashboardPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ProtectedRoute from "./components/ProtectedRoute";
// import InterviewPage from "./pages/InterviewPage1";
// import CandidateInterviewPage from "./pages/CandidateInterviewPage";
// import InterviewerPage from "./pages/InterviewerPage";

// Components
// import InterviewerView from "./components/InterviewerView";
// import CandidateView from "./components/CandidateView";
// import InterviewerDashboard from "./components/InterviewerDashboard";

// ✅ Protected Route Component
const ProtectedRouteComponent = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

// ✅ Role-based Route Component
const RoleRoute = ({ roles, children }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user && roles.includes(user.role) ? (
    children
  ) : (
    <Navigate to="/dashboard" />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRouteComponent>
                <DashboardPage />
              </ProtectedRouteComponent>
            }
          />
          {/* 
    {/* 
    
    🧑‍💻 Dynamic Routes for Interviews 
          {/* 🔒 Protected Routes */}

          <Route
            path="/schedule"
            element={
              <ProtectedRouteComponent>
                <SchedulePage />
              </ProtectedRouteComponent>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRouteComponent>
                <ProfilePage />
              </ProtectedRouteComponent>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRouteComponent>
                <SettingsPage />
              </ProtectedRouteComponent>
            }
          />
          {/* <Route
            path="/interview"
            element={
              <ProtectedRouteComponent>
                <InterviewPage />
              </ProtectedRouteComponent>
            }
          /> */}
          {/* <Route
            path="/interview/candidate"
            element={
              <ProtectedRouteComponent>
                <CandidateView roomId={1234} />
              </ProtectedRouteComponent>
            }
          /> */}

          {/* 🎯 Role-Based Routes */}
          {/* <Route
            path="/interviewer"
            element={
              <ProtectedRouteComponent>
                <RoleRoute roles={["interviewer", "admin"]}>
                  <InterviewerView roomId={1234} />
                </RoleRoute>
              </ProtectedRouteComponent>
            }
          /> */}
          {/* <Route
            path="/interviewer-dashboard"
            element={
              <ProtectedRouteComponent>
                <RoleRoute roles={["interviewer", "admin"]}>
                  <InterviewerDashboard />
                </RoleRoute>
              </ProtectedRouteComponent>
            }
          /> */}

          {/* <Route
            path="/interview/:roomId"
            element={
              <ProtectedRouteComponent>
                <InterviewPage isInterviewer={false} />
              </ProtectedRouteComponent>
            }
            /> */}
          {/* <Route
            path="/host/:roomId"
            element={
              <ProtectedRouteComponent>
                <InterviewPage isInterviewer={true} />
              </ProtectedRouteComponent>
            }
            />  */}

          {/* ❌ 404 Route */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
          <Route
            path="/interviewer/dashboard"
            element={
              // <ProtectedRoute allowedRoles={["interviewer"]}>
                <InterviewerDashboardPage />
              // </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/interviewer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["interviewer"]}>
                <InterviewerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
