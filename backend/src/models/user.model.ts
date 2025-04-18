// Interface untuk User
export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Interface untuk data pembuatan User baru
export interface CreateUserInput {
  email: string;
  name?: string;
}

// Interface untuk data update User
export interface UpdateUserInput {
  email?: string;
  name?: string;
} 