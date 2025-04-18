// Interface untuk Task
export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  priority?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: number;
}

// Interface untuk data pembuatan Task baru
export interface CreateTaskInput {
  title: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
  category?: string;
  priority?: string;
  userId?: number;
}

// Interface untuk data update Task
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
  category?: string;
  priority?: string;
} 