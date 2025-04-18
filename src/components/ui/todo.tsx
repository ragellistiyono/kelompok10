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

interface TodoProps {
  onTaskAdded?: () => void;
  refreshTrigger?: number;
  categoryFilter?: string;
  initialCategory?: string;
}

// Local storage key for tasks
const LOCAL_STORAGE_KEY = 'todo_tasks';

// Get stored tasks from localStorage
const getStoredTasks = (): Task[] => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored tasks:', e);
    }
  }
  return []; // Return empty array if nothing stored
};

// Save tasks to localStorage
const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

export const TodoList: React.FC<TodoProps> = ({ refreshTrigger = 0, categoryFilter }) => {
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
        
        // If successful, save to localStorage as backup
        saveTasks(data);
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
  const filteredTasks = categoryFilter 
    ? tasks.filter(task => task.category === categoryFilter)
    : tasks;

  if (isLoading) return <div className="text-white">{t('todo.list.loading')}</div>;

  if (filteredTasks.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[#2f373e] text-white">
        {categoryFilter 
          ? <p>{t('todo.list.noCategoryTasks', { category: categoryFilter })}</p>
          : <p>{t('todo.list.noTasks')}</p>
        }
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

export const TodoForm: React.FC<TodoProps> = ({ onTaskAdded, categoryFilter }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categoryFilter || "");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update category when categoryFilter changes
  useEffect(() => {
    if (categoryFilter) {
      setCategory(categoryFilter);
    }
  }, [categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError(t('todo.form.titleRequired'));
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Gabungkan tanggal dan waktu jika keduanya diisi
      let dueDateTimeString: string | undefined = undefined;
      if (dueDate) {
        dueDateTimeString = dueDate;
        if (dueTime) {
          // Gabungkan tanggal dan waktu dalam format ISO
          const dateObj = new Date(`${dueDate}T${dueTime}`);
          dueDateTimeString = dateObj.toISOString();
        }
      }
      
      const newTask = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        dueDate: dueDateTimeString,
      };
      
      try {
        // Try to create via API
        await taskApi.createTask(newTask);
      } catch (apiErr) {
        console.error('API create error, switching to offline mode:', apiErr);
        
        // Get existing tasks
        const tasks = getStoredTasks();
        
        // Create a new task with local ID
        const newLocalTask: Task = {
          ...newTask,
          id: Math.max(0, ...tasks.map(t => t.id)) + 1,
          completed: false
        };
        
        // Add to stored tasks
        tasks.push(newLocalTask);
        saveTasks(tasks);
      }
      
      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      if (!categoryFilter) {
        setCategory("");
      }
      
      // Notify parent
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (err: any) {
      console.error('Create error:', err);
      setError(`Failed to create task: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#2f373e] p-4 rounded-lg space-y-4">
      <div>
        <label htmlFor="title" className="block text-white mb-1">
          {t('todo.form.taskTitle')}
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
          placeholder={t('todo.form.titlePlaceholder')}
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-white mb-1">
          {t('todo.form.description')}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
          placeholder={t('todo.form.descriptionPlaceholder')}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dueDate" className="block text-white mb-1">
            {t('todo.form.dueDate')}
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
          />
        </div>
        
        <div>
          <label htmlFor="dueTime" className="block text-white mb-1">
            {t('todo.form.dueTime')}
          </label>
          <input
            id="dueTime"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="category" className="block text-white mb-1">
          {t('todo.form.category')}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06] ${
            categoryFilter ? 'opacity-75' : ''
          }`}
          disabled={!!categoryFilter}
        >
          <option value="">{t('todo.form.selectCategory')}</option>
          <option value={t('todo.form.personal')}>{t('todo.form.personal')}</option>
          <option value={t('todo.form.work')}>{t('todo.form.work')}</option>
        </select>
        {categoryFilter && (
          <p className="text-amber-500 text-xs mt-1">{t('todo.form.categoryFixed')}</p>
        )}
      </div>
      
      {error && <div className="text-red-500">{error}</div>}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#ff6f06] text-white py-2 rounded-md hover:bg-[#e56300] disabled:opacity-50"
      >
        {isSubmitting ? t('todo.form.addingTask') : t('todo.form.addTask')}
      </button>
    </form>
  );
};

export const Todo: React.FC<{initialCategory?: string}> = ({ initialCategory }) => {
  const { t } = useTranslation();
  const [refreshTasks, setRefreshTasks] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(initialCategory);
  const [formMessage, setFormMessage] = useState<{type: 'success' | 'warning' | 'error', text: string} | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  // Cek status online/offline
  useEffect(() => {
    const checkOnlineStatus = async () => {
      try {
        await fetch('http://localhost:5000/api/tasks', {
          method: 'HEAD',
          cache: 'no-store'
        });
        setIsOfflineMode(false);
      } catch (err) {
        setIsOfflineMode(true);
        setFormMessage({ 
          type: 'warning', 
          text: t('todo.form.workingOffline')
        });
      }
    };
    
    checkOnlineStatus();
  }, [t]);

  // Tambahkan pesan offline jika offline mode aktif
  useEffect(() => {
    if (isOfflineMode) {
      setFormMessage({ 
        type: 'warning', 
        text: t('todo.form.workingOffline')
      });
    }
  }, [isOfflineMode, t]);

  const handleTaskAdded = () => {
    // Increment refresh counter to trigger reload of task list
    setRefreshTasks((prev) => prev + 1);
    
    // Show success message
    setFormMessage({ 
      type: 'success', 
      text: t('todo.form.taskAddedSuccess')
    });
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setFormMessage(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={() => setActiveCategory(undefined)} 
          className={`px-4 py-2 rounded-md ${!activeCategory ? 'bg-[#ff6f06] text-white' : 'bg-[#383f45] text-gray-300'}`}
        >
          {t('todo.list.allTasks')}
        </button>
        <button 
          onClick={() => setActiveCategory(t('todo.list.personal'))} 
          className={`px-4 py-2 rounded-md ${activeCategory === t('todo.list.personal') ? 'bg-[#ff6f06] text-white' : 'bg-[#383f45] text-gray-300'}`}
        >
          {t('todo.list.personal')}
        </button>
        <button 
          onClick={() => setActiveCategory(t('todo.list.work'))} 
          className={`px-4 py-2 rounded-md ${activeCategory === t('todo.list.work') ? 'bg-[#ff6f06] text-white' : 'bg-[#383f45] text-gray-300'}`}
        >
          {t('todo.list.work')}
        </button>
      </div>
      
      {formMessage && (
        <div 
          className={`text-white p-3 rounded-lg text-sm ${
            formMessage.type === 'success' ? 'bg-green-600' : 
            formMessage.type === 'warning' ? 'bg-amber-600' : 
            'bg-red-600'
          }`}
        >
          {formMessage.text}
        </div>
      )}
      
      <TodoForm 
        onTaskAdded={handleTaskAdded} 
        categoryFilter={activeCategory} 
      />
      
      <div className="mt-8">
        <h3 className="text-white text-lg font-medium mb-4">{t('todo.list.yourTasks')}</h3>
        <TodoList refreshTrigger={refreshTasks} categoryFilter={activeCategory} />
      </div>
    </div>
  );
}; 