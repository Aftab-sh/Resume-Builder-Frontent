import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TemplateManager = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', primaryColor: '#000000', fontFamily: 'Arial', layoutType: 'classic', isPremium: false });

    const token = localStorage.getItem('token');

    const fetchTemplates = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/templates/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTemplates(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching templates:", error);
            setLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/admin/templates/create', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setFormData({ name: '', primaryColor: '#000000', fontFamily: 'Arial', layoutType: 'classic', isPremium: false });
            fetchTemplates();
        } catch (error) {
            alert("Error creating template");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Kya aap is template ko delete karna chahte hain?")) {
            try {
                await axios.delete(`http://localhost:8080/api/admin/templates/delete/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchTemplates();
            } catch (error) {
                alert("Error deleting template");
            }
        }
    };

    if (loading) return <div className="p-6">Loading templates...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">🎨 Dynamic Template Configuration</h1>
                <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md">
                    + Add New Template
                </button>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map((tpl) => (
                    <div key={tpl.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200 relative">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-gray-800">{tpl.name}</h3>
                            {tpl.isPremium ? <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">🔒 Premium</span> : <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Free</span>}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 mb-4">
                            <p><strong>Font:</strong> {tpl.fontFamily}</p>
                            <p><strong>Layout:</strong> {tpl.layoutType}</p>
                            <div className="flex items-center gap-2">
                                <strong>Theme Color:</strong>
                                <span className="w-4 h-4 rounded-full inline-block border border-gray-300" style={{ backgroundColor: tpl.primaryColor }}></span>
                                <span className="text-xs text-gray-500">{tpl.primaryColor}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(tpl.id)} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg text-sm transition">
                            Delete Template
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal for Creating Template */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Add New Dynamic Template</h2>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Template Name</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:border-indigo-600"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Color</label>
                                <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} className="w-full h-10 p-1 border rounded-lg cursor-pointer"/>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Font Family</label>
                                <select value={formData.fontFamily} onChange={(e) => setFormData({...formData, fontFamily: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:border-indigo-600">
                                    <option value="Arial">Arial</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Roboto">Roboto</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Layout Style Type</label>
                            <select value={formData.layoutType} onChange={(e) => setFormData({...formData, layoutType: e.target.value})} className="w-full border p-2 rounded-lg outline-none focus:border-indigo-600">
                                <option value="classic">Classic Minimal</option>
                                <option value="modern">Modern Creative</option>
                                <option value="professional">Executive Professional</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 py-2">
                            <input type="checkbox" id="premiumCheck" checked={formData.isPremium} onChange={(e) => setFormData({...formData, isPremium: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded"/>
                            <label htmlFor="premiumCheck" className="text-sm font-semibold text-gray-700 select-none">Mark as Premium (🔒 Lock for Basic Users)</label>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md">Save Configuration</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TemplateManager;