import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    
    const navigate = useNavigate();

    // Fetch user resumes on dashboard load
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                // GET /api/resumes
                const response = await API.get('/resumes');
                setResumes(response.data);
            } catch (err) {
                console.error("Failed to fetch repository files.", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResumes();
    }, []);

    // Handle creation of a new resume instance
    const handleCreateResume = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        setCreateLoading(true);

        try {
            // POST /api/resumes -> Sends body { title }
            const response = await API.post('/resumes', { title: newTitle });
            const createdResume = response.data;
            
            // Instantly redirect to the designer workspace editor
            navigate(`/editor/${createdResume.id}`);
        } catch (err) {
            alert("Error initializing resume document instance.");
        } finally {
            setCreateLoading(false);
            setShowModal(false);
            setNewTitle('');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            
            {/* Top Corporate Management Bar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-slate-950 text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                            RS
                        </div>
                        <span className="font-semibold tracking-tight text-slate-900">Workspace Management</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                            <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-0.5">
                                {user?.subscriptionPlan} account
                            </span>
                        </div>
                        <button 
                            onClick={logout}
                            className="text-xs font-medium border border-slate-200 text-slate-600 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Core Body Container */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                
                {/* Section Header Elements */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Your Resumes</h1>
                        <p className="text-xs text-slate-500 mt-1">Manage, update, and distribute your deployment-ready templates.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition-all shadow-sm flex items-center space-x-1.5"
                    >
                        <span>+</span> <span>New Document</span>
                    </button>
                </div>

                {/* Main Dynamic Grid Block */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white border border-slate-200 rounded-xl h-48 animate-pulse" />
                        ))}
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="bg-white border border-slate-200/60 rounded-xl p-12 text-center max-w-md mx-auto mt-12 shadow-sm">
                        <span className="text-3xl block mb-3">📁</span>
                        <h3 className="text-sm font-semibold text-slate-900">No active documents found</h3>
                        <p className="text-xs text-slate-400 mt-1 mb-5">Initialize your first deployment pipeline structure by clicking below.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            Create Document
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                            <div 
                                key={resume.id}
                                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div className="p-5 flex-grow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="bg-slate-100 text-slate-600 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold">
                                            📄
                                        </div>
                                        {resume.paid && (
                                            <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                Premium Template
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm text-slate-900 truncate">{resume.title}</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Modified: {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-between">
                                    <button
                                        onClick={() => navigate(`/editor/${resume.id}`)}
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        Edit Workspace
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Document Initialization Modal Window Component */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white border border-slate-200 max-w-sm w-full rounded-xl p-6 shadow-xl">
                        <h3 className="font-semibold text-sm text-slate-900 mb-1">Create Document Instance</h3>
                        <p className="text-xs text-slate-400 mb-4">Set up a unique identification tag for your new resume layout.</p>
                        
                        <form onSubmit={handleCreateResume} className="space-y-4">
                            <input
                                type="text"
                                required
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="e.g., Java Backend Engineer Portfolio"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
                            />
                            
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="text-xs font-medium border border-slate-200 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {createLoading ? 'Provisioning...' : 'Initialize'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}