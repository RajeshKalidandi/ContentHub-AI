import React, { useState } from 'react';
import AnalyzeIcon from './icons/AnalyzeIcon';
import { getTrendingTopics } from '../services/geminiService';
import { TrendingTopic, AppMode } from '../types';
import SparklesIcon from './icons/SparklesIcon';

const CONTENT_NICHES = ['Technology', 'Marketing', 'Business', 'Artificial Intelligence', 'Finance'];
const JOB_NICHES = ['Software Engineering', 'Product Management', 'Marketing', 'Data Science', 'Finance & Accounting'];


interface AnalyzePageProps {
  onTopicSelect: (topic: TrendingTopic) => void;
  appMode: AppMode;
}

const AnalyzePage: React.FC<AnalyzePageProps> = ({ onTopicSelect, appMode }) => {
  const NICHES = appMode === AppMode.ContentCreator ? CONTENT_NICHES : JOB_NICHES;
  const [selectedNiche, setSelectedNiche] = useState<string>(NICHES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  [React.useEffect(() => {
    setSelectedNiche(NICHES[0]);
    setTrends([]);
  }, [appMode]]);
  const [trends, setTrends] = useState<TrendingTopic[]>([]);

  const pageConfig = {
    [AppMode.ContentCreator]: {
        title: "Analyze Trends",
        description: "Discover real-time trending topics in your industry.",
        buttonText: "Find Trends",
        resultsTitle: "Top 5 Trends for"
    },
    [AppMode.JobSeeker]: {
        title: "Analyze Job Market",
        description: "Discover trending skills and topics in your career field.",
        buttonText: "Find Job Trends",
        resultsTitle: "Top 5 Job Market Trends for"
    }
  };
  const currentConfig = pageConfig[appMode];


  const handleFetchTrends = async () => {
    setIsLoading(true);
    setError(null);
    setTrends([]);
    try {
      const fetchedTrends = await getTrendingTopics(selectedNiche, appMode);
      setTrends(fetchedTrends);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">{currentConfig.title}</h1>
        <p className="text-dark-text-secondary mt-1">
          {currentConfig.description}
        </p>
      </header>

      <div className="bg-dark-surface p-6 rounded-xl border border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="niche" className="block text-sm font-medium text-dark-text-secondary mb-2">
              Select your field
            </label>
            <select
              id="niche"
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
            >
              {NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleFetchTrends}
            disabled={isLoading}
            className="w-full flex justify-center items-center bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : currentConfig.buttonText}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-10">
        {isLoading && (
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
                <p className="mt-4 text-dark-text-secondary">Searching for the latest trends...</p>
            </div>
        )}

        {!isLoading && trends.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-3 text-brand-purple" />
                {currentConfig.resultsTitle} {selectedNiche}
            </h2>
            {trends.map((trend, index) => (
              <button 
                key={index} 
                onClick={() => onTopicSelect(trend)}
                className="w-full text-left bg-dark-surface p-5 rounded-lg border border-dark-border hover:border-brand-blue transition-all duration-200 cursor-pointer"
              >
                <h3 className="font-bold text-lg text-white">{trend.topic}</h3>
                <p className="text-sm text-dark-text-secondary mt-1">{trend.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {trend.hashtags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs font-medium rounded-full">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {!isLoading && trends.length === 0 && (
            <div className="mt-10 text-center py-16 border-2 border-dashed border-dark-border rounded-xl">
                <AnalyzeIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
                <h3 className="mt-2 text-sm font-medium text-white">Trending topics will appear here</h3>
                <p className="mt-1 text-sm text-dark-text-secondary">Select a field and click "{currentConfig.buttonText}" to get started.</p>
            </div>
        )}
      </div>
    </>
  );
};

export default AnalyzePage;
