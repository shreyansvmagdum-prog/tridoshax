import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AIAssistant } from './components/AIAssistant';

import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>

            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth pages */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthPage type="login" />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <AuthPage type="register" />
                </PublicRoute>
              }
            />

            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected pages */}
            <Route
              path="/assessment"
              element={
                <ProtectedRoute>
                  <QuestionnairePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

          </Routes>
        </main>

        <Footer />
        <AIAssistant />
      </div>
    </Router>
  );
}