import { PrismaClient } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput } from '../models/task.model';

const prisma = new PrismaClient();

export const findAllTasks = async () => {
  return await prisma.task.findMany({
    include: {
      user: true,
    },
  });
};

export const findTasksByUserId = async (userId: number) => {
  return await prisma.task.findMany({
    where: {
      userId,
    },
    include: {
      user: true,
    },
  });
};

export const findTaskById = async (id: number) => {
  return await prisma.task.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
};

export const createNewTask = async (data: CreateTaskInput) => {
  return await prisma.task.create({
    data,
    include: {
      user: true,
    },
  });
};

export const updateExistingTask = async (id: number, data: UpdateTaskInput) => {
  return await prisma.task.update({
    where: { id },
    data,
    include: {
      user: true,
    },
  });
};

export const deleteExistingTask = async (id: number) => {
  return await prisma.task.delete({
    where: { id },
  });
};

export const findTasksByCategory = async (category: string) => {
  return await prisma.task.findMany({
    where: {
      category,
    },
    include: {
      user: true,
    },
  });
};

export const findTasksByDueDate = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return await prisma.task.findMany({
    where: {
      dueDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      user: true,
    },
  });
};

export const findCompletedTasks = async () => {
  return await prisma.task.findMany({
    where: {
      completed: true,
    },
    include: {
      user: true,
    },
  });
}; 