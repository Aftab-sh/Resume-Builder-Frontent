import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // POST /api/auth/login -> Returns AuthResponse
            const response = await API.post('/auth/login', formData);
            
            // Extracting user data and token from backend response
            const { token, ...userData } = response.data;
            
            // Save state in context & localStorage
            login(userData, token);
            
            // 🚀 DYNAMIC ROUTING LOGIC: User role ke basis par redirect check
            // Note: Tumhare backend model ke hisab se role string lowercase ya uppercase ho sakti hai, isliye case-insensitive check lagaya hai.
            const userRole = userData.role || response.data.role || '';
            
            if (userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'ROLE_ADMIN') {
                navigate('/admin/dashboard'); // Admin sidha control portal par
            } else {
                navigate('/dashboard'); // Normal user simple resume dashboard par
            }

        } catch (err) {
            const serverMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(serverMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8">
                
                {/* Branding Headers */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-indigo-600 text-white w-10 h-10 rounded-xl font-bold text-lg shadow-sm shadow-indigo-100 mb-3">
                        RB
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                    <p className="text-sm text-slate-500 mt-1">Sign in to manage your professional portfolios</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200/60 rounded-xl text-xs font-medium text-rose-600 mb-5 flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form Architecture */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                        </div>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50 mt-2 shadow-sm"
                    >
                        {loading ? 'Login...' : 'Sign In'}
                    </button>
                </form>

                {/* Navigation Link to Signup */}
                <div className="text-center mt-6 text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">
                        Sign up
                    </Link>
                </div>

            </div>
        </div>
    );
}