import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingVerification from "./pages/PendingVerification";
import Profile from "./pages/Profile";
import ChatPage from "./pages/ChatPage";

import StudentHome from "./pages/StudentPage/StudentHome.jsx";
import AdminDashboardAdm from "./pages/AdminPage/AdminDashboardAdm.jsx";

import ProtectedRoute from "./components/ProtectedRoute";
import RequiredVerified from "./verification/RequiredVerified";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/pending-verification"
        element={<PendingVerification />}
      />

      {/* Student routes */}
      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <RequiredVerified>
              <StudentHome />
            </RequiredVerified>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <RequiredVerified>
              <Profile />
            </RequiredVerified>
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:uid"
        element={
          <ProtectedRoute>
            <RequiredVerified>
              <ChatPage />
            </RequiredVerified>
          </ProtectedRoute>
        }
      />

      {/* Admin route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardAdm />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
