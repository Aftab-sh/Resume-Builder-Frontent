import React, { useEffect, useState } from 'react';
import API from "../../services/api";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        premiumUsers: 0,
        basicUsers: 0,
        totalTemplates: 0,
        totalRevenueINR: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchStats = async () => {
        try {
            const response = await API.get("/admin/dashboard/stats");

            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            setLoading(false);
        }
    };

    fetchStats();
}, []);

    if (loading) return <div className="text-center mt-10 text-xl font-semibold">Loading</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard Overview</h1>
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Revenue Card */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-md text-white">
                    <p className="text-sm font-medium uppercase tracking-wider opacity-80">Total Revenue</p>
                    <h3 className="text-3xl font-bold mt-2">₹{stats.totalRevenueINR}</h3>
                </div>

                {/* Total Users Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</h3>
                    <div className="text-xs text-gray-500 mt-2">
                        <span className="text-purple-600 font-semibold">{stats.premiumUsers} Premium</span> | {stats.basicUsers} Basic
                    </div>
                </div>

                {/* Total Templates Card */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Templates</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTemplates}</h3>
                </div>

                {/* Dynamic Performance Quick Check */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl shadow-md text-white">
                    <p className="text-sm font-medium uppercase tracking-wider opacity-80">Conversion Rate</p>
                    <h3 className="text-3xl font-bold mt-2">
                        {stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </h3>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;