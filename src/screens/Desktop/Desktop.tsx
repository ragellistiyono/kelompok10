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
import { getStoredTasks, saveTasks } from "../../lib/api";
import { CATEGORY_KEYS, getCategoryKey } from "../../lib/categoryUtils";

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
    console.log('Refreshing tasks due to section change:', activeSection);
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
    console.log('Switching to section:', section);
    setActiveSection(section);
    // Force refresh tasks when switching sections
    setRefreshTrigger(Date.now());
    // Close any open feature panels
    setShowLanguageSelector(false);
    setVoiceToTextActive(false);
    setFormalizationActive(false);
    setLocalStorageActive(false);
    setAiIntegrationActive(false);
  };

  // Global handler to refresh all task lists when a task is added
  const handleGlobalTaskAdded = () => {
    console.log('Global task added handler triggered');
    // Increment refresh counter to trigger reload of all task lists
    const newRefreshValue = Date.now();
    setRefreshTrigger(newRefreshValue);
    
    // Automatically navigate to the appropriate section based on the task category
    // This will be implemented in future updates if needed
  };

  // Function to force refresh tasks
  const forceRefreshTasks = () => {
    const newRefreshValue = Date.now();
    console.log('Forcing refresh of all tasks:', newRefreshValue);
    setRefreshTrigger(newRefreshValue);
  };

  // Function to fix task categories in localStorage
  const fixTaskCategories = () => {
    const tasks = getStoredTasks();
    console.log('Current tasks in localStorage:', tasks);
    
    const fixedTasks = tasks.map(task => {
      // Ensure task has meta object
      if (!task.meta) task.meta = {};
      
      // Set categoryKey based on category if not already set
      if (task.category && !task.meta.categoryKey) {
        const normalizedKey = getCategoryKey(task.category);
        task.meta.categoryKey = normalizedKey;
        console.log(`Task ${task.id}: Set category key to ${normalizedKey} from "${task.category}"`);
      }
      
      return task;
    });
    
    // Save fixed tasks
    saveTasks(fixedTasks);
    console.log('Tasks fixed and saved:', fixedTasks);
    
    // Refresh display
    forceRefreshTasks();
  }

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
          className="lg:hidden fixed top-4 right-4 z-50 text-white p-2 bg-[#2f373e] rounded-md shadow-md"
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
              d={isSidebarOpen 
                ? "M6 18L18 6M6 6l12 12" // X icon for close
                : "M4 6h16M4 12h16M4 18h16" // Hamburger icon
              }
            />
          </svg>
        </button>

        {/* Sidebar - Improved mobile handling */}
        <aside
          className={`fixed lg:static w-[280px] h-screen bg-[#1a1f23] transition-transform duration-300 z-40 overflow-y-auto
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            ${isSidebarOpen ? 'shadow-lg' : ''}`}
        >
          {/* Close button inside sidebar - only visible when sidebar is open on mobile */}
          <button
            className="lg:hidden absolute top-4 right-4 z-50 text-white p-2"
            onClick={() => setIsSidebarOpen(false)}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

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
                className="h-[22px] w-[22px] p-0 hidden lg:block"
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

        {/* Main Content Area with improved mobile spacing */}
        <main className="flex-1 min-h-screen bg-[#242b31] p-4 lg:p-8">
          {/* Header with better mobile spacing */}
          <header className="pt-14 lg:pt-[31px] relative">
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
            <div className="mt-4 sm:mt-6 md:mt-8 px-1 sm:px-2 md:px-0">
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
              <Card className="bg-[#2f373e] rounded-lg p-6">
                <h2 className="text-white text-xl font-bold mb-4">{t('features.aiIntegration')}</h2>
                
                <div className="space-y-6">
                  {/* AI Providers Section */}
                  <div className="bg-[#242b31] rounded-lg p-4">
                    <h3 className="text-white text-lg font-medium mb-3">{t('aiIntegration.provider')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#1a1f23] p-3 rounded-lg flex items-center space-x-3">
                        <div className="bg-[#ff6f06] p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                            <path d="M2 17l10 5 10-5"></path>
                            <path d="M2 12l10 5 10-5"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">Google Gemini</p>
                          <p className="text-gray-400 text-sm">Gemini 2.0 Flash</p>
                        </div>
                      </div>
                      <div className="bg-[#1a1f23] p-3 rounded-lg flex items-center space-x-3">
                        <div className="bg-[#ff6f06] p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M16 12l-4-4-4 4"></path>
                            <path d="M8 12l4 4 4-4"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">OpenAI</p>
                          <p className="text-gray-400 text-sm">GPT-4o, GPT-3.5 Turbo</p>
                        </div>
                      </div>
                      <div className="bg-[#1a1f23] p-3 rounded-lg flex items-center space-x-3">
                        <div className="bg-[#ff6f06] p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                            <path d="M8 7h6"></path>
                            <path d="M8 11h8"></path>
                            <path d="M8 15h6"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">Claude</p>
                          <p className="text-gray-400 text-sm">Claude 3.7 Sonnet</p>
                        </div>
                      </div>
                      <div className="bg-[#1a1f23] p-3 rounded-lg flex items-center space-x-3">
                        <div className="bg-[#ff6f06] p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9-9v18"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">DeepSeek</p>
                          <p className="text-gray-400 text-sm">DeepSeek Chat</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Features Section */}
                  <div className="bg-[#242b31] rounded-lg p-4">
                    <h3 className="text-white text-lg font-medium mb-3">{t('aiIntegration.featureDesc')}</h3>
                    <div className="space-y-3">
                      <div className="bg-[#1a1f23] p-3 rounded-lg flex items-start space-x-3">
                        <div className="bg-[#ff6f06] p-2 rounded-md mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M6 18h8"></path>
                            <path d="M3 22h18"></path>
                            <path d="M14 22a7 7 0 1 0 0-14h-1"></path>
                            <path d="M9 14h2"></path>
                            <path d="M9 12a2 2 0 0 1 0-4h1a2 2 0 0 1 0 4"></path>
                            <path d="M3 10h2"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{t('aiIntegration.taskEnhancementTitle')}</p>
                          <p className="text-gray-400 text-sm">{t('aiIntegration.taskEnhancementDesc')}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#1a1f23] p-3 rounded-lg flex items-start space-x-3">
                        <div className="bg-[#ff6f06] p-2 rounded-md mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polygon points="10 8 16 12 10 16 10 8"></polygon>
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{t('aiIntegration.askAspriTitle')}</p>
                          <p className="text-gray-400 text-sm">{t('aiIntegration.askAspriDesc')}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#1a1f23] p-3 rounded-lg flex items-start space-x-3">
                        <div className="bg-[#ff6f06] p-2 rounded-md mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path>
                            <circle cx="17" cy="7" r="5"></circle>
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{t('aiIntegration.apiKeyTitle')}</p>
                          <p className="text-gray-400 text-sm">{t('aiIntegration.apiKeyDesc')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Getting Started Button */}
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => handleNavClick('askAspri')}
                      className="bg-[#ff6f06] hover:bg-[#e56300] text-white px-6 py-3"
                    >
                      {t('aiIntegration.getStarted')}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="mt-8 max-w-4xl mx-auto">
              {activeSection === 'addTask' && (
                <div className="space-y-6">
                  <h2 className="text-white text-xl font-bold">{t('todo.form.title')}</h2>
                  <Todo onTaskAdded={handleGlobalTaskAdded} />
                  
                  {/* Add debug buttons - more responsive */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button 
                      onClick={forceRefreshTasks}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Force Refresh
                    </button>
                    <button 
                      onClick={fixTaskCategories}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                    >
                      Fix Categories
                    </button>
                  </div>
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