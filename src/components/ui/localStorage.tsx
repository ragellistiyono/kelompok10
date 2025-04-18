import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "./button";
import { Card } from "./card";
import { formatDistanceToNow } from 'date-fns';
import { enUS, id, ja } from 'date-fns/locale';

// Custom Progress component since we don't have the import
const Progress = ({ value, className, indicatorClassName }: { value: number, className?: string, indicatorClassName?: string }) => {
  return (
    <div className={`w-full bg-[#1a1f23] rounded-full ${className || ''}`}>
      <div
        className={`rounded-full ${indicatorClassName || 'bg-[#ff6f06]'}`}
        style={{ width: `${value}%`, height: '100%' }}
      />
    </div>
  );
};

// LocalStorage keys used in the app
const STORAGE_KEYS = [
  'tasks',
  'completedTasks',
  'aspri_messages',
  'aspri_config',
  'userName',
  'userProfileImage',
  'selectedLanguage',
  'formalization_api_key',
  'formalization_count',
  'aspri_free_count'
];

// Max localStorage size (theoretical) in bytes
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Helper functions for storage operations
const calculateStorageSize = (): number => {
  let totalSize = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += (localStorage[key].length + key.length) * 2; // UTF-16 uses 2 bytes per character
    }
  }
  return totalSize;
};

const getTasksCount = (): number => {
  const tasks = localStorage.getItem('tasks');
  return tasks ? JSON.parse(tasks).length : 0;
};

const getCompletedTasksCount = (): number => {
  const completedTasks = localStorage.getItem('completedTasks');
  return completedTasks ? JSON.parse(completedTasks).length : 0;
};

const getLastModified = (key: string): Date | null => {
  const data = localStorage.getItem(key);
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Find latest timestamp if the data has it
      if (parsed[0].updatedAt) {
        return new Date(Math.max(...parsed.map((item: any) => new Date(item.updatedAt).getTime())));
      } else if (parsed[0].createdAt) {
        return new Date(Math.max(...parsed.map((item: any) => new Date(item.createdAt).getTime())));
      } else if (parsed[0].timestamp) {
        return new Date(Math.max(...parsed.map((item: any) => new Date(item.timestamp).getTime())));
      }
    }
  } catch (e) {
    // Silent fail if not parseable
  }
  
  return null;
};

// Function to create exportable data
const exportData = (): string => {
  const exportObject: Record<string, any> = {};
  
  STORAGE_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        exportObject[key] = JSON.parse(value);
      } catch {
        exportObject[key] = value;
      }
    }
  });
  
  return JSON.stringify(exportObject, null, 2);
};

// Function to import data
const importData = (jsonString: string): boolean => {
  try {
    const importObject = JSON.parse(jsonString);
    
    // Validate the imported data has at least some of our expected keys
    const hasValidKeys = STORAGE_KEYS.some(key => importObject.hasOwnProperty(key));
    if (!hasValidKeys) {
      throw new Error("Invalid backup data format");
    }
    
    // Import each key
    Object.keys(importObject).forEach(key => {
      if (STORAGE_KEYS.includes(key)) {
        const value = typeof importObject[key] === 'object' 
          ? JSON.stringify(importObject[key]) 
          : importObject[key];
        localStorage.setItem(key, value);
      }
    });
    
    return true;
  } catch (error) {
    console.error("Import failed:", error);
    return false;
  }
};

// History storage key
const BACKUP_HISTORY_KEY = 'backup_history';

// Function to create a backup
const createBackup = (): void => {
  const backupData = exportData();
  const timestamp = new Date().toISOString();
  const backupName = `backup_${timestamp}`;
  
  // Store the backup
  localStorage.setItem(backupName, backupData);
  
  // Update backup history
  const historyRaw = localStorage.getItem(BACKUP_HISTORY_KEY);
  const history = historyRaw ? JSON.parse(historyRaw) : [];
  
  // Add to history with size info
  history.unshift({
    name: backupName,
    timestamp,
    size: backupData.length * 2 // UTF-16 uses 2 bytes per character
  });
  
  // Keep only the latest 10 backups
  if (history.length > 10) {
    // Remove old backups from localStorage
    const removedBackups = history.splice(10);
    removedBackups.forEach((backup: {name: string}) => {
      localStorage.removeItem(backup.name);
    });
  }
  
  localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(history));
};

