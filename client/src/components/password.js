import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, OctagonAlert } from 'lucide-react'

const Password = () => {
    const navigate = useNavigate()
    
    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }
    }, [navigate])
    
    return (
        <div className='w-full'>
        <div className='relative w-full'>
            <div className='h-14 bg-[#312c42] flex justify-center items-center'>
                <span className='text-xl opacity-65 text-white'>Password</span>
            </div>

            <div className='absolute top-4 left-5 cursor-pointer text-white' onClick={()=>{navigate('/mine')}}>
                <ChevronLeft className='opacity-65' />
            </div>
        </div>
            
            <div className='h-16 mt-5 mx-5 opacity-75 flex justify-around bg-[#212431] cursor-pointer rounded-2xl items-center' onClick={()=>{navigate('/transcation')}}>
                <span className='text-lg'>Transaction password</span>
                <ChevronRight className='opacity-75' />
            </div>

            <div className='h-16 mt-5 mx-5 opacity-75 flex justify-around bg-[#212431] cursor-pointer rounded-2xl items-center' onClick={()=>{navigate('/authpass')}}>
                <span className='text-lg'>Login password</span>
                <ChevronRight className='opacity-75' />
            </div>
            
        </div>
    )
}

export default Password
