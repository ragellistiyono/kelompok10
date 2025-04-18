import { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/user.controller';
import {
  validateUserCreation,
  validateUserUpdate,
  validateIdParam
} from '../middleware/validation.middleware';

const router = Router();

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', validateIdParam, getUserById);

// Create new user
router.post('/', validateUserCreation, createUser);

// Update user
router.put('/:id', validateIdParam, validateUserUpdate, updateUser);

// Delete user
router.delete('/:id', validateIdParam, deleteUser);

export default router; 