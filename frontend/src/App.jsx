import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './components/ui/ToastProvider';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/board/:id"
                        element={
                            <ProtectedRoute>
                                <SocketProvider>
                                    <Board />
                                </SocketProvider>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
