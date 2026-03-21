import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, OctagonAlert } from 'lucide-react'
import { API_CONFIG } from '../config/apiConfig'

const Bind = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        accountHolder: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifsc: '',
        bankName: '',
        transactionPassword: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [bankDetails, setBankDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showConfirmPopup, setShowConfirmPopup] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: '' })

    // Check if user already has submitted bank details
    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                const token = localStorage.getItem('token')

                // ✅ FIX: Token null check — "Bearer null" se 400 error aata tha
                if (!token) {
                    navigate('/login')
                    return
                }

                const response = await fetch(`${API_CONFIG.BASE_URL}/api/bank/user-details`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                
                if (response.ok) {
                    const data = await response.json()
                    setBankDetails(data.bank)
                    setSubmitted(true)
                }

                // ✅ FIX: 401/403 pe bhi redirect karo
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    navigate('/login')
                    return
                }
            } catch (err) {
                // console.log('No existing bank details found')
            }
        }
        
        fetchBankDetails()
    }, [])

    // Poll for status updates every 30 seconds
    useEffect(() => {
        if (submitted && bankDetails && bankDetails.status === 'Pending') {
            const interval = setInterval(async () => {
                try {
                    const token = localStorage.getItem('token')

                    // ✅ FIX: Token null check in polling too
                    if (!token) {
                        clearInterval(interval)
                        navigate('/login')
                        return
                    }

                    const response = await fetch(`${API_CONFIG.BASE_URL}/api/bank/user-details`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    
                    if (response.ok) {
                        const data = await response.json()
                        if (data.bank.status !== bankDetails.status) {
                            setBankDetails(data.bank)
                            if (data.bank.status === 'Verified') {
                                showToast('Bank details verified successfully!', 'success')
                            }
                        }
                    }

                    // ✅ FIX: 401/403 on poll — logout
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token')
                        localStorage.removeItem('user')
                        navigate('/login')
                    }
                } catch (err) {
                    // console.log('Error polling status')
                }
            }, 30000) // 30 seconds
            
            return () => clearInterval(interval)
        }
    }, [submitted, bankDetails])

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type })
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' })
        }, 3000)
    }

    const handleSaveClick = () => {
        // Validation
        if (!formData.accountHolder || !formData.accountNumber || !formData.confirmAccountNumber || 
            !formData.ifsc || !formData.bankName || !formData.transactionPassword) {
            setError('Please fill all fields')
            return
        }

        if (formData.accountNumber !== formData.confirmAccountNumber) {
            setError('Account numbers do not match')
            return
        }

        // Show confirmation popup
        setShowConfirmPopup(true)
    }

    const confirmSubmission = async () => {
        setShowConfirmPopup(false)
        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')

            // ✅ FIX: Token null check on submit too
            if (!token) {
                navigate('/login')
                return
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/bank/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setBankDetails(data.bank)
                setSubmitted(true)
                showToast('Bank details submitted successfully! Status: Pending', 'success')
            } else if (response.status === 401 || response.status === 403) {
                // ✅ FIX: 401/403 on submit — logout
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
            } else {
                setError(data.message || 'Failed to submit bank details')
                showToast('Failed to submit bank details', 'error')
            }
        } catch (err) {
            setError('Network error. Please try again.')
            showToast('Network error. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (submitted && bankDetails) {
        return (
            <div className='w-full'>
                <div className='relative'>
                    <div className='h-14 bg-[#312c42] flex justify-center items-center'>
                        <span className='text-xl opacity-65'>Add Wallet</span>
                    </div>

                    <div className='absolute top-4 left-5 cursor-pointer' onClick={()=>{navigate('/mine')}}>
                        <ChevronLeft className='opacity-65' />
                    </div>
                </div>

                <div className='mt-6 mb-4 text-left font-semibold pl-8 opacity-60'>Select Wallet Category</div>
                <div className='h-16 mx-5 px-5 opacity-75 flex justify-between bg-[#212431] rounded-2xl items-center'>
                    <span className='text-lg'>Bank Card</span>
                    <ChevronRight className='opacity-75' />
                </div>

                <div className='mt-6 mb-4 text-left font-semibold pl-8 opacity-60'>Name</div>
                <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                    <span className='text-lg text-white'>{bankDetails.accountHolder}</span>
                </div>
                
                <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>Bank Name</div>
                <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                    <span className='text-lg text-white'>{bankDetails.bankName || 'Not specified'}</span>
                </div>
                
                <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>Bank Account</div>
                <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                    <span className='text-lg text-white'>
                        {bankDetails.accountNumber.replace(/.(?=.{4})/g, '*')}
                    </span>
                </div>

                <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>Confirm Bank Account</div>
                <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                    <span className='text-lg text-white'>
                        {bankDetails.accountNumber.replace(/.(?=.{4})/g, '*')}
                    </span>
                </div>

                <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>IFSC</div>
                <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                    <span className='text-lg text-white'>{bankDetails.ifsc}</span>
                </div>

                <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>Transaction Password</div>
                <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                    <span className='text-lg text-white'>********</span>
                </div>

                <div className='h-16 mt-8 mx-5 opacity-75 flex justify-center cursor-pointer bg-[#524e63] rounded-2xl items-center'>
                    <span className='text-lg'>
                        {bankDetails.status === 'Verified' ? 'Verified' : 'Submitted'}
                    </span>
                </div>

                <div className='mx-5 mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-2xl'>
                    <div className='flex items-start space-x-3'>
                        <OctagonAlert className='text-blue-400 mt-0.5 flex-shrink-0' />
                        <div>
                            <h4 className='text-blue-300 font-bold text-sm mb-1'>Important Notice</h4>
                            <p className='text-blue-200 text-sm leading-relaxed'>
                                {bankDetails.status === 'Verified' 
                                    ? '✅ Your bank details have been successfully verified and are now active for transactions.' 
                                    : '⏳ Your bank details are currently under review. Verification typically takes 24 hours. Please be patient.'}
                            </p>
                            <p className='text-blue-400 text-xs mt-2 font-medium'>
                                Status: <span className='font-bold'>{bankDetails.status}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='w-full'>
            <div className='relative'>
                <div className='h-14 bg-[#312c42] flex justify-center items-center'>
                    <span className='text-xl opacity-65'>Add Wallet</span>
                </div>

                <div className='absolute top-4 left-5 cursor-pointer' onClick={()=>{navigate('/mine')}}>
                    <ChevronLeft className='opacity-65' />
                </div>
            </div>

            {error && (
                <div className='mx-5 mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm'>
                    {error}
                </div>
            )}

            <div className='mt-6 mb-4 text-left font-semibold pl-8 opacity-60'>Select Wallet Category</div>
            <div className='h-16 mx-5 px-5 opacity-75 flex justify-between bg-[#212431] rounded-2xl items-center'>
                <span className='text-lg'>Bank Card</span>
                <ChevronRight className='opacity-75' />
            </div>

            <div className='mt-6 mb-4 text-left font-semibold pl-8 opacity-60'>Name</div>
            <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                <input 
                    type="text" 
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleInputChange}
                    placeholder="Please enter your name" 
                    className='text-lg bg-transparent text-white border-none outline-none placeholder-opacity-75 placeholder-white w-full'
                />
            </div>
            
            <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>Bank Name</div>
            <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                <input 
                    type="text" 
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Please enter bank name" 
                    className='text-lg bg-transparent text-white border-none outline-none placeholder-opacity-75 placeholder-white w-full'
                />
            </div>
            
            <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>Bank Account</div>
            <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                <input 
                    type="text" 
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Please enter bank account number" 
                    className='text-lg bg-transparent text-white border-none outline-none placeholder-opacity-75 placeholder-white w-full'
                />
            </div>

            <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>Confirm Bank Account</div>
            <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                <input 
                    type="password" 
                    name="confirmAccountNumber"
                    value={formData.confirmAccountNumber}
                    onChange={handleInputChange}
                    placeholder="Please enter Confirm bank account number" 
                    className='text-lg bg-transparent text-white border-none outline-none placeholder-opacity-75 placeholder-white w-full'
                />
            </div>

            <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>IFSC</div>
            <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                <input 
                    type="text" 
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleInputChange}
                    placeholder="Please enter IFSC" 
                    className='text-lg bg-transparent text-white border-none outline-none placeholder-opacity-75 placeholder-white w-full'
                />
            </div>

            <div className='mt-4 mb-4 text-left font-semibold pl-8 opacity-60'>Transaction Password</div>
            <div className='h-16 mx-5 opacity-75 px-6 flex justify-start bg-[#212431] rounded-2xl items-center'>
                <input 
                    type="password" 
                    name="transactionPassword"
                    value={formData.transactionPassword}
                    onChange={handleInputChange}
                    placeholder="Please enter Transaction Password" 
                    className='text-lg bg-transparent text-white border-none outline-none placeholder-opacity-75 placeholder-white w-full'
                />
            </div>

            <div 
                className='h-16 mt-8 mx-5 opacity-75 flex justify-center cursor-pointer bg-[#524e63] rounded-2xl items-center'
                onClick={handleSaveClick}
            >
                <span className='text-lg'>{loading ? 'Submitting...' : 'Save'}</span>
            </div>

            {/* Important Notice */}
            <div className='mx-5 mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-2xl'>
                <div className='flex items-start space-x-3'>
                    <OctagonAlert className='text-blue-400 mt-0.5 flex-shrink-0' />
                    <div>
                        <h2 className='text-blue-300 font-bold text-sm mb-1'>Important Notice</h2>
                        <ul className='space-y-1'>
                            {[
                                "Bank details verification takes 24-48 hours",
                                "Ensure all information is accurate to avoid rejection",
                                "You can only bind one bank account per profile",
                                "Verified accounts enable withdrawal functionality"
                            ].map((text, i) => (
                                <li key={i} className='flex items-start space-x-2'>
                                    <div className='mt-1.5 w-1 h-1 rounded-full bg-blue-500' />
                                    <p className='text-blue-200 text-xs leading-relaxed'>{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* <div className='opacity-60 ml-5 mt-6 flex items-center space-x-2'>
                <OctagonAlert />
                <span>Notice</span>
            </div> */}

            {/* Confirmation Popup */}
            {showConfirmPopup && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-[#212431] rounded-2xl p-6 w-full max-w-md border border-gray-700'>
                        <h3 className='text-white text-lg font-bold mb-4'>Confirm Submission</h3>
                        <p className='text-gray-300 mb-6'>
                            Are you sure you want to submit your bank details? Please verify all information is correct.
                        </p>
                        <div className='flex space-x-4'>
                            <button
                                onClick={() => setShowConfirmPopup(false)}
                                className='flex-1 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-white font-bold'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSubmission}
                                className='flex-1 py-3 bg-[#49bace] hover:bg-[#3a9cba] rounded-xl text-white font-bold'
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-top duration-300 ${
                    toast.type === 'success' ? 'bg-emerald-900/90 border border-emerald-500/50 text-emerald-100' :
                    toast.type === 'error' ? 'bg-red-900/90 border border-red-500/50 text-red-100' :
                    'bg-blue-900/90 border border-blue-500/50 text-blue-100'
                }`}>
                    <div className='flex items-center space-x-2'>
                        <div className={`w-2 h-2 rounded-full ${
                            toast.type === 'success' ? 'bg-emerald-400' :
                            toast.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                        }`}></div>
                        <span className='font-medium text-sm'>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Bind