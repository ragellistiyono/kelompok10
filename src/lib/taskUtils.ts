interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: string;
    category?: string;
    priority?: string;
  }
  
  // LocalStorage key for tasks
  export const LOCAL_STORAGE_KEY = 'todo_tasks';
  
  // Get stored tasks from localStorage
  export const getStoredTasks = (): Task[] => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored tasks:', e);
      }
    }
    return []; // Return empty array if nothing is stored
  };
  
  // Save tasks to localStorage
  export const saveTasks = (tasks: Task[]): void => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  };
  
  // Check if two dates are the same day
  export const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };
  
  // Get today's tasks
  export const getTodayTasks = (): Task[] => {
    const tasks = getStoredTasks();
    const today = new Date();
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return isSameDay(dueDate, today);
    });
  };
  
  // Get tomorrow's tasks
  export const getTomorrowTasks = (): Task[] => {
    const tasks = getStoredTasks();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return isSameDay(dueDate, tomorrow);
    });
  };
  
  // Get upcoming tasks (tasks due after tomorrow)
  export const getUpcomingTasks = (): Task[] => {
    const tasks = getStoredTasks();
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= dayAfterTomorrow;
    });
  };
  
  // Format date for display
  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };