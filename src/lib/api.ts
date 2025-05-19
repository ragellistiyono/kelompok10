// API services for tasks
import { getCategoryKey } from "./categoryUtils";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  userId?: number;
  meta?: {
    categoryKey?: string;
    creationLanguage?: string;
  };
}

interface CreateTaskInput {
  title: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
  category?: string;
  priority?: string;
  userId?: number;
  meta?: {
    categoryKey?: string;
    creationLanguage?: string;
  };
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: string;
  category?: string;
  priority?: string;
}

// Use the correct port where your backend is running
const API_URL = 'http://localhost:5000/api';

// Helper function to check if the backend is available
let isBackendAvailable = false; // Default to false to prioritize offline mode if no check has been made yet
const LOCAL_STORAGE_KEY = 'todo_tasks';

// Get stored tasks from localStorage
export const getStoredTasks = (): any[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      const tasks = JSON.parse(stored);
      console.log('Retrieved tasks from localStorage:', tasks);
      return tasks;
    } catch (e) {
      console.error('Error parsing stored tasks:', e);
    }
  }
  return []; // Return empty array if nothing stored
};

// Save tasks to localStorage
export const saveTasks = (tasks: any[]) => {
  console.log('Saving tasks to localStorage:', tasks);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/tasks`, { 
      method: 'GET',
      // Add cache: 'no-store' to prevent caching
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    isBackendAvailable = response.ok;
    console.log('Backend availability check:', isBackendAvailable ? 'AVAILABLE' : 'UNAVAILABLE');
    return isBackendAvailable;
  } catch (error) {
    console.error('Backend check failed:', error);
    isBackendAvailable = false;
    return false;
  }
};

// Helper function for API requests with improved error handling
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: any
): Promise<T> {
  try {
    // Check backend availability for all operations
    await checkBackendStatus();
    
    // If backend is not available, handle differently based on the request type
    if (!isBackendAvailable) {
      console.log('Backend unavailable, using localStorage for', method, 'operation');
      
      // GET operations return data from localStorage
      if (method === 'GET') {
        const tasks = getStoredTasks();
        console.log('Returning local tasks:', tasks);
        return tasks as unknown as T;
      }
      
      // POST operations add to localStorage
      if (method === 'POST' && endpoint === '/tasks' && body) {
        const tasks = getStoredTasks();
        const newId = Math.max(0, ...tasks.map((t: any) => t.id), 0) + 1;
        
        // Ensure we have a category key
        if (body.category && (!body.meta || !body.meta.categoryKey)) {
          if (!body.meta) body.meta = {};
          body.meta.categoryKey = getCategoryKey(body.category);
        }
        
        const newTask = { 
          ...body, 
          id: newId, 
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks(tasks);
        console.log('Added new task to localStorage:', newTask);
        return newTask as unknown as T;
      }
      
      // PUT operations update localStorage
      if (method === 'PUT' && endpoint.startsWith('/tasks/') && body) {
        const id = Number(endpoint.split('/').pop());
        const tasks = getStoredTasks();
        const updatedTasks = tasks.map((task: any) => {
          if (task.id === id) {
            return { 
              ...task, 
              ...body,
              updatedAt: new Date().toISOString()
            };
          }
          return task;
        });
        
        saveTasks(updatedTasks);
        const updatedTask = updatedTasks.find((task: any) => task.id === id);
        console.log('Updated task in localStorage:', updatedTask);
        return updatedTask as unknown as T;
      }
      
      // DELETE operations remove from localStorage
      if (method === 'DELETE' && endpoint.startsWith('/tasks/')) {
        const id = Number(endpoint.split('/').pop());
        const tasks = getStoredTasks();
        const filteredTasks = tasks.filter((task: any) => task.id !== id);
        
        saveTasks(filteredTasks);
        console.log('Removed task', id, 'from localStorage');
        return {} as T;
      }
      
      throw new Error('Operation not supported in offline mode');
    }
    
    // If backend is available, proceed with actual API request
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Add additional headers to prevent caching
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      // Add cache: 'no-store' to prevent caching
      cache: 'no-store'
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`Making ${method} request to ${API_URL}${endpoint}`, 
                body ? { body } : '');
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    // For DELETE operations with 204 status
    if (response.status === 204) {
      return {} as T;
    }
    
    // Try to parse JSON even for error responses to get error details
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
      console.warn('Non-JSON response:', data);
      data = { message: data || 'Unexpected response format' };
    }
    
    if (!response.ok) {
      const errorMessage = data?.error || data?.message || 'Something went wrong';
      console.error(`API Error: ${response.status} ${response.statusText}`, data);
      throw new Error(errorMessage);
    }
    
    // For successful API requests, also update localStorage as a backup
    if (method === 'GET' && endpoint === '/tasks') {
      saveTasks(data);
      console.log('Updated localStorage with API data');
    }
    
    return data;
  } catch (error) {
    // Check backend status on error
    checkBackendStatus();
    
    // Handle network errors more specifically
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error:', error);
      throw new Error('Cannot connect to the server. Please check your network connection or try again later.');
    }
    
    // Pass through errors from fetch or our own error handling
    if (error instanceof Error) {
      throw error;
    }
    
    // Handle unexpected errors
    throw new Error('Network or API request failed');
  }
}

// Task API functions
export const taskApi = {
  // Get all tasks
  getAllTasks: (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks');
  },

  // Get task by ID
  getTaskById: (id: number): Promise<Task> => {
    return apiRequest<Task>(`/tasks/${id}`);
  },

  // Create new task
  createTask: (task: CreateTaskInput): Promise<Task> => {
    return apiRequest<Task>('/tasks', 'POST', task);
  },

  // Update task
  updateTask: (id: number, task: UpdateTaskInput): Promise<Task> => {
    return apiRequest<Task>(`/tasks/${id}`, 'PUT', task);
  },

  // Delete task
  deleteTask: (id: number): Promise<void> => {
    return apiRequest<void>(`/tasks/${id}`, 'DELETE');
  },

  // Get tasks for today
  getTodayTasks: (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks/date/today');
  },

  // Get tasks for tomorrow
  getTomorrowTasks: (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks/date/tomorrow');
  },

  // Get completed tasks
  getCompletedTasks: (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks/status/completed');
  },

  // Get tasks by category
  getTasksByCategory: (category: string): Promise<Task[]> => {
    return apiRequest<Task[]>(`/tasks/category/${category}`);
  }
};

// User API functions
interface User {
  id: number;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  // Get all users
  getAllUsers: (): Promise<User[]> => {
    return apiRequest<User[]>('/users');
  },

  // Get user by ID
  getUserById: (id: number): Promise<User> => {
    return apiRequest<User>(`/users/${id}`);
  },

  // Create new user
  createUser: (user: { email: string; name?: string }): Promise<User> => {
    return apiRequest<User>('/users', 'POST', user);
  }
}; 