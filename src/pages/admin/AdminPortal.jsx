import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminDashboard from './AdminDashboard';
import TemplateManager from './TemplateManager';
import UserManagement from './UserManagement';
import PaymentLogs from './PaymentLogs';



const AdminPortal = () => {
    const [activeTab, setActiveTab] = useState('stats');

    // Tab content switcher selector logic
    const renderContent = () => {
        switch (activeTab) {
            case 'stats':
                return <AdminDashboard />;
            case 'templates':
                return <TemplateManager />;
            case 'users':
                return <UserManagement />;
            case 'payments':
                return <PaymentLogs />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar Left Navigation Section */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Main Center UI Content Render Window */}
            <div className="flex-1 overflow-y-auto max-h-screen">
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminPortal;