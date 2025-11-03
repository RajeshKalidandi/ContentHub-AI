import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import GeneratePage from './components/GeneratePage';
import AnalyzePage from './components/AnalyzePage';
import HistoryPage from './components/HistoryPage';
import AnalyticsPage from './components/AnalyticsPage';
import { Page, GeneratedContentBundle, TrendingTopic, AppMode } from './types';
import MenuIcon from './components/icons/MenuIcon';
import SparklesIcon from './components/icons/SparklesIcon';


const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.Generate);
  const [history, setHistory] = useState<GeneratedContentBundle[]>([]);
  const [topicFromTrend, setTopicFromTrend] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.ContentCreator);
  const [resumeText, setResumeText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleContentGenerated = (newBundle: GeneratedContentBundle) => {
    setHistory(prev => [newBundle, ...prev]);
  };

  const handleTopicSelect = (trend: TrendingTopic) => {
    const fullTopic = `${trend.topic}: ${trend.description}`;
    setTopicFromTrend(fullTopic);
    setActivePage(Page.Generate);
  };

  const handleFeedbackUpdate = (bundleId: string, feedback: 'up' | 'down') => {
    setHistory(prevHistory => 
      prevHistory.map(bundle => {
        if (bundle.id === bundleId) {
          const newFeedback = bundle.feedback === feedback ? null : feedback;
          return { ...bundle, feedback: newFeedback };
        }
        return bundle;
      })
    );
  };

  const handleImageUpdate = (bundleId: string, newImage: string, newAltText: string) => {
    setHistory(prevHistory => prevHistory.map(bundle => 
      bundle.id === bundleId ? { ...bundle, generatedImage: newImage, generatedImageAltText: newAltText } : bundle
    ));
  };

  const handleNavChange = (page: Page) => {
    setActivePage(page);
    setIsSidebarOpen(false); // Close sidebar on nav change
  }

  const renderContent = () => {
    switch (activePage) {
      case Page.Generate:
        return <GeneratePage 
                  onContentGenerated={handleContentGenerated} 
                  initialTopic={topicFromTrend}
                  clearInitialTopic={() => setTopicFromTrend(null)}
                  history={history}
                  onFeedbackUpdate={handleFeedbackUpdate}
                  onImageUpdate={handleImageUpdate}
                  appMode={appMode}
                  resumeText={resumeText}
                  onResumeChange={setResumeText}
                />;
      case Page.Analyze:
        return <AnalyzePage onTopicSelect={handleTopicSelect} appMode={appMode} />;
      case Page.History:
        return <HistoryPage 
                  history={history} 
                  onFeedbackUpdate={handleFeedbackUpdate} 
                />;
      case Page.Analytics:
        return <AnalyticsPage history={history} />;
      default:
        return <GeneratePage 
                  onContentGenerated={handleContentGenerated} 
                  initialTopic={topicFromTrend}
                  clearInitialTopic={() => setTopicFromTrend(null)}
                  history={history}
                  onFeedbackUpdate={handleFeedbackUpdate}
                  onImageUpdate={handleImageUpdate}
                  appMode={appMode}
                  resumeText={resumeText}
                  onResumeChange={setResumeText}
                />;
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-bg text-dark-text">
      <div className={`fixed inset-0 z-30 bg-black/50 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      <div className={`fixed z-40 lg:static lg:z-auto lg:translate-x-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          activePage={activePage} 
          onNavChange={handleNavChange} 
          appMode={appMode}
          onModeChange={setAppMode}
        />
      </div>
      <main className="flex-1 p-6 sm:p-8 md:p-12 overflow-y-auto">
        <div className="lg:hidden flex items-center mb-6">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-md hover:bg-dark-surface">
            <MenuIcon />
          </button>
           <div className="flex items-center ml-4">
              <SparklesIcon className="w-7 h-7 text-brand-purple" />
              <h1 className="text-lg font-bold ml-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                ContentHub AI
              </h1>
            </div>
        </div>
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
