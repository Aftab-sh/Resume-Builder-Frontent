import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [registeredEmail, setRegisteredEmail] = useState('');

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select a valid image file.' });
            return;
        }

        setImageFile(file);
        setUploadedImageUrl('');
        setImagePreview(URL.createObjectURL(file));
    };

    const handleImageUpload = async () => {
        if (!imageFile) return;
        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const form = new FormData();
            form.append('image', imageFile);

            const res = await API.post('/auth/upload-image', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const url = res.data.imageUrl;
            setUploadedImageUrl(url);
            setMessage({ type: 'success', text: 'Profile photo uploaded successfully!' });
        } catch (error) {
            let errorMsg = 'Image upload failed. Please try again.';
            if (error.response && error.response.data) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : error.response.data.message || errorMsg;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setUploading(false);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setUploadedImageUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setRegisteredEmail('');

        const userEmail = formData.email;

        try {
            let finalImageUrl = uploadedImageUrl;
            if (imageFile && !uploadedImageUrl) {
                const form = new FormData();
                form.append('image', imageFile);
                const uploadRes = await API.post('/auth/upload-image', form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalImageUrl = uploadRes.data.imageUrl;
                setUploadedImageUrl(finalImageUrl);
            }

            const payload = {
                ...formData,
                profileImageUrl: finalImageUrl || null
            };

            await API.post('/auth/register', payload);

            setMessage({
                type: 'success',
                text: 'Registration successful! The verification Link is send to your Email ID Please Verify Your EmailID.'
            });

            setRegisteredEmail(userEmail);
            setFormData({ name: '', email: '', password: '' });
            removeImage();

        } catch (error) {
            let errorMsg = 'Registration failed. Please try again.';
            if (error.response && error.response.data) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : error.response.data.message || errorMsg;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        if (!registeredEmail) return;
        setResendLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await API.post('/auth/resend-verification', { email: registeredEmail });
            setMessage({ type: 'success', text: 'Verification email is sned again.' });
        } catch (error) {
            let errorMsg = 'Failed to resend verification email.';
            if (error.response && error.response.data) {
                errorMsg = typeof error.response.data === 'string' ? error.response.data : error.response.data.message || errorMsg;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account 🚀</h2>
                    <p className="text-sm text-gray-500 mt-2">Apna professional resume banana shuru karein</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl text-sm mb-6 font-medium ${
                        message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="flex flex-col items-center mb-2">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-gray-300">👤</span>
                                )}
                            </div>

                            <label
                                htmlFor="profileImageInput"
                                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-sm shadow-md transition-colors"
                                title="Choose photo"
                            >
                                📷
                            </label>
                            <input
                                id="profileImageInput"
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>

                        {imageFile && (
                            <div className="flex items-center gap-3 mt-3">
                                {!uploadedImageUrl ? (
                                    <button
                                        type="button"
                                        onClick={handleImageUpload}
                                        disabled={uploading}
                                        className="text-xs font-semibold text-indigo-600 hover:underline disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Photo'}
                                    </button>
                                ) : (
                                    <span className="text-xs font-semibold text-green-600">✓ Photo ready</span>
                                )}
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="text-xs font-medium text-gray-400 hover:text-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1.5">Profile photo (optional)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm mt-2"
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>

                {registeredEmail && (
                    <div className="mt-5 p-3 bg-indigo-50 rounded-xl text-center border border-indigo-100 animate-fade-in">
                        <button
                            type="button"
                            onClick={handleResendEmail}
                            disabled={resendLoading}
                            className="text-sm text-indigo-600 font-bold hover:underline focus:outline-none disabled:opacity-50"
                        >
                            {resendLoading ? 'Sending link...' : '📬 Resend Verification Email'}
                        </button>
                    </div>
                )}

                <div className="text-center mt-6 text-sm text-gray-600">
                    Already have account?{' '}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                        Login
                    </Link>
                </div>

            </div>
        </div>
    );
}