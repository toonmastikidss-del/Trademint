import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft,} from 'lucide-react'

const White = () => {
    const navigate = useNavigate();
    return (
       <>
        <div className='w-full'>
            <div className='relative'>
                <div className='h-14 bg-[#312c42] flex justify-center items-center'>
                    <span className='text-xl opacity-65'>White Paper</span>
                </div>

                <div className='absolute top-4 left-5 cursor-pointer' onClick={()=>{navigate('/home')}}>
                    <ChevronLeft className='opacity-65' />
                </div>
            </div>

            <div className="bg-white min-h-screen h-full w-full">
            
            </div>

            
        </div>
        
       </>
    )
}

export default White
