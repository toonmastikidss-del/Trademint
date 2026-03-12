import { User } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const AuthIcon = () => {
    const navigate = useNavigate();
  return (
    <div className='absolute z-10 right-7 top-8 md:right-10 rounded-full bg-[#0f172a] p-2.5 cursor-pointer hover:scale-110 transition-all border-2 border-blue-500 shadow-lg shadow-blue-500/20'
    onClick={()=> {navigate('/login')}}
    >
        <User size={24} className="text-white" />
    </div>
  )
}

export default AuthIcon
