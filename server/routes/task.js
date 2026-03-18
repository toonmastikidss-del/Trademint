const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Public endpoint to get active tasks
router.get('/active', async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching active tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all tasks (for admin panel)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin by checking role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const tasks = await Task.find().sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new task (for admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin by checking role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description, reward, type, category, targetValue } = req.body;

    // Validate required fields
    if (!title || !reward) {
      return res.status(400).json({ error: 'Title and reward are required' });
    }

    // Validate reward is a number
    if (isNaN(reward) || reward <= 0) {
      return res.status(400).json({ error: 'Reward must be a positive number' });
    }

    // Validate targetValue if provided
    if (targetValue && isNaN(targetValue)) {
      return res.status(400).json({ error: 'Target value must be a number' });
    }

    const newTask = new Task({
      title,
      description: description || '',
      reward: parseFloat(reward),
      type: type || 'Daily',
      category: category || 'other',
      targetValue: targetValue ? parseInt(targetValue) : 1
    });

    await newTask.save();

    res.status(201).json({ 
      message: 'Task created successfully',
      task: newTask 
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task (for admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin by checking role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { title, description, reward, type, category, targetValue } = req.body;

    // Validate required fields if provided
    if (title === '') {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    if (reward && (isNaN(reward) || reward <= 0)) {
      return res.status(400).json({ error: 'Reward must be a positive number' });
    }

    if (targetValue && isNaN(targetValue)) {
      return res.status(400).json({ error: 'Target value must be a number' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(reward !== undefined && { reward: parseFloat(reward) }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(targetValue !== undefined && { targetValue: parseInt(targetValue) })
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ 
      message: 'Task updated successfully',
      task: updatedTask 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle task active status (for admin)
router.put('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin by checking role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.isActive = !task.isActive;
    await task.save();

    res.json({ 
      message: `Task ${task.isActive ? 'activated' : 'deactivated'} successfully`,
      task 
    });
  } catch (error) {
    console.error('Error toggling task status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task (for admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin by checking role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ 
      message: 'Task deleted successfully',
      task: deletedTask 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all user tasks (for admin panel or individual users)
router.get('/user-tasks', authenticateToken, async (req, res) => {
  try {
    const UserTask = require('../models/UserTask');
    
    let userTasks;
    
    // Check if user is admin
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      // Admin sees all user tasks
      userTasks = await UserTask.find()
        .populate('userId', 'name phone')
        .populate('taskId', 'title reward type category')
        .sort({ createdAt: -1 });
    } else {
      // Regular user sees only their own tasks
      userTasks = await UserTask.find({ userId: req.user.id })
        .populate('taskId', 'title reward type category')
        .sort({ createdAt: -1 });
    }

    res.json(userTasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's tasks
router.get('/my-tasks/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the requesting user is authorized
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view these tasks' });
    }

    const UserTask = require('../models/UserTask');
    
    const userTasks = await UserTask.find({ userId })
      .populate('taskId', 'title reward type category targetValue')
      .sort({ createdAt: -1 });

    res.json(userTasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Claim task reward (mark task as completed)
router.post('/claim/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const UserTask = require('../models/UserTask');
    const Task = require('../models/Task');
    const User = require('../models/User');

    // Get the task details
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user already has a record for this task
    let userTask = await UserTask.findOne({ userId, taskId });
    
    if (!userTask) {
      // Create a new user task record
      userTask = new UserTask({
        userId,
        taskId,
        status: 'completed',
        completedAt: new Date()
      });
    } else {
      // Update existing record
      if (userTask.status === 'claimed') {
        return res.status(400).json({ error: 'Task reward already claimed' });
      }
      userTask.status = 'completed';
      userTask.completedAt = new Date();
    }

    await userTask.save();

    // Update user's balance with the task reward
    const user = await User.findById(userId);
    if (user) {
      user.balance += task.reward;
      await user.save();
      
      // Track activity for quantify mode switching (switches to Current mode)
      try {
        const Quantify = require('../models/Quantify');
        let quantifyData = await Quantify.findOne({ userId });
        if (quantifyData) {
          // Check if quantifying was active before task reward
          const wasQuantifyingActive = quantifyData.isQuantifying;
          
          // Switch to CURRENT mode with NEW balance
          quantifyData.mode = 'current';
          quantifyData.balance = user.balance; // Update to new balance
          quantifyData.totalRevenue = user.balance; // Reset total revenue to new balance
          
          // If quantifying was active, automatically start calculating earnings
          if (wasQuantifyingActive) {
            // Calculate 6% earning on the new balance immediately
            const earning = user.balance * 0.06;
            quantifyData.todayEarning = earning;
            quantifyData.totalRevenue = user.balance + earning;
            quantifyData.isQuantifying = true;
            
            // Update user's quantify field
            user.quantify = quantifyData.totalRevenue;
            await user.save();
            
            console.log('📊 AUTO-RESTARTED QUANTIFYING WITH TASK REWARD');
            console.log('New Balance:', user.balance);
            console.log('Calculated Earning (6%):', earning.toFixed(2));
            console.log('New Total Revenue:', quantifyData.totalRevenue.toFixed(2));
          } else {
            // If not actively quantifying, reset earnings to 0
            quantifyData.todayEarning = 0;
            quantifyData.isQuantifying = false;
          }
          
          quantifyData.lastActivityDate = new Date();
          await quantifyData.save();
          
          console.log('=== TASK REWARD ACTIVITY TRACKED ===');
          console.log('New Balance:', user.balance);
          console.log('Mode switched to:', quantifyData.mode);
          console.log('Total Revenue:', quantifyData.totalRevenue.toFixed(2));
          console.log('Today Earning:', quantifyData.todayEarning.toFixed(2));
          console.log('Is Quantifying:', quantifyData.isQuantifying);
          console.log('================================');
        }
      } catch (quantifyError) {
        console.error('Error updating quantify activity:', quantifyError);
      }
    }

    res.json({ 
      message: 'Task completed successfully and reward added',
      userTask 
    });
  } catch (error) {
    console.error('Error claiming task reward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Claim task reward (mark task as claimed after completion)
router.put('/claim-reward/:userTaskId', authenticateToken, async (req, res) => {
  try {
    const { userTaskId } = req.params;
    const userId = req.user.id;

    const UserTask = require('../models/UserTask');
    const Task = require('../models/Task');
    const User = require('../models/User');

    // Find the user task
    const userTask = await UserTask.findById(userTaskId);
    if (!userTask) {
      return res.status(404).json({ error: 'User task not found' });
    }

    // Check if the requesting user is authorized
    if (userTask.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to claim this task reward' });
    }

    // Check if task is completed and not already claimed
    if (userTask.status !== 'completed') {
      return res.status(400).json({ error: 'Task must be completed before claiming reward' });
    }

    if (userTask.status === 'claimed') {
      return res.status(400).json({ error: 'Task reward already claimed' });
    }

    // Get the task details
    const task = await Task.findById(userTask.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update user task status to claimed
    userTask.status = 'claimed';
    userTask.claimedAt = new Date();
    await userTask.save();

    // Update user's balance with the task reward
    const user = await User.findById(userId);
    if (user) {
      user.balance += task.reward;
      await user.save();
    }

    res.json({ 
      message: 'Task reward claimed successfully',
      userTask 
    });
  } catch (error) {
    console.error('Error claiming task reward:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's reward history
router.get('/rewards/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const UserTask = require('../models/UserTask');
    const Task = require('../models/Task');

    // Find all claimed tasks for this user
    const userTasks = await UserTask.find({ 
      userId, 
      status: { $in: ['completed', 'claimed'] } 
    })
    .sort({ completedAt: -1 })
    .limit(100);

    // Get task details for each user task
    const rewards = [];
    for (const userTask of userTasks) {
      const task = await Task.findById(userTask.taskId);
      if (task) {
        rewards.push({
          taskId: task._id,
          taskTitle: task.title,
          taskType: task.type,
          amount: task.reward,
          completedAt: userTask.completedAt || userTask.updatedAt,
          claimedAt: userTask.claimedAt,
          status: userTask.status
        });
      }
    }

    res.json({ rewards });

  } catch (error) {
    console.error('Error fetching reward history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;