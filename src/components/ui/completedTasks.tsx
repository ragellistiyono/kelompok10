import React, { useState, useEffect, useCallback } from "react";
import { taskApi } from "../../lib/api";
import { convertAITasksToTodoFormat, deleteCompletedAITask } from "../../lib/completedAITasks";
import { useTranslation } from "react-i18next";

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
  priority?: string;
  isAITask?: boolean;
  aiContent?: any[];
  timestamp?: Date;
}

interface CompletedTasksProps {
  categoryFilter?: string;
}

// LocalStorage key for tasks
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
  return [];
};

export const CompletedTasks: React.FC<CompletedTasksProps> = ({ categoryFilter }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [selectedAITask, setSelectedAITask] = useState<Task | null>(null);
  const [showAITaskModal, setShowAITaskModal] = useState(false);

  const fetchCompletedTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get completed regular tasks
      let completedTasks: Task[] = [];
      
      try {
        // Try to fetch from API
        const apiTasks = await taskApi.getAllTasks();
        completedTasks = apiTasks.filter(task => task.completed);
        setIsOfflineMode(false);
      } catch (err) {
        console.error('API fetch error, switching to offline mode:', err);
        
        // On API error, use localStorage data
        const storedTasks = getStoredTasks();
        completedTasks = storedTasks.filter(task => task.completed);
        setIsOfflineMode(true);
      }
      
      // Get completed AI tasks and combine with regular tasks
      const aiTasks = convertAITasksToTodoFormat();
      const allCompletedTasks = [...completedTasks, ...aiTasks];
      
      // Sort by timestamp (newest first)
      allCompletedTasks.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });
      
      setTasks(allCompletedTasks);
    } catch (err: any) {
      console.error('Task loading error:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTaskDelete = async (id: number, isAITask: boolean = false) => {
    try {
      if (isAITask) {
        // Delete AI task from storage
        deleteCompletedAITask(id);
        fetchCompletedTasks();
      } else {
        if (isOfflineMode) {
          // Offline mode: delete locally
          const storedTasks = getStoredTasks();
          const updatedTasks = storedTasks.filter(task => task.id !== id);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTasks));
          fetchCompletedTasks();
        } else {
          // Online mode: delete via API
          await taskApi.deleteTask(id);
          fetchCompletedTasks();
        }
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(`Failed to delete task: ${err.message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchCompletedTasks();
  }, [fetchCompletedTasks]);

  // Filtered tasks based on category
  const filteredTasks = categoryFilter 
    ? tasks.filter(task => task.category === categoryFilter)
    : tasks;

  // Format time for AI conversation
  const formatTime = (dateStr: string | Date) => {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) return <div className="text-white">{t('completedTasks.loading')}</div>;

  if (filteredTasks.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[#2f373e] text-white">
        <p>{t('completedTasks.noCompleted')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOfflineMode && (
        <div className="bg-amber-600 text-white p-2 rounded-lg mb-4 text-sm">
          {t('completedTasks.offlineMode')}
        </div>
      )}
      
      {error && (
        <div className="bg-red-600 text-white p-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className="bg-[#2f373e] p-4 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center flex-grow">
            <input
              type="checkbox"
              checked={true}
              readOnly
              className="h-5 w-5 mr-3 accent-[#ff6f06]"
            />
            <div className="text-gray-400 line-through flex-grow">
              <h3 className="font-medium">{task.title}</h3>
              {task.description && <p className="text-sm opacity-70">{task.description}</p>}
              
              <div className="flex gap-2 mt-1">
                {task.category && (
                  <span className="text-xs px-2 py-1 rounded-full bg-[#383f45] text-gray-300 inline-block">
                    {task.category}
                  </span>
                )}
                
                {task.isAITask && (
                  <button
                    onClick={() => {
                      setSelectedAITask(task);
                      setShowAITaskModal(true);
                    }}
                    className="text-xs px-2 py-1 rounded-full bg-[#ff6f06] text-white inline-block"
                  >
                    {t('completedTasks.viewConversation')}
                  </button>
                )}
                
                {task.timestamp && (
                  <span className="text-xs px-2 py-1 rounded-full bg-[#383f45] text-gray-300 inline-block">
                    {new Date(task.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => handleTaskDelete(task.id, task.isAITask)}
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
      
      {/* AI Task Conversation Modal */}
      {showAITaskModal && selectedAITask && selectedAITask.aiContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2f373e] p-6 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-medium">{t('askAspri.title')}</h3>
              <button 
                onClick={() => setShowAITaskModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-[#242b31] rounded-lg p-4 mb-4">
              {selectedAITask.aiContent.map((message: any, index: number) => (
                <div 
                  key={index} 
                  className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-[#ff6f06] text-white' 
                        : 'bg-[#383f45] text-white'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowAITaskModal(false)}
                className="bg-[#383f45] hover:bg-[#2a3138] text-white px-4 py-2 rounded-md"
              >
                {t('completedTasks.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 