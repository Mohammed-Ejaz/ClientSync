import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AnimatedBackground from './components/AnimatedBackground';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import FeaturesPage from './pages/FeaturesPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome';
import LinksPage from './pages/dashboard/LinksPage';
import SubmissionDetail from './pages/dashboard/SubmissionDetail';
import SettingsPage from './pages/dashboard/SettingsPage';

// Onboarding
import OnboardingWizard from './pages/onboarding/OnboardingWizard';
import OnboardingQuizPage from './pages/onboarding/OnboardingQuizPage';

function App() {
    return (
        <ThemeProvider>
            <AnimatedBackground />
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                    {/* ── Public Routes ────────────────────────────── */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/features" element={<FeaturesPage />} />

                    {/* ── Auth Routes ──────────────────────────────── */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                        path="/onboarding-quiz"
                        element={
                            <ProtectedRoute>
                                <OnboardingQuizPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* ── Protected Dashboard Routes ───────────────── */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardHome />} />
                        <Route path="links" element={<LinksPage />} />
                        <Route path="submissions/:id" element={<SubmissionDetail />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* ── Public Client Onboarding ─────────────────── */}
                    <Route path="/onboarding/:uniqueLink" element={<OnboardingWizard />} />

                    {/* ── Catch-All ────────────────────────────────── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;