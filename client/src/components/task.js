import React, { useState, useEffect } from 'react'
import { CheckCircle, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_CONFIG } from '../config/apiConfig'

const Task = () => {
  const [selected, setSelected] = React.useState('Daily');
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const navigate = useNavigate();

  const handleSelect = (option) => {
    setSelected(option);
  }

  // Fetch available tasks from API
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/task/active`);
      setTasks(response.data);
    } catch (error) {
      // console.error('Error fetching tasks:', error);
      // Fallback to sample data if API fails
      const sampleTasks = [
        {
          _id: '1',
          title: 'Complete your first deposit',
          description: 'Make your first deposit to get started',
          reward: 50,
          type: 'Daily',
          category: 'deposit',
          targetValue: 1,
          isActive: true
        },
        {
          _id: '2',
          title: 'Refer 3 friends',
          description: 'Invite 3 friends to join the platform',
          reward: 100,
          type: 'Weekly',
          category: 'referral',
          targetValue: 3,
          isActive: true
        },
        {
          _id: '3',
          title: 'Complete 5 transactions',
          description: 'Complete 5 successful transactions',
          reward: 75,
          type: 'Monthly',
          category: 'transaction',
          targetValue: 5,
          isActive: true
        }
      ];
      setTasks(sampleTasks);
    }
  };

  // Fetch user's completed tasks
  const fetchUserTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUserTasks([]);
        return;
      }
      
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/task/user-tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserTasks(response.data);
    } catch (error) {
      // console.error('Error fetching user tasks:', error);
      setUserTasks([]);
    }
  };

  // Get tasks based on selected type and user completion status
  const getTasks = () => {
    const filteredTasks = tasks.filter(task => task.type === selected && task.isActive);
    
    // Map tasks to include completion status
    return filteredTasks.map(task => {
      const userTask = userTasks.find(ut => ut.taskId && ut.taskId.toString() === task._id.toString());
      return {
        id: task._id,
        title: task.title,
        reward: `₹${task.reward}`,
        completed: userTask ? ['completed', 'claimed'].includes(userTask.status) : false
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchTasks(), fetchUserTasks()]);
    };
    
    fetchData();
  }, [selected]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#101821] pb-24">
      <div className='sticky top-0 z-50 w-full'>
        <div className='h-14 bg-[#312c42] flex justify-center items-center'>
          <span className='text-xl opacity-65 text-white'>Tasks</span>
        </div>
        <div className='absolute top-4 left-5 cursor-pointer text-white' onClick={() => { navigate(-1) }}>
          <ChevronLeft className='opacity-65' />
        </div>
      </div>

      <div className='mx-5 w-[90%]'>
        <div className='bg-slate-800 py-5 rounded-xl w-full flex flex-row justify-around mt-5'>
          <div className="text-center text-white p-2">
            <CheckCircle color='skyblue' className="mb-2" /> Daily
          </div>
          <div className="text-center text-white p-2">
            <CheckCircle color='skyblue' className="mb-2" /> Weekly
          </div>
          <div className="text-center text-white p-2">
            <CheckCircle color='skyblue' className="mb-2" /> Monthly
          </div>
        </div>

        <div className='flex w-full justify-around px-2 mt-6'>
          <div
            className={`px-8 h-10 flex items-center rounded-xl ${selected === 'Daily' ? 'bg-[#183439] text-[#49bace] outline-[#49bace]' : 'text-slate-200'}`}
            style={selected === 'Daily' ? { outline: '2px solid #49bace' } : {}}
            onClick={() => handleSelect('Daily')}
          >
            Daily
          </div>
          <div
            className={`px-8 h-10 flex items-center rounded-xl ${selected === 'Weekly' ? 'bg-[#183439] text-[#49bace]' : 'text-slate-200'}`}
            style={selected === 'Weekly' ? { outline: '2px solid #49bace' } : {}}
            onClick={() => handleSelect('Weekly')}
          >
            Weekly
          </div>
          <div
            className={`px-8 h-10 flex items-center rounded-xl ${selected === 'Monthly' ? 'bg-[#183439] text-[#49bace]' : 'text-slate-200'}`}
            style={selected === 'Monthly' ? { outline: '2px solid #49bace' } : {}}
            onClick={() => handleSelect('Monthly')}
          >
            Monthly
          </div>
        </div>

        <div className='mt-8 space-y-4'>
          {getTasks().map((task) => (
            <div 
              key={task.id} 
              className={`p-4 rounded-xl border ${
                task.completed 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <div className='flex justify-between items-center'>
                <div className='flex items-center space-x-3'>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    task.completed ? 'bg-green-500' : 'bg-slate-600'
                  }`}>
                    {task.completed && <CheckCircle size={16} className="text-white" />}
                  </div>
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'text-green-300' : 'text-white'}`}>
                      {task.title}
                    </h3>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-[#49bace] font-bold'>{task.reward}</div>
                  {task.completed && (
                    <div className='text-green-400 text-xs'>Completed</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Task