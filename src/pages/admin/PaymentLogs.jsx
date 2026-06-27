import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PaymentLogs = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/admin/dashboard/payments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPayments(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching payment history logs:", error);
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return <div className="p-6">Loading transaction logs history...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">💳 Razorpay Settlement History</h1>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Razorpay Order ID</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Payment ID</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">User ID</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                        {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50">
                                <td className="p-4 font-medium text-gray-900">{p.razorpayOrderId}</td>
                                <td className="p-4 text-xs font-mono text-gray-500">{p.razorpayPaymentId || 'N/A'}</td>
                                <td className="p-4">User #{p.userId}</td>
                                <td className="p-4 font-semibold text-gray-900">₹{p.amount / 100}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {p.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentLogs;