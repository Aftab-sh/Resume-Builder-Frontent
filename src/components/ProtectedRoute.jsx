import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    // Agar context abhi profile data load kar raha hai, toh loader screen dikhayenge
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Agar authentication failure hai, toh direct user ko login state par push karenge
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}