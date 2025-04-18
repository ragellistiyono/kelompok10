import React, { useState, useEffect, useCallback } from "react";
import { taskApi } from "../../lib/api";
import { getStoredTasks, saveTasks, formatDate } from "../../lib/taskUtils";
import { useTranslation } from "react-i18next";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
  priority?: string;
}

export const SearchTasks: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [searchBy, setSearchBy] = useState<'title' | 'description' | 'category' | 'all'>('all');

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch from API
        const data = await taskApi.getAllTasks();
        setTasks(data);
        setFilteredTasks(data);
        setIsOfflineMode(false);
      } catch (err) {
        console.error('API fetch error, switching to offline mode:', err);
        
        // On API error, use localStorage data
        const storedTasks = getStoredTasks();
        setTasks(storedTasks);
        setFilteredTasks(storedTasks);
        setIsOfflineMode(true);
      }
    } catch (err: any) {
      console.error('Task loading error:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(tasks);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = tasks.filter(task => {
      if (searchBy === 'title' || searchBy === 'all') {
        if (task.title.toLowerCase().includes(query)) {
          return true;
        }
      }
      
      if ((searchBy === 'description' || searchBy === 'all') && task.description) {
        if (task.description.toLowerCase().includes(query)) {
          return true;
        }
      }
      
      if ((searchBy === 'category' || searchBy === 'all') && task.category) {
        if (task.category.toLowerCase().includes(query)) {
          return true;
        }
      }
      
      return false;
    });
    
    setFilteredTasks(filtered);
  }, [searchQuery, tasks, searchBy]);

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
    }
  };

  if (isLoading) return <div className="text-white">{t('searchTasks.searching')}</div>;

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

      <div className="space-y-4">
        <h3 className="text-white text-lg font-medium">{t('searchTasks.title')}</h3>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchTasks.placeholder')}
              className="bg-[#2f373e] border border-gray-700 text-white text-sm rounded-lg focus:ring-[#ff6f06] focus:border-[#ff6f06] block w-full pl-10 p-2.5"
            />
          </div>
          
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value as 'title' | 'description' | 'category' | 'all')}
            className="bg-[#2f373e] border border-gray-700 text-white text-sm rounded-lg focus:ring-[#ff6f06] focus:border-[#ff6f06] p-2.5"
          >
            <option value="all">{t('searchTasks.all')}</option>
            <option value="title">{t('todo.form.taskTitle')}</option>
            <option value="description">{t('todo.form.description')}</option>
            <option value="category">{t('todo.form.category')}</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6">
        {filteredTasks.length === 0 ? (
          <div className="p-4 bg-[#2f373e] rounded-lg text-white text-center">
            <p>{searchQuery ? t('searchTasks.noResults') : t('todo.list.noTasks')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#2f373e] p-3 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center flex-grow">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleTaskComplete(task.id, !task.completed)}
                    className="h-5 w-5 mr-3 accent-[#ff6f06]"
                  />
                  <div className={`${task.completed ? "line-through text-gray-400" : "text-white"} flex-grow`}>
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && <p className="text-sm opacity-70">{task.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {task.category && (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#383f45] text-gray-300 inline-block">
                          {task.category}
                        </span>
                      )}
                      {task.priority && (
                        <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                          task.priority === 'High' ? 'bg-red-800 text-red-100' :
                          task.priority === 'Medium' ? 'bg-yellow-800 text-yellow-100' :
                          'bg-blue-800 text-blue-100'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#383f45] text-gray-300 inline-block">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleTaskDelete(task.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};