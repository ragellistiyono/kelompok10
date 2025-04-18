import { Message } from "../components/ui/askAspri";

export interface CompletedAITask {
  id: number;
  title: string;
  description: string;
  content: Message[];
  completed: boolean;
  timestamp: Date;
  category: string;
}

// LocalStorage key for completed AI tasks
const COMPLETED_AI_TASKS_KEY = "completed_ai_tasks";

// Get stored completed AI tasks from localStorage
export const getCompletedAITasks = (): CompletedAITask[] => {
  const stored = localStorage.getItem(COMPLETED_AI_TASKS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Convert string timestamps back to Date objects
      return parsed.map((task: any) => ({
        ...task,
        timestamp: new Date(task.timestamp),
        content: task.content.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (e) {
      console.error("Error parsing stored completed AI tasks:", e);
    }
  }
  return [];
};

// Save completed AI tasks to localStorage
export const saveCompletedAITasks = (tasks: CompletedAITask[]): void => {
  localStorage.setItem(COMPLETED_AI_TASKS_KEY, JSON.stringify(tasks));
};

// Add new completed AI task
export const addCompletedAITask = (task: CompletedAITask): void => {
  const tasks = getCompletedAITasks();
  tasks.push(task);
  saveCompletedAITasks(tasks);
};

// Delete completed AI task
export const deleteCompletedAITask = (index: number): void => {
  const tasks = getCompletedAITasks();
  tasks.splice(index, 1);
  saveCompletedAITasks(tasks);
};

// Convert AI tasks to Todo tasks format for displaying in the Completed section
export const convertAITasksToTodoFormat = () => {
  const aiTasks = getCompletedAITasks();
  
  return aiTasks.map((task, index) => ({
    id: -1000 - index, // Use negative IDs to avoid collision with regular tasks
    title: task.title,
    description: task.description,
    completed: true,
    category: task.category,
    timestamp: task.timestamp,
    aiContent: task.content, // Additional field to store AI conversation
    isAITask: true // Flag to identify this as an AI task
  }));
}; 