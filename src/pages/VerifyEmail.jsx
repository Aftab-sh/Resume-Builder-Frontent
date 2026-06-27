import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // States: verifying, success, error
    const [errorMessage, setErrorMessage] = useState('');
    
    // 🚀 Resend Feature States
    const [email, setEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState({ text: '', type: '' });
    const [timer, setTimer] = useState(0);

    // Countdown Timer logic ⏱️
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                setErrorMessage('Verification token is missing from URL.');
                return;
            }

            try {
                // GET /api/auth/verify-email?token=...
                await API.get(`/auth/verify-email?token=${token}`);
                setStatus('success');
            } catch (err) {
                setStatus('error');
                const msg = err.response?.data?.message || 'Token has expired or is invalid.';
                setErrorMessage(msg);
            }
        };

        verifyToken();
    }, [searchParams]);

    // 🚀 Resend API Caller
    const handleResend = async (e) => {
        e.preventDefault();
        if (!email) {
            setResendMessage({ text: 'Please enter your email address.', type: 'error' });
            return;
        }
        setResendLoading(true);
        setResendMessage({ text: '', type: '' });

        try {
            // Humare backend ke standard request format ke hisab se body bhej rahe hain
            const response = await API.post('/auth/resend-verification', { email: email });
            setResendMessage({ 
                text: response.data.message || 'Verification link sent to your mail!', 
                type: 'success' 
            });
            setTimer(60); // 1 minute ka button lock লাগਾ diya
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Failed to resend verification link.';
            setResendMessage({ text: errMsg, type: 'error' });
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 text-center">
                
                {/* 1. Loading State */}
                {status === 'verifying' && (
                    <div className="space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <h3 className="text-lg font-semibold text-slate-800">Verifying your email</h3>
                        <p className="text-sm text-slate-500">Please wait while we secure your account credentials...</p>
                    </div>
                )}

                {/* 2. Success State */}
                {status === 'success' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto border border-emerald-100">
                            ✓
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Account Verified Successfully</h3>
                        <p className="text-sm text-slate-500 px-2"> Your email address has been validated. You can now access all dashboard parameters.</p>
                        <div className="pt-2">
                            <Link to="/login" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm">
                                Proceed to Login
                            </Link>
                        </div>
                    </div>
                )}

                {/* 3. Error State (With Dynamic Resend Layout) */}
                {status === 'error' && (
                    <div className="space-y-5">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto border border-rose-100">
                            ✕
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Verification Failed</h3>
                        <p className="text-sm text-rose-600 font-medium px-4 bg-rose-50/50 py-2 rounded-xl border border-rose-100/40">{errorMessage}</p>
                        
                        <hr className="border-slate-100 my-4" />

                        {/* Verification Trigger Form */}
                        <form onSubmit={handleResend} className="space-y-3 text-left">
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider pl-1">
                                Receive a New Link
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={resendLoading || timer > 0}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center min-w-[90px]"
                                >
                                    {resendLoading ? 'Sending...' : timer > 0 ? `${timer}s` : 'Resend'}
                                </button>
                            </div>
                        </form>

                        {/* Status Feedback Notification */}
                        {resendMessage.text && (
                            <p className={`text-xs font-medium text-left p-2.5 rounded-lg ${
                                resendMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                                {resendMessage.type === 'success' ? '✅ ' : '⚠️ '} {resendMessage.text}
                            </p>
                        )}

                        <div className="pt-2 flex flex-col space-y-2">
                            <Link to="/register" className="text-xs text-slate-500 font-medium hover:text-indigo-600 transition-all underline">
                                Back to Registration
                            </Link>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}