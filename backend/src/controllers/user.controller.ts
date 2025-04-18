import { Request, Response } from 'express';
import { 
  findAllUsers, 
  findUserById, 
  createNewUser, 
  updateExistingUser, 
  deleteExistingUser 
} from '../services/user.service';
import { CreateUserInput, UpdateUserInput } from '../models/user.model';
import { catchAsync } from '../utils/errorHandler';

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await findAllUsers();
  res.json(users);
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await findUserById(Number(id));
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const userData: CreateUserInput = req.body;
  
  // Validate input
  if (!userData.email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const user = await createNewUser(userData);
  res.status(201).json(user);
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userData: UpdateUserInput = req.body;
  
  const user = await updateExistingUser(Number(id), userData);
  res.json(user);
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  await deleteExistingUser(Number(id));
  res.status(204).send();
}); 