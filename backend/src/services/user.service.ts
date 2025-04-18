import { PrismaClient } from '@prisma/client';
import { CreateUserInput, UpdateUserInput } from '../models/user.model';

const prisma = new PrismaClient();

export const findAllUsers = async () => {
  return await prisma.user.findMany();
};

export const findUserById = async (id: number) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

export const createNewUser = async (data: CreateUserInput) => {
  return await prisma.user.create({
    data,
  });
};

export const updateExistingUser = async (id: number, data: UpdateUserInput) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteExistingUser = async (id: number) => {
  return await prisma.user.delete({
    where: { id },
  });
}; 