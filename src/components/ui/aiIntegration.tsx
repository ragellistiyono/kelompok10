import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Card } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { getAIResponse } from "../../lib/aiService";

// Tipe AI Provider
interface AIProvider {
  id: string;
  name: string;
  label: string;
  provider: string;
  baseUrl: string;
  models?: {
    name: string;
    label: string;
    maxTokenAllowed?: number;
  }[];
  defaultApiKey?: string;
  apiKeyUrl: string;
}

// Daftar AI providers yang didukung
const aiProviders: AIProvider[] = [
  {
    id: "gemini",
    name: "gemini",
    label: "Google Gemini",
    provider: "Google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent",
    defaultApiKey: "AIzaSyCZpTTjpdSgZGUJSoNPAtbZQYzxL87owCw",
    apiKeyUrl: "https://aistudio.google.com/app/apikey"
  },
  {
    id: "openai",
    name: "openai",
    label: "ChatGPT",
    provider: "OpenAI",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    models: [
      { name: "gpt-4o", label: "GPT-4o", maxTokenAllowed: 8000 },
      { name: "gpt-4o-mini", label: "GPT-4o Mini", maxTokenAllowed: 8000 },
      { name: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", maxTokenAllowed: 8000 }
    ],
    apiKeyUrl: "https://platform.openai.com/api-keys"
  },
  {
    id: "claude",
    name: "claude",
    label: "Claude",
    provider: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1/messages",
    models: [
      { name: "claude-3-7-sonnet-20250219", label: "Claude 3.7 Sonnet" }
    ],
    apiKeyUrl: "https://console.anthropic.com/"
  }
];

// Struktur Task
interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
  priority?: "low" | "medium" | "high";
}

// LocalStorage keys
const AI_CONFIG_KEY = "ai_integration_config";
const TASKS_KEY = "tasks";

// Default AI provider
const DEFAULT_PROVIDER = aiProviders[0];

