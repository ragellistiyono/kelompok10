import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { taskApi, getStoredTasks, saveTasks } from "../../lib/api";
import { TodoListItem } from "./TodoList";
import { normalizeCategory, getCategoryKey } from "../../lib/categoryUtils";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
  priority?: string;
  meta?: {
    categoryKey?: string;
    creationLanguage?: string;
  };
}

interface CategoryTaskListProps {
  category: string;
  refreshTrigger?: number;
}

export const CategoryTaskList: React.FC<CategoryTaskListProps> = ({ category, refreshTrigger = 0 }) => {
  const { t, i18n } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Get the normalized category key that's language-independent
  const categoryKey = getCategoryKey(category);

  const fetchTasks = useCallback(async () => {
    try {
      console.log('CategoryTaskList: fetchTasks triggered with refreshTrigger =', refreshTrigger);
      console.log('Current language:', i18n.language, 'Current category:', category, 'Category key:', categoryKey);
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API
        const data = await taskApi.getAllTasks();
        console.log('CategoryTaskList: Fetched tasks from API:', data);
        setTasks(data);
        setIsOfflineMode(false);
      } catch (err) {
        console.error('API fetch error, switching to offline mode:', err);
        
        // On API error, use localStorage data
        const storedTasks = getStoredTasks();
        console.log('CategoryTaskList: Using tasks from localStorage:', storedTasks);
        setTasks(storedTasks);
        setIsOfflineMode(true);
      }
    } catch (err: any) {
      console.error('Task loading error:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [refreshTrigger, categoryKey, i18n.language]);

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
    console.log('CategoryTaskList: useEffect triggered, fetching tasks...');
    fetchTasks();
  }, [fetchTasks, refreshTrigger, i18n.language]);

  // Language-independent category filtering
  const filteredTasks = tasks.filter(task => {
    // First check meta.categoryKey if available
    if (task.meta && task.meta.categoryKey) {
      const match = task.meta.categoryKey === categoryKey;
      console.log(`Task ${task.id}: Using meta.categoryKey "${task.meta.categoryKey}" vs "${categoryKey}"`, match);
      return match;
    }
    
    // Fallback to regular category checking
    const taskCategoryKey = getCategoryKey(task.category);
    const match = taskCategoryKey === categoryKey;
    
    console.log(`Task ${task.id}: category: "${task.category}", key: "${taskCategoryKey}", 
                 Filter category: "${category}", key: "${categoryKey}"`, match);
    
    return match;
  });

  console.log(`CategoryTaskList: Found ${filteredTasks.length} tasks for category "${category}" (key: ${categoryKey}) out of ${tasks.length} total tasks`);

  if (isLoading) return <div className="text-white">{t('todo.list.loading')}</div>;

  if (filteredTasks.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[#2f373e] text-white">
        <p>{t('todo.list.noCategoryTasks', { category })}</p>
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