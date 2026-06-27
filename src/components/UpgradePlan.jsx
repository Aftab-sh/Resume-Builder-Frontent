import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function UpgradePlan({ onClose }) {
    const { user, login, updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const orderRes = await API.post('/payment/create-order', {
                planType: "premium"
            });
            const orderData = orderRes.data;

            const options = {
                key: "rzp_test_Syg2fE3Y40rX5A",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ResumeStudio Premium",
                description: "Unlock all premium structural templates",
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await API.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // ✅ BACKEND SE NAYA TOKEN AAYEGA
                        if (verifyRes.data.success) {
                            const newToken = verifyRes.data.token;
                            const newPlan = verifyRes.data.subscriptionPlan;

                            // ✅ 1. LocalStorage update
                            localStorage.setItem('token', newToken);

                            // ✅ 2. Context update (naya token aur plan)
                            const updatedUser = {
                                ...user,
                                subscriptionPlan: newPlan
                            };

                            // ✅ Login function naya token save karega
                            login(updatedUser, newToken);

                            alert("🎉 Account successfully upgraded to Premium Tier!");

                            if (onClose) onClose();

                            // ✅ 3. Page reload – ab token save ho chuka hai
                            window.location.reload();
                        } else {
                            alert("Payment verification failed.");
                        }
                    } catch (err) {
                        console.error("Verification error: ", err);
                        alert("Backend verification failed.");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: { color: "#4f46e5" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            const errMsg = error.response?.data?.message || "Failed to initialize Razorpay.";
            alert(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl p-6 shadow-xl text-center">
                <span className="text-3xl">💎</span>
                <h3 className="text-lg font-semibold text-slate-900 mt-2">Upgrade to Premium</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">
                    Unlock all premium structural templates
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 text-left">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-700">Premium Access</span>
                        <span className="text-sm font-bold text-slate-900">₹999</span>
                    </div>
                    <p className="text-[11px] text-slate-400">One-time payment. Lifetime access.</p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="w-1/2 text-xs font-medium border border-slate-200 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {loading ? 'Processing...' : 'Upgrade Now'}
                    </button>
                </div>
            </div>
        </div>
    );
}