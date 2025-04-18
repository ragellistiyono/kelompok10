import { Request, Response } from 'express';
import { 
  findAllTasks, 
  findTaskById, 
  createNewTask, 
  updateExistingTask, 
  deleteExistingTask,
  findTasksByUserId,
  findTasksByCategory,
  findTasksByDueDate,
  findCompletedTasks
} from '../services/task.service';
import { CreateTaskInput, UpdateTaskInput } from '../models/task.model';
import { catchAsync } from '../utils/errorHandler';

export const getAllTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await findAllTasks();
  res.json(tasks);
});

export const getTasksByUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const tasks = await findTasksByUserId(Number(userId));
  res.json(tasks);
});

export const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await findTaskById(Number(id));
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
});

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const taskData: CreateTaskInput = req.body;
  const task = await createNewTask(taskData);
  res.status(201).json(task);
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const taskData: UpdateTaskInput = req.body;
  
  const task = await updateExistingTask(Number(id), taskData);
  res.json(task);
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await deleteExistingTask(Number(id));
  res.status(204).send();
});

export const getTasksByCategory = catchAsync(async (req: Request, res: Response) => {
  const { category } = req.params;
  const tasks = await findTasksByCategory(category);
  res.json(tasks);
});

export const getTasksForToday = catchAsync(async (req: Request, res: Response) => {
  const today = new Date();
  const tasks = await findTasksByDueDate(today);
  res.json(tasks);
});

export const getTasksForTomorrow = catchAsync(async (req: Request, res: Response) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tasks = await findTasksByDueDate(tomorrow);
  res.json(tasks);
});

export const getCompletedTasks = catchAsync(async (req: Request, res: Response) => {
  const tasks = await findCompletedTasks();
  res.json(tasks);
}); 