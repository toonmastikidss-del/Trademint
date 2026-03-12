import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, OctagonAlert, Copy, Share2 } from 'lucide-react'
import axios from 'axios'
import { API_CONFIG } from '../config/apiConfig'

const Mission = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [referralData, setReferralData] = useState({
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalRewards: 0,
        referrals: []
    })
    const [myReferralCode, setMyReferralCode] = useState('')
    const [shareLink, setShareLink] = useState('')
    const [yesterdayCommission, setYesterdayCommission] = useState(0)
    const [showAgentModal, setShowAgentModal] = useState(false)
    const [applyingForAgent, setApplyingForAgent] = useState(false)

    // Fetch referral data
    useEffect(() => {
        const fetchReferralData = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) {
                    console.error('User not authenticated')
                    return
                }

                // Fetch referral stats
                const statsRes = await axios.get(`${API_CONFIG.BASE_URL}/api/referral/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                // Fetch my referral code
                const codeRes = await axios.get(`${API_CONFIG.BASE_URL}/api/referral/my-code`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                setReferralData(statsRes.data)
                setMyReferralCode(codeRes.data.referralCode)
                setShareLink(codeRes.data.shareLink)

                // Calculate yesterday's commission (from completed referrals)
                const yesterday = new Date()
                yesterday.setDate(yesterday.getDate() - 1)
                yesterday.setHours(0, 0, 0, 0)

                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() - 1)
                tomorrow.setHours(23, 59, 59, 999)

                const yesterdayReferrals = statsRes.data.referrals.filter(r => {
                    const completedAt = r.completedAt ? new Date(r.completedAt) : null
                    return completedAt && completedAt >= yesterday && completedAt <= tomorrow
                })

                const commission = yesterdayReferrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0)
                setYesterdayCommission(commission)

                setLoading(false)
            } catch (error) {
                console.error('Error fetching referral data:', error)
                setLoading(false)
            }
        }

        fetchReferralData()
    }, [])

    // Copy referral code to clipboard
    const copyReferralCode = () => {
        navigator.clipboard.writeText(myReferralCode)
        alert('Referral code copied to clipboard!')
    }

    // Share referral link
    const shareReferralLink = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join TradeMint',
                    text: `Join me on TradeMint! Use my referral code: ${myReferralCode}`,
                    url: shareLink
                })
            } catch (error) {
                console.log('Error sharing:', error)
            }
        } else {
            // Fallback: copy link to clipboard
            navigator.clipboard.writeText(shareLink)
            alert('Share link copied to clipboard!')
        }
    }

    // Apply for agent
    const applyForAgent = async () => {
        try {
            setApplyingForAgent(true)
            const token = localStorage.getItem('token')
            
            if (!token) {
                alert('Please login first')
                return
            }

            // Check if user has enough balance
            const user = JSON.parse(localStorage.getItem('user'))
            if (!user || !user.balance) {
                alert('User data not found')
                return
            }

            if (user.balance < 500) {
                alert(`Insufficient balance. You need ₹500 to become an agent. Current balance: ₹${user.balance.toFixed(2)}`)
                return
            }

            // Confirm application
            const confirmed = window.confirm(
                'Become an Agent for ₹500!\n\n' +
                'Benefits:\n' +
                '✓ Higher commission rates\n' +
                '✓ Priority support\n' +
                '✓ Exclusive rewards\n\n' +
                '₹500 will be deducted from your balance. Continue?'
            )

            if (!confirmed) {
                setApplyingForAgent(false)
                return
            }

            // Call backend API to apply for agent
            const response = await axios.post(
                `${API_CONFIG.BASE_URL}/api/referral/apply-agent`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            if (response.status === 200) {
                alert('🎉 Congratulations! You are now an Agent!\n\n₹500 has been deducted from your balance.')
                setShowAgentModal(false)
                
                // Update local storage balance
                user.balance -= 500
                localStorage.setItem('user', JSON.stringify(user))
                
                // Refresh page to show updated data
                window.location.reload()
            }
        } catch (error) {
            console.error('Error applying for agent:', error)
            alert(error.response?.data?.error || 'Failed to apply for agent. Please try again.')
        } finally {
            setApplyingForAgent(false)
        }
    }

    if (loading) {
        return (
            <div className='w-full min-h-screen bg-[#101821] flex items-center justify-center'>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49bace]"></div>
            </div>
        )
    }
    return (
       <>
        <div className='w-full'>
          <div className='sticky top-0 z-50 w-full'>
            <div className='h-14 bg-[#312c42] flex justify-center items-center'>
                <span className='text-xl opacity-65 text-white'>Mission</span>
            </div>

            <div className='absolute top-4 left-5 cursor-pointer text-white' onClick={()=>{navigate('/home')}}>
                <ChevronLeft className='opacity-65' />
            </div>
          </div>
            <div className="bg-[#31333b] min-h-screen flex justify-center items-center px-4 pt-3 py-10">
            <div className="w-full max-w-md overflow-hidden">

                {/* Header Section */}
                <div className="text-center p-6 relative">
                    <h2 className="text-lg font-semibold text-white">Agency</h2>
                    <div className="text-4xl font-bold text-white mt-2">₹{yesterdayCommission.toFixed(2)}</div>
                    <p className="text-white mt-1 text-sm">Yesterday's total commission</p>
                    <p className="text-gray-100 text-xs">Upgrade the level to increase commission income</p>
                </div>

                {/* Subordinates Section */}
                <div className="flex">
                    {/* Direct Subordinates */}
                    <div className="w-1/2 text-center p-4 border-r border-gray-700">
                        <h3 className="text-red-500 font-semibold mb-2">Direct subordinates</h3>
                        <div className="text-white space-y-2">
                            <div>
                                <p className="text-sm font-bold">{referralData.totalReferrals}</p>
                                <p className="text-xs text-gray-400">number of register</p>
                            </div>
                            <div>
                                <p className="text-green-500 font-bold">{referralData.completedReferrals}</p>
                                <p className="text-xs text-gray-400">Deposit number</p>
                            </div>
                            <div>
                                <p className="text-white font-bold">₹{(referralData.completedReferrals * 100).toFixed(2)}</p>
                                <p className="text-xs text-gray-400">Deposit amount</p>
                            </div>
                            <div>
                                <p className="text-white font-bold">{referralData.completedReferrals}</p>
                                <p className="text-xs text-gray-400">Number of people making first deposit</p>
                            </div>
                        </div>
                    </div>
                
                    {/* Team Subordinates */}
                    <div className="w-1/2 text-center p-4">
                        <h3 className="text-red-500 font-semibold mb-2">Team subordinates</h3>
                        <div className="text-white space-y-2">
                            <div>
                                <p className="text-sm font-bold">{referralData.totalReferrals}</p>
                                <p className="text-xs text-gray-400">number of register</p>
                            </div>
                            <div>
                                <p className="text-green-500 font-bold">{referralData.completedReferrals}</p>
                                <p className="text-xs text-gray-400">Deposit number</p>
                            </div>
                            <div>
                                <p className="text-white font-bold">₹{(referralData.completedReferrals * 100).toFixed(2)}</p>
                                <p className="text-xs text-gray-400">Deposit amount</p>
                            </div>
                            <div>
                                <p className="text-white font-bold">{referralData.completedReferrals}</p>
                                <p className="text-xs text-gray-400">Number of people making first deposit</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invitation Link */}
                <div 
                    onClick={shareReferralLink}
                    className="bg-[#49bace] rounded-lg text-white text-center py-3 cursor-pointer hover:bg-[#3da0bb] transition-all mb-4"
                >
                    <div className="flex items-center justify-center space-x-2">
                        <Share2 size={18} />
                        <p className="font-bold uppercase text-sm">Refer & Earn</p>
                    </div>
                </div>

                {/* Apply for Agent Button */}
                <div 
                    onClick={() => setShowAgentModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white text-center py-3 cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/30"
                >
                    <div className="flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="font-bold uppercase text-sm">Become an Agent - ₹500</p>
                    </div>
                </div>

                {/* Partner Rewards */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-[#49bace;] text-white rounded-full p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25a3.75 3.75 0 00-7.5 0V9m9.75 6.75H5.25m12.75 0v3.75a3.75 3.75 0 01-7.5 0v-3.75"
                                />
                            </svg>
                        </div>
                        <p className="text-white font-medium">Partner rewards</p>
                    </div>
                    <div className="text-white font-bold">₹{referralData.totalRewards.toFixed(2)}</div>
                    <ChevronRight size={20} className="text-gray-400" />
                </div>

                {/* Copy Invitation Code */}
                <div 
                    onClick={copyReferralCode}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#2a2d3e] transition-all rounded-lg"
                >
                    <div className="flex items-center space-x-2">
                        <div className="bg-[#49bace;] text-white rounded-full p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 17.25v-3.375c0-.621-.504-1.125-1.125-1.125h-9.75a1.125 1.125 0 00-1.125 1.125v3.375m12 0a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0016.5 4.5h-9a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9z"
                                />
                            </svg>
                        </div>
                        <p className="text-white font-medium">Copy invitation code</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <p className="text-gray-300 font-bold">{myReferralCode || '---'}</p>
                        <Copy size={18} className="text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Agent Application Modal */}
            {showAgentModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#212431] rounded-3xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Become an Agent</h2>
                            <p className="text-gray-400 text-sm">Unlock exclusive benefits and earn more!</p>
                        </div>

                        {/* Benefits List */}
                        <div className="bg-[#2a2d3e] rounded-xl p-4 mb-6">
                            <h3 className="text-white font-bold text-sm mb-3 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                Agent Benefits:
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Higher commission rates (up to 20%)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Priority customer support</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Exclusive monthly bonuses</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Special agent badge & recognition</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Advanced analytics dashboard</span>
                                </li>
                            </ul>
                        </div>

                        {/* Cost Display */}
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-amber-400 text-sm font-medium">One-time Fee:</span>
                                <span className="text-white font-bold text-xl">₹500</span>
                            </div>
                            <p className="text-amber-200 text-xs">This amount will be deducted from your balance</p>
                        </div>

                        {/* Requirements */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                            <h3 className="text-blue-400 font-bold text-sm mb-2">Requirements:</h3>
                            <ul className="space-y-1 text-xs text-gray-300">
                                <li>• Minimum balance of ₹500</li>
                                <li>• At least 5 successful referrals</li>
                                <li>• Active account for 7+ days</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowAgentModal(false)}
                                disabled={applyingForAgent}
                                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyForAgent}
                                disabled={applyingForAgent}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {applyingForAgent ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>Pay ₹500 & Become Agent</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>

            
        </div>
        
       </>
    )
}

export default Mission
