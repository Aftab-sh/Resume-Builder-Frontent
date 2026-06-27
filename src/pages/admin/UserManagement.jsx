import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/dashboard/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const togglePlan = async (id, currentPlan) => {
        const newPlan = currentPlan === 'premium' ? 'basic' : 'premium';
        try {
            await axios.put(`http://localhost:8080/api/admin/dashboard/users/${id}/plan?plan=${newPlan}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error) {
            alert("Error updating user plan");
        }
    };

    if (loading) return <div className="p-6">Loading registered system users...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">👥 User Account Management</h1>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">System Role</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Current Plan</th>
                            <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/50">
                                <td className="p-4 font-semibold text-gray-900">{user.name}</td>
                                <td className="p-4 text-gray-500">{user.email}</td>
                                <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">{user.role}</span></td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.subscriptionPlan === 'premium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {user.subscriptionPlan || 'basic'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => togglePlan(user.id, user.subscriptionPlan)} className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg transition">
                                        {user.subscriptionPlan === 'premium' ? 'Downgrade to Basic' : 'Upgrade to Premium'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;