import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "./button";
import { getAIResponse } from "../../lib/aiService";
import { addCompletedAITask } from "../../lib/completedAITasks";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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

// AI Provider configurations
const aiProviders: AIProvider[] = [
  {
    id: "gemini",
    name: "gemini",
    label: "Google Gemini",
    provider: "Google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    defaultApiKey: "AIzaSyCZpTTjpdSgZGUJSoNPAtbZQYzxL87owCw",
    apiKeyUrl: "https://aistudio.google.com/app/apikey"
  },
  {
    id: "deepseek",
    name: "deepseek",
    label: "DeepSeek",
    provider: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    models: [
      { name: "deepseek-chat", label: "DeepSeek Chat" },
      { name: "deepseek-coder", label: "DeepSeek Coder" }
    ],
    apiKeyUrl: "https://platform.deepseek.com/apiKeys"
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
      { name: "gpt-4-turbo", label: "GPT-4 Turbo", maxTokenAllowed: 8000 },
      { name: "gpt-4", label: "GPT-4", maxTokenAllowed: 8000 },
      { name: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", maxTokenAllowed: 8000 }
    ],
    apiKeyUrl: "https://platform.openai.com/api-keys"
  }
];

// LocalStorage keys
const ASPRI_CONFIG_KEY = "aspri_config";
const ASPRI_MESSAGES_KEY = "aspri_messages";
const ASPRI_FREE_COUNT_KEY = "aspri_free_count";

const AskAspriSettings: React.FC<{
  activeProvider: AIProvider;
  setActiveProvider: (provider: AIProvider) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onClose: () => void;
}> = ({ 
  activeProvider, 
  setActiveProvider, 
  apiKey, 
  setApiKey, 
  selectedModel, 
  setSelectedModel, 
  onClose 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-[#2f373e] p-4 rounded-lg max-w-md mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-medium">{t('askAspri.settings_modal.title')}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div>
        <label className="block text-white mb-1">{t('askAspri.settings_modal.provider_label')}</label>
        <select 
          className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
          value={activeProvider.id}
          onChange={(e) => {
            const selected = aiProviders.find(p => p.id === e.target.value);
            if (selected) {
              setActiveProvider(selected);
              // Set default model if available
              if (selected.models && selected.models.length > 0) {
                setSelectedModel(selected.models[0].name);
              }
            }
          }}
        >
          {aiProviders.map(provider => (
            <option key={provider.id} value={provider.id}>{provider.label}</option>
          ))}
        </select>
      </div>
      
      {activeProvider.models && activeProvider.models.length > 0 && (
        <div>
          <label className="block text-white mb-1">{t('askAspri.settings_modal.model_label')}</label>
          <select 
            className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {activeProvider.models.map(model => (
              <option key={model.name} value={model.name}>{model.label}</option>
            ))}
          </select>
        </div>
      )}
      
      <div>
        <label className="block text-white mb-1">
          {t('askAspri.settings_modal.api_key_label')} {activeProvider.defaultApiKey 
            ? t('askAspri.settings_modal.api_key_optional') 
            : t('askAspri.settings_modal.api_key_required')
          }
        </label>
        <input 
          type="password"
          className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
          placeholder={t('askAspri.settings_modal.api_key_placeholder', { provider: activeProvider.label })}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <div className="mt-1 text-sm">
          <a 
            href={activeProvider.apiKeyUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff6f06] hover:underline"
          >
            {t('askAspri.settings_modal.get_api_key', { provider: activeProvider.label })}
          </a>
        </div>
      </div>
      
      <Button 
        className="w-full bg-[#ff6f06] hover:bg-[#e56300] text-white"
        onClick={onClose}
      >
        {t('askAspri.settings_modal.save')}
      </Button>
    </div>
  );
};

const LimitExceededModal: React.FC<{
  onClose: () => void;
  onUseCustomApiKey: () => void;
}> = ({ onClose, onUseCustomApiKey }) => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2f373e] p-6 rounded-lg max-w-md w-full">
        <h3 className="text-white text-lg font-medium mb-4">{t('askAspri.limit_modal.title')}</h3>
        <p className="text-gray-300 mb-6">
          {t('askAspri.limit_modal.message')}
        </p>
        <div className="flex space-x-4">
          <Button 
            className="flex-1 bg-[#ff6f06] hover:bg-[#e56300] text-white"
            onClick={onUseCustomApiKey}
          >
            {t('askAspri.limit_modal.use_custom_key')}
          </Button>
          <Button 
            className="flex-1 bg-[#383f45] hover:bg-[#2a3138] text-white"
            onClick={onClose}
          >
            {t('askAspri.limit_modal.close')}
          </Button>
        </div>
        <div className="mt-4 text-sm text-center">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff6f06] hover:underline"
          >
            {t('askAspri.limit_modal.get_key')}
          </a>
        </div>
      </div>
    </div>
  );
};

