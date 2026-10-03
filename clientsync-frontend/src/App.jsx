import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { RequestsProvider } from './context/RequestsContext';
import AnimatedBackground from './components/AnimatedBackground';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));

// Auth Pages (Lazy Loaded)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));

// Dashboard Pages (Lazy Loaded)
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const LinksPage = lazy(() => import('./pages/dashboard/LinksPage'));
const SubmissionDetail = lazy(() => import('./pages/dashboard/SubmissionDetail'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));

// Onboarding Pages (Lazy Loaded)
const OnboardingWizard = lazy(() => import('./pages/onboarding/OnboardingWizard'));
const OnboardingQuizPage = lazy(() => import('./pages/onboarding/OnboardingQuizPage'));

function PageFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
            <div className="w-9 h-9 rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--indigo-500)', animation: 'spin-slow 0.8s linear infinite' }} />
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AnimatedBackground />
            <BrowserRouter>
                <AuthProvider>
                    <RequestsProvider>
                        <Suspense fallback={<PageFallback />}>
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
                        </Suspense>
                    </RequestsProvider>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;