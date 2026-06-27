import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function Templates({ onSelectTemplate }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTemplates = async () => {
        try {
            const response = await API.get('/templates');
            // ✅ Backend ab direct array bhejta hai, wrapper object nahi
            setTemplates(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching templates:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {templates.map((template) => (
                <div
                    key={template.id}
                    onClick={() => !template.isLocked && onSelectTemplate(template.id)}
                    className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 transition-all ${
                        template.isLocked
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-pointer hover:shadow-lg hover:border-indigo-400'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-800">{template.name}</h3>
                        {/* ✅ Ab backend ke isLocked field se directly drive hoga */}
                        {template.isLocked && (
                            <span className="text-amber-500 text-xl">🔒</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {template.isPremium ? 'Premium' : 'Free'}
                    </p>
                </div>
            ))}
        </div>
    );
}