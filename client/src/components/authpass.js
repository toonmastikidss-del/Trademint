import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, ShieldCheck, OctagonAlert, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import AlertModal from './AlertModal';
import { API_CONFIG } from '../config/apiConfig';

const Authpass = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [modal, setModal] = useState({ isOpen: false, message: '', type: '' });

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token || !user) {
            navigate('/login');
            return;
        }
    }, [navigate]);

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id || user?.id;

    const handleSave = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setModal({ isOpen: true, message: 'Please fill all fields', type: 'error' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setModal({ isOpen: true, message: 'Passwords do not match', type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setModal({ isOpen: true, message: 'New password must be at least 6 characters', type: 'error' });
            return;
        }

        try {
            const res = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/change-password`, {
                userId,
                currentPassword,
                newPassword
            });

            setModal({ isOpen: true, message: res.data.message, type: 'success' });
            setTimeout(() => {
                setModal({ ...modal, isOpen: false });
                navigate('/password');
            }, 2000);
        } catch (err) {
            setModal({ 
                isOpen: true, 
                message: err.response?.data?.message || 'Update failed', 
                type: 'error' 
            });
        }
    };

    return (
        <div className='flex flex-col w-full min-h-screen bg-[#020617] font-sans text-white'>
            {/* Header */}
            <div className='bg-[#0f172a] border-b border-slate-800 px-6 py-5 flex items-center sticky top-0 z-10'>
                <button onClick={() => navigate('/password')} className='p-2 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all'>
                    <ChevronLeft size={20} className='text-slate-400' />
                </button>
                <h1 className='ml-4 text-lg font-bold tracking-tight'>Change Login Password</h1>
            </div>

            <div className='p-8 space-y-8'>
                {/* Visual Header */}
                <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-6 rounded-[2rem] flex items-center space-x-4">
                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                        <Lock size={28} />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm">Security Update</h2>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Protect your AIG assets</p>
                    </div>
                </div>

                <div className='space-y-6'>
                    {/* Current Password */}
                    <div className='space-y-3'>
                        <label className='text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] pl-2'>Current Password</label>
                        <div className='bg-[#0f172a] border border-slate-800 rounded-3xl px-6 py-5 flex items-center focus-within:border-blue-500/50 transition-all shadow-sm'>
                            <input
                                type={showPass.current ? 'text' : 'password'}
                                placeholder='Please enter the Current Password'
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className='bg-transparent text-white text-base font-medium w-full outline-none placeholder:text-slate-700'
                            />
                            <button onClick={() => setShowPass({ ...showPass, current: !showPass.current })} className="text-slate-600">
                                {showPass.current ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className='space-y-3'>
                        <label className='text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] pl-2'>New Password</label>
                        <div className='bg-[#0f172a] border border-slate-800 rounded-3xl px-6 py-5 flex items-center focus-within:border-blue-500/50 transition-all shadow-sm'>
                            <input
                                type={showPass.new ? 'text' : 'password'}
                                placeholder='Please enter New Password'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className='bg-transparent text-white text-base font-medium w-full outline-none placeholder:text-slate-700'
                            />
                            <button onClick={() => setShowPass({ ...showPass, new: !showPass.new })} className="text-slate-600">
                                {showPass.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className='space-y-3'>
                        <label className='text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] pl-2'>Confirm Password</label>
                        <div className='bg-[#0f172a] border border-slate-800 rounded-3xl px-6 py-5 flex items-center focus-within:border-blue-500/50 transition-all shadow-sm'>
                            <input
                                type={showPass.confirm ? 'text' : 'password'}
                                placeholder='Please enter Confirm Password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className='bg-transparent text-white text-base font-medium w-full outline-none placeholder:text-slate-700'
                            />
                            <button onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })} className="text-slate-600">
                                {showPass.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className='pt-4'>
                    <button 
                        onClick={handleSave}
                        className='w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-5 rounded-[2.5rem] font-bold text-[13px] uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(37,99,235,0.25)] hover:shadow-blue-500/40 active:scale-95 transition-all duration-300'
                    >
                        Save & Secure
                    </button>
                </div>

                <div className='flex items-start space-x-3 bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10'>
                    <OctagonAlert size={20} className='text-blue-400 shrink-0' />
                    <div className='space-y-1'>
                        <h4 className='text-[11px] font-bold text-blue-400 uppercase tracking-widest'>Notice</h4>
                        <p className='text-[10px] text-slate-400 font-medium leading-relaxed'>
                            Ensure your new password is secure and not used on other platforms. Your session may be refreshed after saving.
                        </p>
                    </div>
                </div>
            </div>

            <AlertModal 
                isOpen={modal.isOpen} 
                message={modal.message} 
                type={modal.type} 
                onClose={() => setModal({ ...modal, isOpen: false })} 
            />
        </div>
    );
};

export default Authpass;
