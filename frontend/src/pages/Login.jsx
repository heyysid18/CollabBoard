import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Command } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0e1016]">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.05] text-white border border-white/[0.05] mb-6 shadow-2xl">
                        <Command className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Log in to CollabBoard</h2>
                    <p className="text-sm text-gray-500 mt-2">Welcome back. Please enter your details.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                        <input
                            type="email"
                            required
                            className="input-standard"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
                        <input
                            type="password"
                            required
                            className="input-standard"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full py-2.5 mt-2">
                        Sign In
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
