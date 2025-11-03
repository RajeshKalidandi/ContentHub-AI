import React, { useState, useMemo } from 'react';
import HistoryIcon from './icons/HistoryIcon';
import { GeneratedContentBundle, Platform } from '../types';
import ContentPreview from './ContentPreview';
import LinkedInIcon from './icons/LinkedInIcon';
import TwitterIcon from './icons/TwitterIcon';
import DownloadIcon from './icons/DownloadIcon';
import ClockIcon from './icons/ClockIcon';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';


interface HistoryPageProps {
  history: GeneratedContentBundle[];
  onFeedbackUpdate: (bundleId: string, feedback: 'up' | 'down') => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onFeedbackUpdate }) => {
  const [platformFilter, setPlatformFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  const filteredHistory = useMemo(() => {
    return history.filter(bundle => {
      // Platform filter
      const platformMatch = platformFilter === 'All' || 
                            (platformFilter === Platform.LinkedIn && bundle.linkedinPosts.length > 0) || 
                            (platformFilter === Platform.Twitter && bundle.twitterPosts.length > 0);
      if (!platformMatch) return false;

      // Date filter
      const now = new Date();
      const bundleDate = new Date(bundle.createdAt);
      if (dateFilter === 'Today') {
        return bundleDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'Last 7 Days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return bundleDate >= sevenDaysAgo;
      }
      // 'All' time passes
      return true;
    });
  }, [history, platformFilter, dateFilter]);

  const handleDownloadImage = (imageUrl: string, topic: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const fileExtension = imageUrl.split(';')[0].split('/')[1] || 'png';
    const filename = `contenthub-ai-${topic.slice(0, 20).replace(/\s+/g, '-')}.${fileExtension}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Content History</h1>
        <p className="text-dark-text-secondary mt-1">
          Review and reuse your previously generated content.
        </p>
      </header>

      <div className="bg-dark-surface p-4 rounded-xl border border-dark-border mb-8 flex flex-col sm:flex-row flex-wrap gap-4">
        <div className="flex-grow">
          <label htmlFor="platformFilter" className="block text-xs font-medium text-dark-text-secondary mb-1">
            Platform
          </label>
          <select
            id="platformFilter"
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
          >
            <option value="All">All</option>
            <option value={Platform.LinkedIn}>LinkedIn</option>
            <option value={Platform.Twitter}>Twitter</option>
          </select>
        </div>
        <div className="flex-grow">
          <label htmlFor="dateFilter" className="block text-xs font-medium text-dark-text-secondary mb-1">
            Date
          </label>
          <select
            id="dateFilter"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-8">
        {filteredHistory.length > 0 ? (
          filteredHistory.map(bundle => (
            <div key={bundle.id} className="bg-dark-surface p-4 sm:p-6 rounded-xl border border-dark-border">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 pb-4 border-b border-dark-border">
                <div>
                  <p className="text-sm text-dark-text-secondary">Generated on {bundle.createdAt.toLocaleString()}</p>
                  <p className="font-semibold text-white mt-1">Topic: <span className="font-normal">{bundle.topic}</span></p>
                </div>
                 <div className="flex items-center gap-2 flex-shrink-0 ml-0 sm:ml-4 mt-3 sm:mt-0">
                    <button
                      onClick={() => onFeedbackUpdate(bundle.id, 'up')}
                      className={`p-2 rounded-full transition-colors ${bundle.feedback === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-dark-bg text-dark-text-secondary hover:bg-gray-800'}`}
                      aria-label="Good result"
                    >
                        <ThumbsUpIcon />
                    </button>
                    <button
                      onClick={() => onFeedbackUpdate(bundle.id, 'down')}
                      className={`p-2 rounded-full transition-colors ${bundle.feedback === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-dark-bg text-dark-text-secondary hover:bg-gray-800'}`}
                      aria-label="Bad result"
                    >
                        <ThumbsDownIcon />
                    </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-3">
                  <h3 className="font-semibold text-white">Generated Image</h3>
                  <img src={bundle.generatedImage} alt={bundle.generatedImageAltText} className="rounded-lg w-full" />
                  <p className="text-xs text-dark-text-secondary italic">
                      <strong>Alt text:</strong> "{bundle.generatedImageAltText}"
                  </p>
                  <button
                    onClick={() => handleDownloadImage(bundle.generatedImage, bundle.topic)}
                    className="w-full flex items-center justify-center bg-dark-bg px-4 py-2 border border-dark-border rounded-lg text-sm font-semibold hover:bg-dark-surface transition-colors"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download Image
                  </button>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-white flex items-center"><ClockIcon className="w-5 h-5 mr-2" /> Suggested Post Times</h3>
                    <div className="text-sm text-dark-text space-y-1">
                        <p><strong>LinkedIn:</strong> {bundle.timingSuggestions.linkedin.days} at {bundle.timingSuggestions.linkedin.times}</p>
                        <p><strong>Twitter:</strong> {bundle.timingSuggestions.twitter.days} at {bundle.timingSuggestions.twitter.times}</p>
                    </div>
                  </div>

                  {(platformFilter === 'All' || platformFilter === Platform.LinkedIn) && (
                     <div>
                        <h3 className="font-semibold mb-2 text-white flex items-center"><LinkedInIcon className="w-5 h-5 mr-2" /> LinkedIn Posts</h3>
                        <div className="space-y-4">
                        {bundle.linkedinPosts.map(post => <ContentPreview key={post.id} post={post} platform={Platform.LinkedIn} />)}
                        </div>
                    </div>
                  )}
                  {(platformFilter === 'All' || platformFilter === Platform.Twitter) && (
                     <div>
                        <h3 className="font-semibold mb-2 text-white flex items-center"><TwitterIcon className="w-5 h-5 mr-2" /> Twitter Posts</h3>
                        <div className="space-y-4">
                        {bundle.twitterPosts.map(post => <ContentPreview key={post.id} post={post} platform={Platform.Twitter} />)}
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-dark-border rounded-xl">
            <HistoryIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
            <h3 className="mt-2 text-lg font-medium text-white">
              {history.length === 0 ? 'No History Yet' : 'No Results Found'}
            </h3>
            <p className="mt-1 text-sm text-dark-text-secondary">
              {history.length === 0 
                ? 'Your generated content will appear here after you create some.'
                : 'Try adjusting your filters to find what you\'re looking for.'
              }
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryPage;
