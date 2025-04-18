import React, { useState, useEffect, useCallback } from "react";
import { taskApi } from "../../lib/api";
import { getUpcomingTasks, saveTasks, formatDate } from "../../lib/taskUtils";
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

export const UpcomingTasks: React.FC = () => {
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
        
        // Filter for upcoming tasks (after tomorrow)
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        dayAfterTomorrow.setHours(0, 0, 0, 0); // Set to beginning of day
        
        const upcomingTasks = allTasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() >= dayAfterTomorrow.getTime();
        });
        
        // Sort by due date (oldest first)
        upcomingTasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        
        setTasks(upcomingTasks);
        setIsOfflineMode(false);
      } catch (err) {
        console.error('API fetch error, switching to offline mode:', err);
        
        // On API error, use localStorage data
        const upcomingTasks = getUpcomingTasks();
        setTasks(upcomingTasks);
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

  // Group tasks by due date
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    
    const date = new Date(task.dueDate);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  if (isLoading) return <div className="text-white">{t('tasks.loadingUpcoming')}</div>;

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
      
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-medium">{t('tasks.upcoming')}</h3>
        <span className="bg-[#ff6f06] text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
          {tasks.length} {t('tasks.count', { count: tasks.length })}
        </span>
      </div>
      
      {tasks.length === 0 ? (
        <div className="p-4 bg-[#2f373e] rounded-lg text-white text-center">
          <p>{t('tasks.noUpcomingTasks')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([dateKey, dateTasks]) => {
            const date = new Date(dateKey);
            const formattedDate = formatDate(dateKey);
            
            // Calculate days from now
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = date.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            const daysLabel = diffDays === 1 
              ? t('sidebar.navigation.tomorrow')
              : diffDays > 1 
                ? `${diffDays} ${t('tasks.for')}`
                : t('sidebar.navigation.today');
            
            return (
              <div key={dateKey} className="bg-[#2f373e] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white text-md font-medium">{formattedDate}</h3>
                    <p className="text-gray-400 text-sm">{daysLabel}</p>
                  </div>
                  <span className="bg-[#383f45] text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {dateTasks.length} {t('tasks.count', { count: dateTasks.length })}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {dateTasks.map((task) => (
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}; 