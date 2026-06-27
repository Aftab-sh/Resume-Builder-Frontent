import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
            {/* Minimalist Navbar */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-indigo-600 text-white p-2 rounded-xl font-bold text-xl tracking-wider shadow-md shadow-indigo-200">
                            RB
                        </div>
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                            Resume<span className="text-indigo-600">Builder</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-indigo-100">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Premium Hero Section */}
            <main className="flex-grow flex items-center justify-center px-6 py-12">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">
                        <span>✨ AI-Powered & Dynamic</span>
                    </div>

                    {/* Main Headings */}
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Land your dream job with a <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            Powerful Resume
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
                        Create a production-ready, beautifully structured resume in minutes. Choose from premium optimized templates engineered to pass ATS tracking filters smoothly.
                    </p>

                    {/* Call to Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Link to="/register" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-indigo-100 hover:scale-[1.02] text-center">
                            Create My Resume
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-xl transition-all shadow-sm hover:scale-[1.02] text-center">
                            Explore Templates
                        </Link>
                    </div>

                    {/* Minimal Feature Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-slate-200/60 max-w-3xl mx-auto">
                        <div className="flex flex-col items-center space-y-1">
                            <span className="text-xl">⚡</span>
                            <h3 className="font-semibold text-slate-800 text-sm">Instant Live Preview</h3>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <span className="text-xl">💳</span>
                            <h3 className="font-semibold text-slate-800 text-sm">Razorpay Premium Plans</h3>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                            <span className="text-xl">✉️</span>
                            <h3 className="font-semibold text-slate-800 text-sm">Direct PDF Email Sharing</h3>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium bg-white">
                &copy; {new Date().getFullYear()} ResumeBuilder Inc. All rights reserved.
            </footer>
        </div>
    );
}