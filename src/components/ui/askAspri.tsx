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
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent",
    defaultApiKey: "AIzaSyCZpTTjpdSgZGUJSoNPAtbZQYzxL87owCw",
    apiKeyUrl: "https://aistudio.google.com/app/apikey"
  },
  {
    id: "deepseek",
    name: "deepseek",
    label: "DeepSeek",
    provider: "DeepSeek",
    baseUrl: "https://api.deepseek.com/",
    models: [
      { name: "deepseek-chat", label: "DeepSeek Chat" },
      { name: "deepseek-reasoner", label: "DeepSeek Reasoner" }
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
    const savedConfig = localStorage.getItem(ASPRI_CONFIG_KEY);
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        const provider = aiProviders.find(p => p.id === config.providerId);
        if (provider) {
          setActiveProvider(provider);
          setApiKey(config.apiKey || "");
          if (provider.models && provider.models.length > 0) {
            setSelectedModel(config.model || provider.models[0].name);
          }
        }
      } catch (error) {
        console.error("Error parsing saved config:", error);
      }
    }

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
      const responseText = await getAIResponse({
        model: selectedModel || undefined,
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
      // Create an error message
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again or check your API key settings.",
        timestamp: new Date()
      };
      setMessages([...messages, errorMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
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
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Input area */}
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
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-[#ff6f06] hover:bg-[#e56300] text-white h-full px-4 py-3 rounded-lg disabled:opacity-50"
              >
                {isLoading ? t('askAspri.sending') : t('askAspri.send')}
              </Button>
            </div>
          </div>
        </>
      )}
      
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