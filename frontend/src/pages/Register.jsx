import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Command } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, email, password);
            navigate('/');
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0e1016]">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.05] text-white border border-white/[0.05] mb-6 shadow-2xl">
                        <Command className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Create an account</h2>
                    <p className="text-sm text-gray-500 mt-2">Start managing your projects efficiently.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Username</label>
                        <input
                            type="text"
                            required
                            className="input-standard"
                            placeholder="johndoe"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

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
                        Create Account
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