export const AskAspri: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [freeCount, setFreeCount] = useState(0);
  const [notification, setNotification] = useState<{type: 'info' | 'warning' | 'error'; message: string} | null>(null);
  
  // AI Provider settings
  const [activeProvider, setActiveProvider] = useState<AIProvider>(aiProviders[0]);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    activeProvider.models && activeProvider.models.length > 0 
      ? activeProvider.models[0].name 
      : ""
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved configuration and messages
  useEffect(() => {
    // First try to load the saved configuration
    const savedConfig = localStorage.getItem(ASPRI_CONFIG_KEY);
    let configLoaded = false;
    
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        const provider = aiProviders.find(p => p.id === config.providerId);
        if (provider) {
          console.log(`Loading saved provider configuration: ${provider.label}`);
          setActiveProvider(provider);
          setApiKey(config.apiKey || "");
          
          if (provider.models && provider.models.length > 0) {
            const savedModel = config.model || provider.models[0].name;
            setSelectedModel(savedModel);
            console.log(`Using model: ${savedModel} for provider ${provider.label}`);
          }
          configLoaded = true;
        }
      } catch (error) {
        console.error("Error parsing saved config:", error);
      }
    }
    
    // If no config was loaded, set defaults to use Gemini
    if (!configLoaded) {
      const defaultProvider = aiProviders.find(p => p.id === "gemini") || aiProviders[0];
      console.log(`Using default provider: ${defaultProvider.label}`);
      setActiveProvider(defaultProvider);
      
      if (defaultProvider.models && defaultProvider.models.length > 0) {
        setSelectedModel(defaultProvider.models[0].name);
      }
    }

    // Load saved messages
    const savedMessages = localStorage.getItem(ASPRI_MESSAGES_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string dates back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
      }
    }

    // Load free usage count
    const savedFreeCount = localStorage.getItem(ASPRI_FREE_COUNT_KEY);
    if (savedFreeCount) {
      try {
        setFreeCount(parseInt(savedFreeCount, 10));
      } catch (error) {
        console.error("Error parsing free count:", error);
      }
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(ASPRI_MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Save AI configuration to localStorage
  useEffect(() => {
    const config = {
      providerId: activeProvider.id,
      apiKey,
      model: selectedModel
    };
    localStorage.setItem(ASPRI_CONFIG_KEY, JSON.stringify(config));
  }, [activeProvider, apiKey, selectedModel]);

  // Notification timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const saveConversationToCompleted = (messages: Message[]) => {
    if (messages.length < 2) return;

    // Find user message and Aspri's response
    const userMessage = messages.find(m => m.role === "user");
    const aspriResponse = messages.find(m => m.role === "assistant");

    if (userMessage && aspriResponse) {
      const taskTitle = userMessage.content.length > 50
        ? userMessage.content.substring(0, 47) + "..."
        : userMessage.content;
        
      const taskDescription = aspriResponse.content.length > 200
        ? aspriResponse.content.substring(0, 197) + "..."
        : aspriResponse.content;

      addCompletedAITask({
        id: Date.now(),
        title: taskTitle,
        description: taskDescription,
        content: messages.slice(-2),
        completed: true,
        timestamp: new Date(),
        category: "Aspri AI"
      });
    }
  };

  const getAIResponseHandler = async (message: string) => {
    // Check if we need to use free tier and handle limits
    const shouldUseFree = !apiKey && activeProvider.defaultApiKey;
    
    if (shouldUseFree) {
      // If using free tier, check limits
      const newCount = freeCount + 1;
      setFreeCount(newCount);
      localStorage.setItem(ASPRI_FREE_COUNT_KEY, newCount.toString());
      
      // Show limit modal if exceeding 5 free requests
      if (newCount >= 5) {
        setShowLimitModal(true);
      }
    }
    
    try {
      // Make sure a model is selected if provider has models
      let modelToUse = selectedModel;
      if (!modelToUse && activeProvider.models && activeProvider.models.length > 0) {
        modelToUse = activeProvider.models[0].name;
      }

      console.log(`Sending request to ${activeProvider.name} with model: ${modelToUse || 'default'}`);
      
      if (!apiKey && !activeProvider.defaultApiKey) {
        // If no API key is provided and no default exists
        setNotification({
          type: 'error',
          message: `No API key provided for ${activeProvider.label}. Please add your API key in settings.`
        });
        throw new Error(`No API key provided for ${activeProvider.label}`);
      }
      
      const responseText = await getAIResponse({
        model: modelToUse || undefined,
        message,
        provider: activeProvider.name,
        apiKey: apiKey || activeProvider.defaultApiKey || "",
        baseUrl: activeProvider.baseUrl
      });
      
      // Create a new assistant message
      const newMessage: Message = {
        role: "assistant",
        content: responseText,
        timestamp: new Date()
      };
      
      // Update messages
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Save to completed tasks
      saveConversationToCompleted(updatedMessages.slice(-2));
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Create a more specific error message
      let errorMessage: Message;
      let notificationType: 'info' | 'warning' | 'error' = 'error';
      let notificationMsg = '';
      
      if (String(error).includes("API key")) {
        errorMessage = {
          role: "assistant",
          content: "Invalid API key. Please check your API key in settings.",
          timestamp: new Date()
        };
        notificationMsg = `API key error: Please check your ${activeProvider.label} API key in settings.`;
      } else if (String(error).includes("Unexpected API response format")) {
        errorMessage = {
          role: "assistant",
          content: "Received an unexpected response format from the AI provider. Please try again with a different provider.",
          timestamp: new Date()
        };
        notificationMsg = `Unexpected response format from ${activeProvider.label}. Try another provider.`;
      } else {
        errorMessage = {
          role: "assistant",
          content: `Sorry, I encountered an error. Please try again or check your API key settings.`,
          timestamp: new Date()
        };
        notificationMsg = `Connection error with ${activeProvider.label}. Please try again or switch providers.`;
      }
      
      setMessages([...messages, errorMessage]);
      setNotification({
        type: notificationType,
        message: notificationMsg
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Reset notification
    setNotification(null);
    
    // Create a new user message
    const newMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };
    
    // Update messages and clear input
    setMessages([...messages, newMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      await getAIResponseHandler(input.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem(ASPRI_MESSAGES_KEY);
  };

  return (
    <div className="bg-[#242b31] rounded-lg p-6 flex flex-col h-[80vh] lg:h-[70vh]">
      {showSettings ? (
        <AskAspriSettings 
          activeProvider={activeProvider}
          setActiveProvider={setActiveProvider}
          apiKey={apiKey}
          setApiKey={setApiKey}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <>
          {/* Header */}
          <div className="mb-4 text-center">
            <h2 className="text-white text-2xl font-bold mb-2">{t('askAspri.title')}</h2>
            <p className="text-gray-400">
              {t('askAspri.subtitle')}
            </p>
          </div>

          {notification && (
            <div 
              className={`rounded-md p-3 mb-4 ${
                notification.type === 'error' ? 'bg-red-900 bg-opacity-30 border border-red-700' :
                notification.type === 'warning' ? 'bg-yellow-900 bg-opacity-30 border border-yellow-700' :
                'bg-blue-900 bg-opacity-30 border border-blue-700'
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {notification.type === 'error' ? (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : notification.type === 'warning' ? (
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-white">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setNotification(null)}
                      className="inline-flex rounded-md p-1.5 text-gray-300 hover:bg-[#1a1f23] focus:outline-none"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat area */}
          <div className="flex-grow overflow-y-auto mb-4 bg-[#1a1f23] rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 max-w-md">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-[#ff6f06] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">{t('askAspri.welcome_title')}</h3>
                  <p className="text-gray-400 mb-4">{t('askAspri.welcome_message')}</p>
                  
                  {!apiKey && !activeProvider.defaultApiKey && (
                    <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-md text-white text-sm">
                      <p>{t('askAspri.api_key_required')}</p>
                      <button 
                        onClick={() => setShowSettings(true)}
                        className="mt-2 text-[#ff6f06] hover:underline"
                      >
                        {t('askAspri.open_settings')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-[#ff6f06] text-white"
                        : "bg-[#2f373e] text-white"
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === "user" ? "text-white/70" : "text-gray-400"
                      }`}>
                        {message.role === "user" ? t('askAspri.you') : t('askAspri.aspri')} • {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-auto">
            <div className="flex justify-between mb-2">
              <Button 
                variant="ghost" 
                onClick={handleClearChat}
                className="text-white text-sm hover:bg-[#1a1f23]"
              >
                {t('askAspri.clear')}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowSettings(true)}
                className="text-white text-sm hover:bg-[#1a1f23]"
              >
                {t('askAspri.settings')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('askAspri.inputPlaceholder')}
                className="flex-grow bg-[#1a1f23] text-white rounded-lg border border-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-[#ff6f06] resize-none"
                rows={2}
                disabled={isLoading || showLimitModal}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || showLimitModal}
                className="bg-[#ff6f06] hover:bg-[#e56300] text-white h-full px-4 py-3 rounded-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('askAspri.sending')}
                  </div>
                ) : t('askAspri.send')}
              </Button>
            </div>
            
            {/* Provider info */}
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <div>
                {t('askAspri.powered_by')} {activeProvider.label}
                {selectedModel && ` • ${selectedModel}`}
              </div>
              <div>
                {apiKey ? (
                  <span className="text-green-500">✓ {t('askAspri.using_custom_key')}</span>
                ) : activeProvider.defaultApiKey ? (
                  <span>{t('askAspri.using_default_key')}</span>
                ) : (
                  <span className="text-red-500">⚠ {t('askAspri.no_api_key')}</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Free usage limit modal */}
      {showLimitModal && (
        <LimitExceededModal
          onClose={() => setShowLimitModal(false)}
          onUseCustomApiKey={() => {
            setShowLimitModal(false);
            setShowSettings(true);
          }}
        />
      )}
    </div>
  );
}; 