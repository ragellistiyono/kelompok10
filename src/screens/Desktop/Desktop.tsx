import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { LanguageSelector } from "../../components/LanguageSelector";
import { Todo } from "../../components/ui/todo";
import { AskAspri } from "../../components/ui/askAspri";
import { CompletedTasks } from "../../components/ui/completedTasks";
import { SearchTasks } from "../../components/ui/searchTasks";
import { UserProfile } from "../../components/UserProfile";
import { formatDate, getGreeting } from "../../lib/dateTime";
import { CategoryTaskList } from "../../components/ui/CategoryTaskList";
import { TodayTasks } from "../../components/ui/todayTasks";
import { TomorrowTasks } from "../../components/ui/tomorrowTasks";
import { UpcomingTasks } from "../../components/ui/upcomingTasks";
import { AllTasks } from "../../components/ui/allTasks";
import { VoiceToText } from "../../components/ui/voiceToText";
import { Formalization } from "../../components/ui/formalization";
import { LocalStorage } from "../../components/ui/localStorage";
import { Card } from "../../components/ui/card";

export const Desktop = (): JSX.Element => {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [activeSection, setActiveSection] = useState('addTask');
  const [currentDate, setCurrentDate] = useState(formatDate());
  const [greeting, setGreeting] = useState(getGreeting());
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const [voiceToTextActive, setVoiceToTextActive] = useState(false);
  const [formalizationActive, setFormalizationActive] = useState(false);
  const [localStorageActive, setLocalStorageActive] = useState(false);
  const [aiIntegrationActive, setAiIntegrationActive] = useState(false);

  // Update date and greeting every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(formatDate());
      setGreeting(getGreeting());
    }, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Update date and greeting when language changes
  useEffect(() => {
    setCurrentDate(formatDate());
    setGreeting(getGreeting());
  }, [i18n.language]);

  // Refresh tasks list when changing sections
  useEffect(() => {
    setRefreshTrigger(Date.now());
  }, [activeSection]);

  // Navigation menu items data
  const navItems = [
    {
      icon: "/bold---essentional--ui---add-square.svg",
      text: t('sidebar.navigation.addTask'),
      active: activeSection === 'addTask',
      section: 'addTask'
    },
    { 
      icon: "/rectangle-8.svg", 
      text: t('sidebar.navigation.askAspri'), 
      active: activeSection === 'askAspri',
      section: 'askAspri'
    },
    {
      icon: "/outline---search---magnifer.svg",
      text: t('sidebar.navigation.searchTask'),
      active: activeSection === 'searchTask',
      section: 'searchTask'
    },
    {
      icon: "/linear---messages--conversation---plain-3.svg",
      text: t('sidebar.navigation.today'),
      active: activeSection === 'today',
      section: 'today'
    },
    { 
      icon: "/outline---time---calendar.svg", 
      text: t('sidebar.navigation.tomorrow'), 
      active: activeSection === 'tomorrow',
      section: 'tomorrow'
    },
    {
      icon: "/outline---time---clock-circle.svg",
      text: t('sidebar.navigation.upcoming'),
      active: activeSection === 'upcoming',
      section: 'upcoming'
    },
    {
      icon: "/outline---notes---document-text.svg",
      text: t('sidebar.navigation.allTasks'),
      active: activeSection === 'allTasks',
      section: 'allTasks'
    },
    {
      icon: "/outline---essentional--ui---check-circle.svg",
      text: t('sidebar.navigation.completed'),
      active: activeSection === 'completed',
      section: 'completed'
    },
  ];

  // Lists data
  const listItems = [
    { text: t('sidebar.lists.personal'), active: activeSection === 'personal', section: 'personal' },
    { text: t('sidebar.lists.work'), active: activeSection === 'work', section: 'work' },
  ];

  // Features data
  const featureItems = [
    { 
      text: t('features.multiLanguage'), 
      active: showLanguageSelector, 
      color: "red",
      onClick: () => {
        setShowLanguageSelector(!showLanguageSelector);
        setVoiceToTextActive(false);
        setFormalizationActive(false);
        setLocalStorageActive(false);
        setAiIntegrationActive(false);
      }
    },
    { 
      text: t('features.localStorage'), 
      active: localStorageActive, 
      color: "purple",
      onClick: () => {
        setLocalStorageActive(!localStorageActive);
        setShowLanguageSelector(false);
        setVoiceToTextActive(false);
        setFormalizationActive(false);
        setAiIntegrationActive(false);
      }
    },
    { 
      text: t('features.voiceToText'), 
      active: voiceToTextActive, 
      color: "blue",
      onClick: () => {
        setVoiceToTextActive(!voiceToTextActive);
        setShowLanguageSelector(false);
        setFormalizationActive(false);
        setLocalStorageActive(false);
        setAiIntegrationActive(false);
      }
    },
    { 
      text: t('features.aiIntegration'), 
      active: aiIntegrationActive, 
      color: "cyan",
      onClick: () => {
        setAiIntegrationActive(!aiIntegrationActive);
        setShowLanguageSelector(false);
        setVoiceToTextActive(false);
        setFormalizationActive(false);
        setLocalStorageActive(false);
      }
    },
    { 
      text: t('features.formalization'), 
      active: formalizationActive, 
      color: "green",
      onClick: () => {
        setFormalizationActive(!formalizationActive);
        setShowLanguageSelector(false);
        setVoiceToTextActive(false);
        setLocalStorageActive(false);
        setAiIntegrationActive(false);
      }
    },
  ];

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    // Close any open feature panels
    setShowLanguageSelector(false);
    setVoiceToTextActive(false);
    setFormalizationActive(false);
    setLocalStorageActive(false);
    setAiIntegrationActive(false);
  };

  // Handle captured text from VoiceToText component
  const handleCapturedText = (text: string) => {
    console.log('Captured text:', text);
    // You can implement additional functionality here
    // For example, you could use this text to create a new task
  };

  return (
    <div className="bg-[#1a1f23] flex flex-row justify-center w-full min-h-screen">
      <div className="bg-[#1a1f23] w-full relative flex">
        {/* Mobile Menu Button - Only visible on small screens */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 text-white p-2"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed lg:static w-[280px] h-screen bg-[#1a1f23] transition-transform duration-300 z-40 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* User profile */}
          <div className="flex items-center justify-between p-6 pt-8">
            <UserProfile />

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-[22px] w-[22px] p-0"
              >
                <img
                  src="/outline---notifications---bell-.svg"
                  alt="Notifications"
                  className="h-[22px] w-[22px]"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-[22px] w-[22px] p-0"
              >
                <img
                  src="/outline---arrows-action---square-top-up.svg"
                  alt="Expand"
                  className="h-[22px] w-[22px]"
                />
              </Button>
            </div>
          </div>

          {/* Navigation menu */}
          <nav className="flex flex-col gap-6 px-6 mt-4">
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`flex items-center justify-start gap-4 p-0 h-auto ${
                  item.active ? "text-[#ff6f06]" : "text-white opacity-50"
                }`}
                onClick={() => handleNavClick(item.section)}
              >
                <img
                  src={item.icon}
                  alt={item.text}
                  className="w-[22px] h-[22px]"
                />
                <span className="font-medium text-lg">{item.text}</span>
              </Button>
            ))}
          </nav>

          {/* My Lists section */}
          <div className="flex flex-col gap-6 px-6 mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-bold">{t('sidebar.lists.title')}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-[22px] w-[22px] p-0"
              >
                <img
                  src="/add-line--1--1.svg"
                  alt="Add list"
                  className="h-[22px] w-[22px]"
                />
              </Button>
            </div>

            {listItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`flex items-center justify-start p-0 h-auto ${
                  item.active ? "text-[#ff6f06]" : "text-white opacity-50"
                }`}
                onClick={() => handleNavClick(item.section)}
              >
                <span className="font-medium text-lg">{item.text}</span>
              </Button>
            ))}
          </div>

          {/* Features section */}
          <div className="flex flex-col gap-6 px-6 mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-bold">{t('features.title')}</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-[22px] w-[22px] p-0"
              >
                <img
                  src="/add-line--1--1.svg"
                  alt="Add feature"
                  className="h-[22px] w-[22px]"
                />
              </Button>
            </div>

            {featureItems.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 cursor-pointer"
                onClick={item.onClick}
              >
                <span className={`text-white opacity-50 font-medium text-lg ${
                  item.active ? 'text-[#ff6f06] opacity-100' : ''
                }`}>
                  {item.text}
                </span>
                <Badge
                  variant="outline"
                  className="w-2 h-2 p-0 rounded-full bg-current border-0"
                  style={{ color: item.color }}
                >
                  <img
                    src="/outline---messages--conversation---unread.svg"
                    alt="Feature indicator"
                    className="w-2 h-2"
                  />
                </Badge>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen bg-[#242b31] p-4 lg:p-8">
          <header className="pt-4 lg:pt-[31px]">
            <h1 className="font-semibold text-white text-lg">
              {greeting}, <span id="userName">{localStorage.getItem("userName") || "Jihan Haura"}</span>
            </h1>
            <p className="opacity-80 font-normal text-white text-lg mt-1">
              {currentDate}
            </p>
          </header>

          {showLanguageSelector ? (
            <div className="mt-8">
              <LanguageSelector />
            </div>
          ) : voiceToTextActive ? (
            <div className="mt-8">
              <VoiceToText onTextCapture={handleCapturedText} />
            </div>
          ) : formalizationActive ? (
            <div className="mt-8">
              <Formalization />
            </div>
          ) : localStorageActive ? (
            <div className="mt-8">
              <LocalStorage />
            </div>
          ) : aiIntegrationActive ? (
            <div className="mt-8">
              <Card className="bg-[#2f373e] rounded-lg p-6 text-center">
                <h2 className="text-white text-xl font-bold mb-4">{t('features.aiIntegration')}</h2>
                <div className="flex items-center justify-center py-12">
                  <p className="text-white text-lg">{t('comingSoon')}</p>
                </div>
                <div className="text-gray-400 text-md mt-4">
                  {t('aiIntegrationDesc')}
                </div>
              </Card>
            </div>
          ) : (
            <div className="mt-8 max-w-4xl mx-auto">
              {activeSection === 'addTask' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('todo.form.title')}</h2>
                  <Todo />
                </div>
              )}

              {activeSection === 'askAspri' && (
                <div className="space-y-6">
                  <AskAspri />
                </div>
              )}

              {activeSection === 'searchTask' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('searchTasks.title')}</h2>
                  <SearchTasks />
                </div>
              )}

              {activeSection === 'today' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('sidebar.navigation.today')}</h2>
                  <TodayTasks />
                </div>
              )}

              {activeSection === 'tomorrow' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('sidebar.navigation.tomorrow')}</h2>
                  <TomorrowTasks />
                </div>
              )}

              {activeSection === 'upcoming' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('sidebar.navigation.upcoming')}</h2>
                  <UpcomingTasks />
                </div>
              )}

              {activeSection === 'allTasks' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('sidebar.navigation.allTasks')}</h2>
                  <AllTasks />
                </div>
              )}

              {activeSection === 'completed' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('completedTasks.title')}</h2>
                  <CompletedTasks />
                </div>
              )}

              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('sidebar.lists.personal')}</h2>
                  <CategoryTaskList refreshTrigger={refreshTrigger} category={t('todo.list.personal')} />
                </div>
              )}

              {activeSection === 'work' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('sidebar.lists.work')}</h2>
                  <CategoryTaskList refreshTrigger={refreshTrigger} category={t('todo.list.work')} />
                </div>
              )}

              {(activeSection === 'emptyState' || !activeSection) && (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] px-4">
                  <div className="relative w-full max-w-[598px] aspect-[598/445]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src="/group-29.png"
                        alt="Empty state illustration"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <h2 className="text-white text-xl font-semibold mb-4">
                        {t('emptyState')}
                      </h2>
                      <Button
                        variant="default"
                        className="bg-[#ff6f06] hover:bg-[#e56300] text-white px-8 py-6"
                        onClick={() => setActiveSection('addTask')}
                      >
                        {t('startCreating')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};