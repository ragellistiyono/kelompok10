import { Router } from 'express';
import { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask,
  getTasksByUser,
  getTasksByCategory,
  getTasksForToday,
  getTasksForTomorrow,
  getCompletedTasks
} from '../controllers/task.controller';
import { validateTaskCreation, validateTaskUpdate } from '../middleware/task.middleware';
import { validateIdParam } from '../middleware/validation.middleware';

const router = Router();

// Get all tasks
router.get('/', getAllTasks);

// Get today's tasks
router.get('/date/today', getTasksForToday);

// Get tomorrow's tasks
router.get('/date/tomorrow', getTasksForTomorrow);

// Get completed tasks
router.get('/status/completed', getCompletedTasks);

// Get tasks for a specific category
router.get('/category/:category', getTasksByCategory);

// Get tasks for a specific user
router.get('/user/:userId', validateIdParam, getTasksByUser);

// Get task by ID
router.get('/:id', validateIdParam, getTaskById);

// Create task
router.post('/', validateTaskCreation, createTask);

// Update task
router.put('/:id', validateIdParam, validateTaskUpdate, updateTask);

// Delete task
router.delete('/:id', validateIdParam, deleteTask);

export default router; 