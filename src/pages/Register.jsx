import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // 🚀 Registration ke baad registered email ko track karne ke liye state
    const [registeredEmail, setRegisteredEmail] = useState(''); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setRegisteredEmail(''); // Purani track ki hui email clear karo

        const userEmail = formData.email;

        try {
            // Backend endpoint: /api/auth/register
            await API.post('/auth/register', formData);
            
            setMessage({ 
                type: 'success', 
                text: 'Registration successful! Ek verification email aapki ID par bheja gaya hai. Kripya apna inbox check karein.' 
            });
            
            // 🚀 Success hone par email ko save karo taaki niche Resend button active ho sake
            setRegisteredEmail(userEmail); 
            
            // Form clear karo
            setFormData({ name: '', email: '', password: '' });

        } catch (error) {
            // 🚀 Sahi se plain text backend message parse karne ke liye condition
            let errorMsg = 'Registration failed. Please try again.';
            if (error.response && error.response.data) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : error.response.data.message || errorMsg;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // 🚀 Resend Verification Email Handle Karne Ka Function
    const handleResendEmail = async () => {
        if (!registeredEmail) return;
        setResendLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Body me JSON format me key-value map bhej rahe hain jaisa controller expect kar raha hai
            await API.post('/auth/resend-verification', { email: registeredEmail });
            setMessage({ type: 'success', text: 'Verification email fir se bhej diya gaya hai! Check karein.' });
        } catch (error) {
            let errorMsg = 'Failed to resend verification email.';
            if (error.response && error.response.data) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : error.response.data.message || errorMsg;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                
                {/* Heading */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account 🚀</h2>
                    <p className="text-sm text-gray-500 mt-2">Apna professional resume banana shuru karein</p>
                </div>

                {/* Status Message Alert */}
                {message.text && (
                    <div className={`p-4 rounded-xl text-sm mb-6 font-medium ${
                        message.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm mt-2"
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>

                {/* 🚀 RESEND EMAIL LINK: Sirf registration successful hone par hi niche dikhega */}
                {registeredEmail && (
                    <div className="mt-5 p-3 bg-indigo-50 rounded-xl text-center border border-indigo-100 animate-fade-in">
                        <p className="text-xs text-indigo-900 mb-1">Email nahi mila?</p>
                        <button
                            type="button"
                            onClick={handleResendEmail}
                            disabled={resendLoading}
                            className="text-sm text-indigo-600 font-bold hover:underline focus:outline-none disabled:opacity-50"
                        >
                            {resendLoading ? 'Sending link...' : '📬 Resend Verification Email'}
                        </button>
                    </div>
                )}

                {/* Footer Link */}
                <div className="text-center mt-6 text-sm text-gray-600">
                    Pehle se account hai?{' '}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                        Login karein
                    </Link>
                </div>

            </div>
        </div>
    );
}