// Function to restore from a backup
const restoreFromBackup = (backupName: string): boolean => {
  try {
    const backupData = localStorage.getItem(backupName);
    if (!backupData) return false;
    
    // First create a current backup before restoring
    createBackup();
    
    // Then restore from the selected backup
    return importData(backupData);
  } catch (error) {
    console.error("Restore failed:", error);
    return false;
  }
};

// Function to format bytes to human readable format
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const LocalStorage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [storageUsage, setStorageUsage] = useState<number>(0);
  const [usagePercentage, setUsagePercentage] = useState<number>(0);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);
  const [lastModifiedDate, setLastModifiedDate] = useState<Date | null>(null);
  const [backupHistory, setBackupHistory] = useState<Array<{name: string, timestamp: string, size: number}>>([]);
  const [importText, setImportText] = useState<string>("");
  const [showImportTextarea, setShowImportTextarea] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [backupSuccess, setBackupSuccess] = useState<boolean>(false);
  const [restoreSuccess, setRestoreSuccess] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Get appropriate locale for date-fns
  const getLocale = () => {
    switch (i18n.language) {
      case 'id': return id;
      case 'ja': return ja;
      default: return enUS;
    }
  };

  // Load initial data
  useEffect(() => {
    refreshStats();
    loadBackupHistory();
  }, []);

  const refreshStats = () => {
    const size = calculateStorageSize();
    setStorageUsage(size);
    setUsagePercentage(Math.min((size / MAX_STORAGE_SIZE) * 100, 100));
    setTasksCount(getTasksCount());
    setCompletedTasksCount(getCompletedTasksCount());
    
    // Get the most recent modification date across task-related storage
    const taskMod = getLastModified('tasks');
    const completedMod = getLastModified('completedTasks');
    
    let latestDate = null;
    if (taskMod && completedMod) {
      latestDate = new Date(Math.max(taskMod.getTime(), completedMod.getTime()));
    } else if (taskMod) {
      latestDate = taskMod;
    } else if (completedMod) {
      latestDate = completedMod;
    }
    
    setLastModifiedDate(latestDate);
  };

  const loadBackupHistory = () => {
    const historyRaw = localStorage.getItem(BACKUP_HISTORY_KEY);
    if (historyRaw) {
      try {
        setBackupHistory(JSON.parse(historyRaw));
      } catch (error) {
        console.error("Failed to load backup history:", error);
        setBackupHistory([]);
      }
    }
  };

  const handleBackup = () => {
    createBackup();
    loadBackupHistory();
    refreshStats();
    setBackupSuccess(true);
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  const handleRestore = (backupName: string) => {
    const success = restoreFromBackup(backupName);
    if (success) {
      refreshStats();
      setRestoreSuccess(true);
      setTimeout(() => setRestoreSuccess(false), 3000);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `todoapplication_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleImport = () => {
    setImportError(null);
    setImportSuccess(false);
    
    if (!importText.trim()) {
      setImportError(t('localStorage.importEmptyError'));
      return;
    }
    
    const success = importData(importText);
    if (success) {
      setImportSuccess(true);
      setImportText("");
      setShowImportTextarea(false);
      refreshStats();
      loadBackupHistory();
      setTimeout(() => setImportSuccess(false), 3000);
    } else {
      setImportError(t('localStorage.importInvalidError'));
    }
  };

  const handleClearData = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    // First create a backup before deletion
    createBackup();
    
    // Clear task related data
    STORAGE_KEYS.forEach(key => {
      if (key !== 'userName' && key !== 'selectedLanguage') {
        localStorage.removeItem(key);
      }
    });
    
    refreshStats();
    loadBackupHistory();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#2f373e] rounded-lg p-6">
        <h2 className="text-white text-xl font-bold mb-4">{t('localStorage.dashboardTitle')}</h2>
        
        {/* Storage Usage */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white">{t('localStorage.storageUsage')}</span>
            <span className="text-white">{formatBytes(storageUsage)} / 5 MB</span>
          </div>
          <Progress value={usagePercentage} className="h-2" 
            indicatorClassName={usagePercentage > 80 ? "bg-red-500" : "bg-[#ff6f06]"} />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#242b31] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">{t('localStorage.activeTasksCount')}</h3>
            <p className="text-white text-2xl font-bold">{tasksCount}</p>
          </div>
          <div className="bg-[#242b31] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">{t('localStorage.completedTasksCount')}</h3>
            <p className="text-white text-2xl font-bold">{completedTasksCount}</p>
          </div>
          <div className="bg-[#242b31] p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">{t('localStorage.lastUpdated')}</h3>
            <p className="text-white text-lg">
              {lastModifiedDate ? formatDistanceToNow(lastModifiedDate, { 
                addSuffix: true,
                locale: getLocale()
              }) : t('localStorage.never')}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleBackup}
            className="bg-[#ff6f06] hover:bg-[#e56300] text-white"
          >
            {t('localStorage.createBackup')}
          </Button>
          
          <Button
            onClick={handleExport}
            className="bg-[#383f45] hover:bg-[#434b53] text-white"
          >
            {t('localStorage.exportData')}
          </Button>
          
          <Button
            onClick={() => setShowImportTextarea(!showImportTextarea)}
            className="bg-[#383f45] hover:bg-[#434b53] text-white"
          >
            {t('localStorage.importData')}
          </Button>
          
          <Button
            onClick={handleClearData}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {showDeleteConfirm ? t('localStorage.confirmClearData') : t('localStorage.clearData')}
          </Button>
        </div>
        
        {/* Import Textarea */}
        {showImportTextarea && (
          <div className="mt-4 space-y-3">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full min-h-[120px] p-3 rounded-lg bg-[#242b31] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
              placeholder={t('localStorage.importPlaceholder')}
            ></textarea>
            
            <div className="flex gap-3">
              <Button
                onClick={handleImport}
                className="bg-[#ff6f06] hover:bg-[#e56300] text-white"
              >
                {t('localStorage.confirmImport')}
              </Button>
              
              <Button
                onClick={() => {
                  setShowImportTextarea(false);
                  setImportText("");
                  setImportError(null);
                }}
                className="bg-[#383f45] hover:bg-[#434b53] text-white"
              >
                {t('localStorage.cancel')}
              </Button>
            </div>
            
            {importError && (
              <div className="bg-red-600 text-white p-3 rounded-lg text-sm">
                {importError}
              </div>
            )}
          </div>
        )}
        
        {/* Success messages */}
        {backupSuccess && (
          <div className="mt-4 bg-green-600 text-white p-3 rounded-lg text-sm">
            {t('localStorage.backupSuccess')}
          </div>
        )}
        
        {importSuccess && (
          <div className="mt-4 bg-green-600 text-white p-3 rounded-lg text-sm">
            {t('localStorage.importSuccess')}
          </div>
        )}
        
        {restoreSuccess && (
          <div className="mt-4 bg-green-600 text-white p-3 rounded-lg text-sm">
            {t('localStorage.restoreSuccess')}
          </div>
        )}
      </Card>
      
      {/* Backup History */}
      {backupHistory.length > 0 && (
        <Card className="bg-[#2f373e] rounded-lg p-6">
          <h2 className="text-white text-xl font-bold mb-4">{t('localStorage.backupHistoryTitle')}</h2>
          
          <div className="space-y-3">
            {backupHistory.map((backup, index) => (
              <div key={index} className="bg-[#242b31] p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="text-white font-medium">
                    {new Date(backup.timestamp).toLocaleString(
                      i18n.language === 'en' ? 'en-US' : i18n.language === 'id' ? 'id-ID' : 'ja-JP',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">{formatBytes(backup.size)}</div>
                </div>
                
                <Button
                  onClick={() => handleRestore(backup.name)}
                  className="bg-[#383f45] hover:bg-[#434b53] text-white text-sm"
                >
                  {t('localStorage.restore')}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}; 