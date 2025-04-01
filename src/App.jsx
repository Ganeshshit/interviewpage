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
import { Loader2 } from "lucide-react";
import { Toaster } from 'react-hot-toast';

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
import CandidateDashboardPage from "./pages/CandidateDashboardPage";
// import CandidatesPage from "./pages/CandidatesPage";
// import ReportsPage from "./pages/ReportsPage";
// import InterviewsPage from "./pages/InterviewsPage";
// import ResourcesPage from "./pages/ResourcesPage";
// import InterviewPage from "./pages/InterviewPage1";
// import CandidateInterviewPage from "./pages/CandidateInterviewPage";
// import InterviewerPage from "./pages/InterviewerPage";

// Components
// import InterviewerView from "./components/InterviewerView";
// import CandidateView from "./components/CandidateView";
// import InterviewerDashboard from "./components/InterviewerDashboard";

// Protected Route Component
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

// Role-based redirect component
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

  if (user.role === 'interviewer') {
    return <Navigate to="/interviewer/dashboard" replace />;
  }

  if (user.role === 'candidate') {
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={`/${user?.role}/dashboard`} />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          /> */}
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
              <ProtectedRoute allowedRoles={['interviewer', 'candidate']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['interviewer', 'candidate']}>
                <SettingsPage />
              </ProtectedRoute>
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
          <Route path="*" element={<RoleBasedRedirect />} />
          <Route
            path="/interviewer/*"
            element={
              <ProtectedRoute allowedRoles={['interviewer']}>
                <Routes>
                  <Route path="dashboard" element={<InterviewerDashboardPage />} />
                  <Route path="schedule" element={<SchedulePage />} />
                  {/* <Route path="candidates" element={<CandidatesPage />} /> */}
                  {/* <Route path="reports" element={<ReportsPage />} /> */}
                </Routes>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/*"
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <Routes>
                  <Route path="dashboard" element={<CandidateDashboardPage />} />
                  {/* <Route path="interviews" element={<InterviewsPage />} /> */}
                  {/* <Route path="resources" element={<ResourcesPage />} /> */}
                </Routes>
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
