import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

const languages = [
  {
    code: 'id',
    name: 'Bahasa Indonesia',
    flag: '🇮🇩',
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵',
  },
];

export const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
  };

  return (
    <div className="bg-[#242b31] p-8 rounded-lg">
      <h2 className="text-white text-2xl font-bold mb-6">{t("languageSelector.title")}</h2>
      <div className="grid gap-4">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant="ghost"
            className={`w-full flex items-center justify-between p-4 text-left transition-colors
              ${i18n.language === language.code 
                ? 'bg-[#ff6f06] text-white' 
                : 'text-white hover:bg-[#2f373d]'}`}
            onClick={() => handleLanguageChange(language.code)}
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
            </span>
            {i18n.language === language.code && (
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                Active
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};