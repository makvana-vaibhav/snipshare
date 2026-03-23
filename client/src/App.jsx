import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PasteViewPage from './pages/PasteViewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import EditPastePage from './pages/EditPastePage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/paste/:id" element={<PasteViewPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/paste/:id/edit"
                        element={
                            <ProtectedRoute>
                                <EditPastePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <footer className="app-footer text-center text-muted text-sm" style={{ padding: '2rem 1rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                © 2026 SnipShare • Built by Vaibhav Makvana
            </footer>
        </>
    );
}
