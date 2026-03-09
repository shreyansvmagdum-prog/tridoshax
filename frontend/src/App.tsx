import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AIAssistant } from './components/AIAssistant';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage type="login" />} />
            <Route path="/register" element={<AuthPage type="register" />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/assessment" element={<QuestionnairePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
        <Footer />
        <AIAssistant />
      </div>
    </Router>
  );
}
