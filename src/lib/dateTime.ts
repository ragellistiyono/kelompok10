// Utility functions untuk tanggal dan waktu
import i18next from '../i18n';

export const formatDate = (): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  
  const today = new Date();
  // Use the current language for date formatting
  const currentLang = i18next.language || 'id'; // Default to Indonesian if not set
  return today.toLocaleDateString(currentLang, options);
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 3 && hour < 12) {
    return i18next.t('greetings.morning');
  } else if (hour >= 12 && hour < 15) {
    return i18next.t('greetings.afternoon');
  } else if (hour >= 15 && hour < 19) {
    return i18next.t('greetings.evening');
  } else {
    return i18next.t('greetings.night');
  }
}; 