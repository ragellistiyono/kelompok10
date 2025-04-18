import React, { useState, useEffect, useCallback } from "react";
import { taskApi } from "../../lib/api";
import { getTomorrowTasks, saveTasks, formatDate } from "../../lib/taskUtils";
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

export const TomorrowTasks: React.FC = () => {
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
        const allTasks = await taskApi.getAllTasks();
        
        // Filter for tomorrow's tasks
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Set to beginning of day
        
        const tomorrowTasks = allTasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === tomorrow.getTime();
        });
        
        setTasks(tomorrowTasks);
        setIsOfflineMode(false);
      } catch (err) {
        console.error('API fetch error, switching to offline mode:', err);
        
        // On API error, use localStorage data
        const tomorrowTasks = getTomorrowTasks();
        setTasks(tomorrowTasks);
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

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Get tomorrow's date for display
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDisplay = tomorrow.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  if (isLoading) return <div className="text-white">{t('tasks.loadingTomorrow')}</div>;

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
      
      <div className="bg-[#2f373e] p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-medium">{t('tasks.tomorrow')}</h3>
          <span className="bg-[#ff6f06] text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
            {tasks.length} {t('tasks.count', { count: tasks.length })}
          </span>
        </div>
        
        {tasks.length === 0 ? (
          <div className="p-4 bg-[#242b31] rounded-lg text-white text-center">
            <p>{t('tasks.noTasksTomorrow')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#242b31] p-3 rounded-lg flex items-center justify-between"
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