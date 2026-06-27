import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminPortal from './pages/admin/AdminPortal';
import ProtectedRoute from './components/ProtectedRoute';
import Editor from './pages/Editor';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600/10 selection:text-indigo-600">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Protected Core Ecosystem Components */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path="/editor/:id" element={
    <ProtectedRoute>
        <Editor />
    </ProtectedRoute>
} />

<Route path="/admin/dashboard" element={<AdminPortal />} />
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;