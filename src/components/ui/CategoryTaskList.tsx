import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { taskApi } from "../../lib/api";
import { TodoListItem } from "./TodoList";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
  priority?: string;
}

interface CategoryTaskListProps {
  category: string;
  refreshTrigger?: number;
}

// Get stored tasks from localStorage
const getStoredTasks = (): Task[] => {
  const stored = localStorage.getItem('todo_tasks');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored tasks:', e);
    }
  }
  return [];
};

// Save tasks to localStorage
const saveTasks = (tasks: Task[]) => {
  localStorage.setItem('todo_tasks', JSON.stringify(tasks));
};

export const CategoryTaskList: React.FC<CategoryTaskListProps> = ({ category, refreshTrigger = 0 }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API
        const data = await taskApi.getAllTasks();
        setTasks(data);
        setIsOfflineMode(false);
      } catch (err) {
        console.error('API fetch error, switching to offline mode:', err);
        
        // On API error, use localStorage data
        const storedTasks = getStoredTasks();
        setTasks(storedTasks);
        setIsOfflineMode(true);
      }
    } catch (err: any) {
      console.error('Task loading error:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTaskComplete = async (id: number, completed: boolean) => {
    try {
      if (isOfflineMode) {
        // Offline mode: update locally
        const updatedTasks = tasks.map(task => 
          task.id === id ? { ...task, completed } : task
        );
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
      } else {
        // Online mode: update via API
        await taskApi.updateTask(id, { completed });
        fetchTasks();
      }
    } catch (err: any) {
      console.error('Update error:', err);
      setError(`Failed to update task: ${err.message || 'Unknown error'}`);
      
      // Fall back to offline mode
      setIsOfflineMode(true);
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, completed } : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }
  };

  const handleTaskDelete = async (id: number) => {
    try {
      if (isOfflineMode) {
        // Offline mode: delete locally
        const updatedTasks = tasks.filter(task => task.id !== id);
        setTasks(updatedTasks);
        saveTasks(updatedTasks);
      } else {
        // Online mode: delete via API
        await taskApi.deleteTask(id);
        fetchTasks();
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(`Failed to delete task: ${err.message || 'Unknown error'}`);
      
      // Fall back to offline mode
      setIsOfflineMode(true);
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  // Filtered tasks based on category
  const filteredTasks = tasks.filter(task => task.category === category);

  if (isLoading) return <div className="text-white">{t('todo.list.loading')}</div>;

  if (filteredTasks.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[#2f373e] text-white">
        <p>{t('todo.list.noTasks')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOfflineMode && (
        <div className="bg-amber-600 text-white p-2 rounded-lg mb-4 text-sm">
          {t('todo.list.offlineMode')}
        </div>
      )}
      
      {error && (
        <div className="bg-red-600 text-white p-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      {filteredTasks.map((task) => (
        <TodoListItem 
          key={task.id} 
          task={task} 
          onComplete={handleTaskComplete} 
          onDelete={handleTaskDelete} 
        />
      ))}
    </div>
  );
}; 