export const AIIntegration: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("settings");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(DEFAULT_PROVIDER);
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(
    selectedProvider.models && selectedProvider.models.length > 0
      ? selectedProvider.models[0].name
      : ""
  );
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [enhancedTitle, setEnhancedTitle] = useState<string>("");
  const [enhancedDescription, setEnhancedDescription] = useState<string>("");
  const [suggestedPriority, setSuggestedPriority] = useState<"low" | "medium" | "high" | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<string>("");
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load saved configuration and tasks
  useEffect(() => {
    // Load AI configuration
    const savedConfig = localStorage.getItem(AI_CONFIG_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        
        if (config.providerId) {
          const provider = aiProviders.find(p => p.id === config.providerId);
          if (provider) {
            setSelectedProvider(provider);
            
            if (provider.models && config.model) {
              const modelExists = provider.models.some(m => m.name === config.model);
              if (modelExists) {
                setSelectedModel(config.model);
              } else if (provider.models.length > 0) {
                setSelectedModel(provider.models[0].name);
              }
            }
          }
        }
        
        if (config.apiKey) {
          setApiKey(config.apiKey);
        }
        
        if (config.enabled !== undefined) {
          setAiEnabled(config.enabled);
        }
      } catch (e) {
        console.error("Error loading AI configuration:", e);
      }
    }
    
    // Load tasks
    const savedTasks = localStorage.getItem(TASKS_KEY);
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (e) {
        console.error("Error loading tasks:", e);
      }
    }
  }, []);

  // Save configuration when it changes
  useEffect(() => {
    const config = {
      providerId: selectedProvider.id,
      model: selectedModel,
      apiKey: apiKey,
      enabled: aiEnabled
    };
    
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  }, [selectedProvider, selectedModel, apiKey, aiEnabled]);

  // Change provider and reset model
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = aiProviders.find(p => p.id === e.target.value);
    if (provider) {
      setSelectedProvider(provider);
      
      // Reset model selection
      if (provider.models && provider.models.length > 0) {
        setSelectedModel(provider.models[0].name);
      } else {
        setSelectedModel("");
      }
    }
  };

  // Reset success and error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Test AI connection
  const testConnection = async () => {
    setError(null);
    setSuccess(null);
    
    if (!aiEnabled) {
      setError(t('aiIntegration.errorAiDisabled'));
      return;
    }
    
    if (!apiKey && !selectedProvider.defaultApiKey) {
      setError(t('aiIntegration.errorNoApiKey'));
      return;
    }
    
    try {
      const response = await getAIResponse({
        provider: selectedProvider.id,
        message: "Just reply with: Connection successful!",
        model: selectedModel,
        apiKey: apiKey || selectedProvider.defaultApiKey || ""
      });
      
      if (response.includes("Connection successful")) {
        setSuccess(t('aiIntegration.connectionSuccess'));
      } else {
        setError(t('aiIntegration.errorUnexpectedResponse'));
      }
    } catch (err) {
      console.error("AI connection test failed:", err);
      setError(t('aiIntegration.errorConnectionFailed'));
    }
  };

  // Handle task selection for enhancement
  const handleTaskSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const taskId = e.target.value;
    if (!taskId) {
      setSelectedTask(null);
      resetEnhancement();
      return;
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      resetEnhancement();
    }
  };

  // Reset enhancement results
  const resetEnhancement = () => {
    setEnhancedTitle("");
    setEnhancedDescription("");
    setSuggestedPriority(null);
    setSuggestedCategory("");
  };

  // Enhance task with AI
  const enhanceTask = async () => {
    if (!selectedTask) return;
    
    if (!aiEnabled) {
      setError(t('aiIntegration.errorAiDisabled'));
      return;
    }
    
    if (!apiKey && !selectedProvider.defaultApiKey) {
      setError(t('aiIntegration.errorNoApiKey'));
      return;
    }
    
    setIsEnhancing(true);
    setError(null);
    
    try {
      // Create prompt for task enhancement
      const language = i18n.language;
      let prompt = "";
      
      if (language === 'en') {
        prompt = `I have a task with the following details:\nTitle: ${selectedTask.title}\nDescription: ${selectedTask.description || 'None'}\n\nPlease enhance this task by:\n1. Providing a more specific and actionable title\n2. Expanding the description with more details\n3. Suggesting a priority level (low, medium, or high)\n4. Suggesting a category (e.g., work, personal, etc.)\n\nRespond in JSON format with these fields: enhancedTitle, enhancedDescription, priority, category.`;
      } else if (language === 'id') {
        prompt = `Saya memiliki tugas dengan detail berikut:\nJudul: ${selectedTask.title}\nDeskripsi: ${selectedTask.description || 'Tidak ada'}\n\nMohon tingkatkan tugas ini dengan:\n1. Memberikan judul yang lebih spesifik dan dapat ditindaklanjuti\n2. Memperluas deskripsi dengan lebih detail\n3. Menyarankan tingkat prioritas (rendah, sedang, atau tinggi)\n4. Menyarankan kategori (misal: kerja, pribadi, dll.)\n\nBalas dalam format JSON dengan bidang berikut: enhancedTitle, enhancedDescription, priority, category.`;
      } else if (language === 'ja') {
        prompt = `以下の詳細を持つタスクがあります：\nタイトル：${selectedTask.title}\n説明：${selectedTask.description || 'なし'}\n\nこのタスクを以下の方法で強化してください：\n1.より具体的で実行可能なタイトルを提供する\n2.より詳細な説明を追加する\n3.優先度（低、中、高）を提案する\n4.カテゴリ（例：仕事、個人など）を提案する\n\n以下のフィールドを持つJSON形式で応答してください：enhancedTitle、enhancedDescription、priority、category。`;
      }
      
      const response = await getAIResponse({
        provider: selectedProvider.id,
        message: prompt,
        model: selectedModel,
        apiKey: apiKey || selectedProvider.defaultApiKey || ""
      });
      
      // Parse JSON response
      try {
        // Extract JSON from the response (it might be wrapped in text or code blocks)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        
        const enhancementData = JSON.parse(jsonString);
        
        if (enhancementData.enhancedTitle) {
          setEnhancedTitle(enhancementData.enhancedTitle);
        }
        
        if (enhancementData.enhancedDescription) {
          setEnhancedDescription(enhancementData.enhancedDescription);
        }
        
        if (enhancementData.priority && ["low", "medium", "high"].includes(enhancementData.priority)) {
          setSuggestedPriority(enhancementData.priority as "low" | "medium" | "high");
        }
        
        if (enhancementData.category) {
          setSuggestedCategory(enhancementData.category);
        }
        
        setSuccess(t('aiIntegration.enhancementSuccess'));
      } catch (jsonError) {
        console.error("Failed to parse AI response:", jsonError);
        setError(t('aiIntegration.errorParsingResponse'));
      }
    } catch (err) {
      console.error("Task enhancement failed:", err);
      setError(t('aiIntegration.errorEnhancementFailed'));
    } finally {
      setIsEnhancing(false);
    }
  };

  // Apply the enhanced task
  const applyEnhancement = () => {
    if (!selectedTask) return;
    
    const updatedTasks = tasks.map(task => {
      if (task.id === selectedTask.id) {
        return {
          ...task,
          title: enhancedTitle || task.title,
          description: enhancedDescription || task.description,
          priority: suggestedPriority || task.priority,
          category: suggestedCategory || task.category
        };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    localStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    
    setSuccess(t('aiIntegration.taskUpdatedSuccess'));
    resetEnhancement();
    setSelectedTask(null);
  };

  // Translate priority to UI text
  const getPriorityText = (priority: "low" | "medium" | "high" | null): string => {
    if (!priority) return "";
    
    switch (priority) {
      case "low":
        return t('aiIntegration.priorityLow');
      case "medium":
        return t('aiIntegration.priorityMedium');
      case "high":
        return t('aiIntegration.priorityHigh');
      default:
        return priority;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#2f373e] rounded-lg p-6">
        <h2 className="text-white text-xl font-bold mb-6">{t('aiIntegration.title')}</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#ff6f06] data-[state=active]:text-white">
              {t('aiIntegration.tabSettings')}
            </TabsTrigger>
            <TabsTrigger value="enhance" className="data-[state=active]:bg-[#ff6f06] data-[state=active]:text-white">
              {t('aiIntegration.tabEnhance')}
            </TabsTrigger>
          </TabsList>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* AI Toggle */}
            <div className="bg-[#242b31] p-4 rounded-lg flex items-center justify-between">
              <span className="text-white font-medium">{t('aiIntegration.enableAI')}</span>
              <div 
                className={`w-12 h-6 rounded-full cursor-pointer flex items-center transition-colors duration-200 ${aiEnabled ? 'bg-[#ff6f06] justify-end' : 'bg-gray-600 justify-start'}`}
                onClick={() => setAiEnabled(!aiEnabled)}
              >
                <div className="w-5 h-5 rounded-full bg-white m-0.5"></div>
              </div>
            </div>
            
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="block text-white">{t('aiIntegration.provider')}</label>
              <select
                value={selectedProvider.id}
                onChange={handleProviderChange}
                className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
                disabled={!aiEnabled}
              >
                {aiProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Model Selection (if available) */}
            {selectedProvider.models && selectedProvider.models.length > 0 && (
              <div className="space-y-2">
                <label className="block text-white">{t('aiIntegration.model')}</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
                  disabled={!aiEnabled}
                >
                  {selectedProvider.models.map(model => (
                    <option key={model.name} value={model.name}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* API Key */}
            <div className="space-y-2">
              <label className="block text-white">
                {t('aiIntegration.apiKey')} {selectedProvider.defaultApiKey ? 
                  <span className="text-gray-400 text-sm">({t('aiIntegration.optional')})</span> : 
                  <span className="text-red-400 text-sm">*</span>
                }
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
                placeholder={t('aiIntegration.apiKeyPlaceholder')}
                disabled={!aiEnabled}
              />
              <div className="text-sm">
                <a 
                  href={selectedProvider.apiKeyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#ff6f06] hover:underline"
                >
                  {t('aiIntegration.getApiKey', { provider: selectedProvider.label })}
                </a>
              </div>
            </div>
            
            {/* Test Connection Button */}
            <Button
              onClick={testConnection}
              className="bg-[#ff6f06] hover:bg-[#e56300] text-white"
              disabled={!aiEnabled || (!apiKey && !selectedProvider.defaultApiKey)}
            >
              {t('aiIntegration.testConnection')}
            </Button>
          </TabsContent>
          
          {/* Task Enhancement Tab */}
          <TabsContent value="enhance" className="space-y-6">
            {!aiEnabled && (
              <div className="bg-yellow-600 text-white p-3 rounded-lg text-sm">
                {t('aiIntegration.aiDisabledWarning')}
              </div>
            )}
            
            {/* Task Selection */}
            <div className="space-y-2">
              <label className="block text-white">{t('aiIntegration.selectTask')}</label>
              <select
                value={selectedTask?.id || ""}
                onChange={handleTaskSelect}
                className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
                disabled={!aiEnabled || tasks.length === 0}
              >
                <option value="">{t('aiIntegration.selectTaskPlaceholder')}</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected Task Details */}
            {selectedTask && (
              <div className="bg-[#242b31] p-4 rounded-lg space-y-2">
                <h3 className="text-white font-medium">{t('aiIntegration.currentTask')}</h3>
                <div>
                  <span className="text-gray-400 text-sm">{t('aiIntegration.title')}:</span>
                  <p className="text-white">{selectedTask.title}</p>
                </div>
                {selectedTask.description && (
                  <div>
                    <span className="text-gray-400 text-sm">{t('aiIntegration.description')}:</span>
                    <p className="text-white">{selectedTask.description}</p>
                  </div>
                )}
                {selectedTask.category && (
                  <div>
                    <span className="text-gray-400 text-sm">{t('aiIntegration.category')}:</span>
                    <p className="text-white">{selectedTask.category}</p>
                  </div>
                )}
                {selectedTask.priority && (
                  <div>
                    <span className="text-gray-400 text-sm">{t('aiIntegration.priority')}:</span>
                    <p className="text-white">{getPriorityText(selectedTask.priority)}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Enhancement Buttons */}
            {selectedTask && (
              <div className="flex gap-3">
                <Button
                  onClick={enhanceTask}
                  className="bg-[#ff6f06] hover:bg-[#e56300] text-white flex-1"
                  disabled={!aiEnabled || isEnhancing || (!apiKey && !selectedProvider.defaultApiKey)}
                >
                  {isEnhancing ? t('aiIntegration.enhancing') : t('aiIntegration.enhanceTask')}
                </Button>
                <Button
                  onClick={resetEnhancement}
                  className="bg-[#383f45] hover:bg-[#434b53] text-white"
                  disabled={isEnhancing || (!enhancedTitle && !enhancedDescription && !suggestedPriority && !suggestedCategory)}
                >
                  {t('aiIntegration.reset')}
                </Button>
              </div>
            )}
            
            {/* Enhancement Results */}
            {(enhancedTitle || enhancedDescription || suggestedPriority || suggestedCategory) && (
              <div className="bg-[#383f45] p-4 rounded-lg space-y-4">
                <h3 className="text-white font-medium">{t('aiIntegration.enhancementResults')}</h3>
                
                {enhancedTitle && (
                  <div>
                    <span className="text-gray-400 text-sm">{t('aiIntegration.enhancedTitle')}:</span>
                    <p className="text-white">{enhancedTitle}</p>
                  </div>
                )}
                
                {enhancedDescription && (
                  <div>
                    <span className="text-gray-400 text-sm">{t('aiIntegration.enhancedDescription')}:</span>
                    <p className="text-white">{enhancedDescription}</p>
                  </div>
                )}
                
                {suggestedPriority && (
                  <div>
                    <span className="text-gray-400 text-sm">{t('aiIntegration.suggestedPriority')}:</span>
                    <p className="text-white">{getPriorityText(suggestedPriority)}</p>
                  </div>
                )}
                
                {suggestedCategory && (
                  <div>
                    <span className="text-gray-400 text-sm">{t('aiIntegration.suggestedCategory')}:</span>
                    <p className="text-white">{suggestedCategory}</p>
                  </div>
                )}
                
                <Button
                  onClick={applyEnhancement}
                  className="bg-[#ff6f06] hover:bg-[#e56300] text-white w-full"
                >
                  {t('aiIntegration.applyChanges')}
                </Button>
              </div>
            )}
            
            {tasks.length === 0 && (
              <div className="bg-[#242b31] p-4 rounded-lg text-center">
                <p className="text-gray-400">{t('aiIntegration.noTasksAvailable')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Success and Error Messages */}
        {error && (
          <div className="mt-4 bg-red-600 text-white p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 bg-green-600 text-white p-3 rounded-lg text-sm">
            {success}
          </div>
        )}
      </Card>
    </div>
  );
}; 