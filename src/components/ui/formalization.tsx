import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "./button";
import { getAIResponse } from "../../lib/aiService";

// Tipe untuk style formalisasi yang tersedia
type FormalizationStyle = 'professional' | 'technical' | 'formal';

// Default API Key dari Google Gemini (sama dengan yang digunakan di AskAspri)
const DEFAULT_API_KEY = "AIzaSyCZpTTjpdSgZGUJSoNPAtbZQYzxL87owCw";

// Konfigurasi LocalStorage key
const FORMALIZATION_API_KEY = "formalization_api_key";
const FORMALIZATION_COUNT_KEY = "formalization_count";
const FREE_USAGE_LIMIT = 5;

export const Formalization: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<FormalizationStyle>('professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Load API key and usage count from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem(FORMALIZATION_API_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    const savedCount = localStorage.getItem(FORMALIZATION_COUNT_KEY);
    if (savedCount) {
      setUsageCount(parseInt(savedCount, 10));
    }
  }, []);

  // Save API key to localStorage when changed
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(FORMALIZATION_API_KEY, apiKey);
    }
  }, [apiKey]);

  // Update usage count in localStorage
  const incrementUsageCount = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem(FORMALIZATION_COUNT_KEY, newCount.toString());
    
    // Check if free limit reached
    if (newCount >= FREE_USAGE_LIMIT && !apiKey) {
      setShowLimitModal(true);
    }
  };

  // Membuat prompt untuk AI berdasarkan gaya yang dipilih
  const createPrompt = (text: string, style: FormalizationStyle): string => {
    let basePrompt = '';
    let language = i18n.language;
    let languageName = language === 'en' ? 'English' : language === 'id' ? 'Indonesian' : 'Japanese';
    
    switch (style) {
      case 'professional':
        basePrompt = `Transform the following text into a professional business communication in ${languageName}. Maintain the original meaning, but make it appropriate for a professional work environment. Ensure the tone is respectful, clear, and concise.\n\nOriginal text: "${text}"\n\nProfessional version:`;
        break;
      case 'technical':
        basePrompt = `Transform the following text into a technical explanation in ${languageName}. Use industry-specific terminology, precise language, and structured formulation. The result should sound like it was written by a technical expert.\n\nOriginal text: "${text}"\n\nTechnical version:`;
        break;
      case 'formal':
        basePrompt = `Transform the following text into formal language in ${languageName}. The result should be suitable for official documents, academic writing, or formal correspondence. Use proper grammar, avoid contractions, and employ a sophisticated vocabulary while maintaining clarity.\n\nOriginal text: "${text}"\n\nFormal version:`;
        break;
      default:
        basePrompt = `Rewrite the following text to improve its clarity and formality in ${languageName}.\n\nOriginal text: "${text}"\n\nImproved version:`;
    }
    
    return basePrompt;
  };
  
  // Fungsi untuk formalisasi menggunakan API AI (Gemini)
  const formalizeTextWithAI = async (text: string, style: FormalizationStyle): Promise<string> => {
    try {
      const prompt = createPrompt(text, style);
      const effectiveApiKey = apiKey || DEFAULT_API_KEY;
      
      const result = await getAIResponse({
        provider: 'gemini',
        message: prompt,
        apiKey: effectiveApiKey
      });
      
      return result;
    } catch (err) {
      console.error('Error in AI processing:', err);
      throw new Error(t('formalization.aiError'));
    }
  };

  // Fungsi untuk mengubah gaya kalimat tanpa AI (fallback)
  const formalizeTextWithoutAI = (text: string, style: FormalizationStyle): string => {
    if (!text.trim()) return "";

    // Template transformasi untuk masing-masing gaya
    let result = text;
    
    if (style === 'professional') {
      // Ubah kalimat informal jadi professional
      result = result.replace(/hai/gi, 'Selamat bertemu');
      result = result.replace(/halo/gi, 'Selamat bertemu');
      result = result.replace(/makasih/gi, 'Terima kasih');
      result = result.replace(/thanks/gi, 'Terima kasih');
      result = result.replace(/ok/gi, 'Baik');
      result = result.replace(/oke/gi, 'Baik');
      result = result.replace(/gak/gi, 'tidak');
      result = result.replace(/nggak/gi, 'tidak');
      result = result.replace(/ga/gi, 'tidak');
      result = result.replace(/pengen/gi, 'ingin');
      result = result.replace(/mau/gi, 'ingin');
      
      // Cek bahasa dan tambahkan akhiran formal
      if (i18n.language === 'en') {
        result += "\n\nBest regards,";
      } else if (i18n.language === 'id') {
        result += "\n\nHormat saya,";
      } else if (i18n.language === 'ja') {
        result += "\n\n敬具";
      }
    } 
    else if (style === 'technical') {
      // Ubah ke teknikal
      result = result.replace(/masalah/gi, 'permasalahan teknis');
      result = result.replace(/problem/gi, 'permasalahan teknis');
      result = result.replace(/cepat/gi, 'efisien');
      result = result.replace(/bagus/gi, 'optimal');
      result = result.replace(/baik/gi, 'optimal');
      
      // Tambahkan terminologi teknis sesuai bahasa
      if (i18n.language === 'en') {
        result = "Based on technical analysis: " + result;
      } else if (i18n.language === 'id') {
        result = "Berdasarkan analisis teknis: " + result;
      } else if (i18n.language === 'ja') {
        result = "技術的分析に基づき: " + result;
      }
    } 
    else if (style === 'formal') {
      // Ubah ke formal
      result = result.replace(/saya/gi, 'Kami');
      result = result.replace(/i /gi, 'We ');
      result = result.replace(/aku/gi, 'Saya');
      result = result.replace(/gue/gi, 'Saya');
      result = result.replace(/lu /gi, 'Anda ');
      result = result.replace(/lo /gi, 'Anda ');
      result = result.replace(/kamu/gi, 'Anda');
      
      // Tambah pembuka formal
      if (i18n.language === 'en') {
        result = "To whom it may concern,\n\n" + result;
      } else if (i18n.language === 'id') {
        result = "Dengan hormat,\n\n" + result;
      } else if (i18n.language === 'ja') {
        result = "拝啓\n\n" + result;
      }
    }
    
    return result;
  };

  const handleFormalization = async () => {
    if (!inputText.trim()) {
      setError(t('formalization.emptyInput'));
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    
    try {
      // Cek jika sudah melebihi batas penggunaan gratis
      if (usageCount >= FREE_USAGE_LIMIT && !apiKey) {
        setShowLimitModal(true);
        setIsProcessing(false);
        return;
      }
      
      // Gunakan API AI untuk formalisasi
      const result = await formalizeTextWithAI(inputText, selectedStyle);
      
      // Increment penggunaan
      incrementUsageCount();
      
      setOutputText(result);
    } catch (err: any) {
      console.error('Formalization error:', err);
      setError(err.message || t('formalization.error'));
      
      // Fallback ke non-AI jika API gagal
      try {
        const fallbackResult = formalizeTextWithoutAI(inputText, selectedStyle);
        setOutputText(fallbackResult);
      } catch (fallbackErr) {
        console.error('Fallback formalization also failed:', fallbackErr);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const clearText = () => {
    setInputText("");
    setOutputText("");
    setError(null);
  };

  const copyToClipboard = () => {
    if (!outputText) return;
    
    navigator.clipboard.writeText(outputText).then(
      () => {
        // Success feedback jika perlu
      },
      (err) => {
        console.error('Could not copy text: ', err);
        setError(t('formalization.copyError'));
      }
    );
  };

  const handleSaveApiKey = () => {
    setShowApiKeyInput(false);
    setShowLimitModal(false);
  };

  // Modal dialog untuk menyimpan API key
  const ApiKeyDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2f373e] p-6 rounded-lg max-w-md w-full">
        <h3 className="text-white text-lg font-medium mb-4">{t('formalization.apiKeyTitle')}</h3>
        <p className="text-gray-300 mb-4">
          {t('formalization.apiKeyDescription')}
        </p>
        <div className="mb-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('formalization.apiKeyPlaceholder')}
            className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
          />
        </div>
        <div className="flex space-x-4">
          <Button 
            onClick={handleSaveApiKey}
            className="flex-1 bg-[#ff6f06] hover:bg-[#e56300] text-white"
          >
            {t('formalization.saveKey')}
          </Button>
          <Button 
            onClick={() => setShowApiKeyInput(false)}
            className="flex-1 bg-[#383f45] hover:bg-[#2a3138] text-white"
          >
            {t('formalization.cancel')}
          </Button>
        </div>
        <div className="mt-4 text-sm text-center">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff6f06] hover:underline"
          >
            {t('formalization.getApiKey')}
          </a>
        </div>
      </div>
    </div>
  );

  // Modal dialog limit tercapai
  const LimitExceededModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2f373e] p-6 rounded-lg max-w-md w-full">
        <h3 className="text-white text-lg font-medium mb-4">{t('formalization.limitTitle')}</h3>
        <p className="text-gray-300 mb-6">
          {t('formalization.limitDescription')}
        </p>
        <div className="flex space-x-4">
          <Button 
            className="flex-1 bg-[#ff6f06] hover:bg-[#e56300] text-white"
            onClick={() => {
              setShowLimitModal(false);
              setShowApiKeyInput(true);
            }}
          >
            {t('formalization.useCustomKey')}
          </Button>
          <Button 
            className="flex-1 bg-[#383f45] hover:bg-[#2a3138] text-white"
            onClick={() => setShowLimitModal(false)}
          >
            {t('formalization.close')}
          </Button>
        </div>
        <div className="mt-4 text-sm text-center">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff6f06] hover:underline"
          >
            {t('formalization.getApiKey')}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#2f373e] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">{t('formalization.title')}</h2>
        
        {/* API Key settings button */}
        <Button
          onClick={() => setShowApiKeyInput(true)}
          className="bg-[#383f45] hover:bg-[#434b53] text-white text-xs px-2 py-1 rounded"
        >
          {apiKey ? t('formalization.changeKey') : t('formalization.addKey')}
        </Button>
      </div>
      
      <div className="flex flex-col space-y-4">
        {/* Input textarea */}
        <div>
          <label htmlFor="inputText" className="block text-white mb-2">
            {t('formalization.inputLabel')}
          </label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full min-h-[100px] p-4 rounded-lg bg-[#242b31] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06]"
            placeholder={t('formalization.inputPlaceholder')}
          />
        </div>
        
        {/* Style selection */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setSelectedStyle('professional')}
            className={`px-4 py-2 rounded-md ${
              selectedStyle === 'professional' 
                ? 'bg-[#ff6f06] text-white' 
                : 'bg-[#383f45] text-gray-300'
            }`}
          >
            {t('formalization.styleProfessional')}
          </Button>
          <Button
            onClick={() => setSelectedStyle('technical')}
            className={`px-4 py-2 rounded-md ${
              selectedStyle === 'technical' 
                ? 'bg-[#ff6f06] text-white' 
                : 'bg-[#383f45] text-gray-300'
            }`}
          >
            {t('formalization.styleTechnical')}
          </Button>
          <Button
            onClick={() => setSelectedStyle('formal')}
            className={`px-4 py-2 rounded-md ${
              selectedStyle === 'formal' 
                ? 'bg-[#ff6f06] text-white' 
                : 'bg-[#383f45] text-gray-300'
            }`}
          >
            {t('formalization.styleFormal')}
          </Button>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleFormalization}
            disabled={isProcessing || !inputText.trim()}
            className="px-6 py-2 rounded-md bg-[#ff6f06] hover:bg-[#e56300] text-white"
          >
            {isProcessing ? t('formalization.processing') : t('formalization.transform')}
          </Button>
          
          <Button 
            onClick={clearText}
            className="px-4 py-2 rounded-md bg-[#383f45] hover:bg-[#434b53] text-white"
            disabled={!inputText && !outputText}
          >
            {t('formalization.clear')}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {/* Output text */}
        {outputText && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="outputText" className="block text-white">
                {t('formalization.resultLabel')}
              </label>
              <Button 
                onClick={copyToClipboard}
                className="px-3 py-1 rounded-md bg-[#383f45] hover:bg-[#434b53] text-white text-sm"
                disabled={!outputText}
              >
                {t('formalization.copy')}
              </Button>
            </div>
            <div
              id="outputText"
              className="w-full min-h-[100px] p-4 rounded-lg bg-[#3a444d] text-white border border-gray-700 whitespace-pre-wrap"
            >
              {outputText}
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-[#3a444d] pt-4 mt-4">
        <h3 className="text-white text-lg font-medium mb-3">{t('formalization.about')}</h3>
        <p className="text-white opacity-70 text-sm">
          {t('formalization.description')}
        </p>
        {/* AI usage info */}
        <p className="text-white opacity-70 text-sm mt-2">
          {apiKey ? 
            t('formalization.usingCustomKey') : 
            t('formalization.usageRemaining', { count: Math.max(0, FREE_USAGE_LIMIT - usageCount) })}
        </p>
      </div>
      
      {/* Modals */}
      {showApiKeyInput && <ApiKeyDialog />}
      {showLimitModal && <LimitExceededModal />}
    </div>
  );
}; 