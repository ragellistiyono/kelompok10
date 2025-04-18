import React from 'react';

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
  priority?: string;
}

interface TodoListItemProps {
  task: Task;
  onComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

// Komponen untuk menampilkan item tugas dengan format yang lebih baik
export const TodoListItem: React.FC<TodoListItemProps> = ({ task, onComplete, onDelete }) => {
  // Format tanggal dan waktu
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    
    const dateFormatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    // Cek apakah waktu tersedia (tidak 00:00)
    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
    const timeFormatted = hasTime ? date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) : null;
    
    return (
      <>
        <span>{dateFormatted}</span>
        {timeFormatted && (
          <span className="ml-1 text-indigo-200">{timeFormatted}</span>
        )}
      </>
    );
  };
  
  return (
    <div className="bg-[#2f373e] p-4 rounded-lg flex items-start justify-between">
      <div className="flex items-start">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onComplete(task.id, !task.completed)}
          className="h-5 w-5 mr-3 mt-1 accent-[#ff6f06]"
        />
        <div className={`${task.completed ? "line-through text-gray-400" : "text-white"}`}>
          <h3 className="font-medium">{task.title}</h3>
          {task.description && (
            <p className="text-sm opacity-70 mt-1">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
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
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-900 text-indigo-100 inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateTime(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onDelete(task.id)}
        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
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
  );
}; 