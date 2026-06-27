import React from 'react';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'stats', label: '📊 Dashboard Overview' },
        { id: 'templates', label: '🎨 Template Manager' },
        { id: 'users', label: '👥 User Management' },
        { id: 'payments', label: '💳 Razorpay Logs' }
    ];

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen p-5 flex flex-col justify-between shadow-xl">
            <div>
                <div className="mb-8 border-b border-gray-700 pb-4">
                    <h2 className="text-xl font-bold text-indigo-400">Resume Builder</h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">Admin Control Center</p>
                </div>
                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                activeTab === item.id 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="border-t border-gray-700 pt-4">
                <button 
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;