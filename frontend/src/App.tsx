import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { HouseholdSetupPage } from './pages/HouseholdSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { DetectivePage } from './pages/DetectivePage';
import { AssessmentResultsPage } from './pages/AssessmentResultsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ImpactTrackerPage } from './pages/ImpactTrackerPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm font-semibold text-slate-500">
        Authenticating GharKaGod session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/household/setup"
                element={
                  <ProtectedRoute>
                    <HouseholdSetupPage />
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
                path="/detective"
                element={
                  <ProtectedRoute>
                    <DetectivePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/detective/results"
                element={
                  <ProtectedRoute>
                    <AssessmentResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <RecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tracker"
                element={
                  <ProtectedRoute>
                    <ImpactTrackerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
