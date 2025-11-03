import React, { useState, useEffect, useMemo } from 'react';
import GeneratorForm from './GeneratorForm';
import { generateFullContentBundle, generateImage, generateAltText, getIdeaSuggestions } from '../services/geminiService';
import { GeneratedContentBundle, GenerationRequest, Platform, AppMode } from '../types';
import ContentPreview from './ContentPreview';
import SparklesIcon from './icons/SparklesIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import TwitterIcon from './icons/TwitterIcon';
import DownloadIcon from './icons/DownloadIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import ClockIcon from './icons/ClockIcon';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import ThumbsDownIcon from './icons/ThumbsDownIcon';


interface GeneratePageProps {
  onContentGenerated: (bundle: GeneratedContentBundle) => void;
  initialTopic: string | null;
  clearInitialTopic: () => void;
  history: GeneratedContentBundle[];
  onFeedbackUpdate: (bundleId: string, feedback: 'up' | 'down') => void;
  onImageUpdate: (bundleId: string, newImage: string, newAltText: string) => void;
  appMode: AppMode;
  resumeText: string;
  onResumeChange: (text: string) => void;
}

const GeneratePage: React.FC<GeneratePageProps> = ({ onContentGenerated, initialTopic, clearInitialTopic, history, onFeedbackUpdate, onImageUpdate, appMode, resumeText, onResumeChange }) => {
  const [generatedBundleId, setGeneratedBundleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ideaSuggestions, setIdeaSuggestions] = useState<string[]>([]);
  const [isSuggestingIdeas, setIsSuggestingIdeas] = useState(false);
  
  const displayedBundle = useMemo(() => {
    return history.find(b => b.id === generatedBundleId) || null;
  }, [history, generatedBundleId]);

  const pageConfig = {
      [AppMode.ContentCreator]: {
          title: "Content Generator",
          description: "Create compelling social media posts and images in one click.",
          ideasTitle: "Need Inspiration?",
          ideasDescription: "Get AI-powered ideas based on your generation history."
      },
      [AppMode.JobSeeker]: {
          title: "Job Search Post Generator",
          description: "Create posts to attract recruiters, based on your resume.",
          ideasTitle: "Post Ideas?",
          ideasDescription: "Get AI-powered ideas for your job search posts."
      }
  };
  const currentConfig = pageConfig[appMode];


  const handleGenerate = async (request: GenerationRequest) => {
    if (appMode === AppMode.JobSeeker && !resumeText.trim()) {
        setError("Please provide your resume text before generating job seeker content.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedBundleId(null);
    setIdeaSuggestions([]);

    try {
      const bundleData = await generateFullContentBundle(request, appMode, resumeText);
      const newBundle: GeneratedContentBundle = {
        ...bundleData,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date(),
        feedback: null,
      };
      onContentGenerated(newBundle);
      setGeneratedBundleId(newBundle.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      handleGenerate({ topic: initialTopic });
      clearInitialTopic();
    }
  }, [initialTopic]);

  const handleRegenerateImage = async () => {
    if (!displayedBundle) return;
    setIsRegeneratingImage(true);
    setError(null);
    try {
      const newImage = await generateImage(displayedBundle.topic);
      const newAltText = await generateAltText(displayedBundle.topic);
      onImageUpdate(displayedBundle.id, newImage, newAltText);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while regenerating the image.');
    } finally {
      setIsRegeneratingImage(false);
    }
  };
  
  const handleDownloadImage = () => {
    if (!displayedBundle) return;
    const link = document.createElement('a');
    link.href = displayedBundle.generatedImage;
    const fileExtension = displayedBundle.generatedImage.split(';')[0].split('/')[1] || 'png';
    const filename = `contenthub-ai-${displayedBundle.topic.slice(0, 20).replace(/\s+/g, '-')}.${fileExtension}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSuggestIdeas = async () => {
    setIsSuggestingIdeas(true);
    setError(null);
    try {
      const ideas = await getIdeaSuggestions(history, appMode);
      setIdeaSuggestions(ideas);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while suggesting ideas.');
    } finally {
      setIsSuggestingIdeas(false);
    }
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">{currentConfig.title}</h1>
        <p className="text-dark-text-secondary mt-1">{currentConfig.description}</p>
      </header>

      {appMode === AppMode.JobSeeker && (
          <div className="mb-6 bg-dark-surface p-6 rounded-xl border border-dark-border">
              <label htmlFor="resume" className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Your Resume (as knowledge base)
              </label>
              <textarea 
                  id="resume"
                  rows={8}
                  value={resumeText}
                  onChange={(e) => onResumeChange(e.target.value)}
                  placeholder="Paste your resume here... The AI will use this to highlight your skills and experience."
                  className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
              />
          </div>
      )}

      <div className="bg-dark-surface p-6 rounded-xl border border-dark-border">
        <GeneratorForm onGenerate={handleGenerate} isLoading={isLoading} initialTopic={initialTopic} appMode={appMode} />
      </div>

      <div className="mt-6 bg-dark-surface p-6 rounded-xl border border-dark-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <LightbulbIcon className="w-6 h-6 mr-3 text-yellow-400 flex-shrink-0" />
            <div className="flex-grow">
                <h3 className="font-bold text-white">{currentConfig.ideasTitle}</h3>
                <p className="text-sm text-dark-text-secondary">{currentConfig.ideasDescription}</p>
            </div>
            <button
                onClick={handleSuggestIdeas}
                disabled={isSuggestingIdeas || isLoading}
                className="mt-3 sm:mt-0 sm:ml-auto w-full sm:w-auto flex-shrink-0 flex items-center justify-center bg-dark-bg px-4 py-2 border border-dark-border rounded-lg text-sm font-semibold hover:bg-dark-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSuggestingIdeas ? 'Thinking...' : 'Suggest Ideas'}
            </button>
        </div>
        {ideaSuggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dark-border space-y-2">
                {ideaSuggestions.map((idea, index) => (
                    <button key={index} onClick={() => handleGenerate({ topic: idea })} className="w-full text-left p-3 rounded-lg bg-dark-bg hover:bg-gray-800 transition-colors">
                        <p className="text-sm font-medium">{idea}</p>
                    </button>
                ))}
            </div>
        )}
      </div>

      {error && (
        <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
         <div className="mt-10 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
            <p className="mt-4 text-dark-text-secondary">Generating content and image... This may take a moment.</p>
        </div>
      )}

      {displayedBundle && (
        <div className='mt-10 space-y-10'>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-3 text-brand-purple" />
                        Generated Result
                    </h2>
                     <div className="flex items-center gap-2">
                        <button
                          onClick={() => onFeedbackUpdate(displayedBundle.id, 'up')}
                          className={`p-2 rounded-full transition-colors ${displayedBundle.feedback === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-dark-bg text-dark-text-secondary hover:bg-dark-surface'}`}
                          aria-label="Good result"
                        >
                            <ThumbsUpIcon />
                        </button>
                        <button
                          onClick={() => onFeedbackUpdate(displayedBundle.id, 'down')}
                          className={`p-2 rounded-full transition-colors ${displayedBundle.feedback === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-dark-bg text-dark-text-secondary hover:bg-dark-surface'}`}
                          aria-label="Bad result"
                        >
                            <ThumbsDownIcon />
                        </button>
                    </div>
                </div>

                 <div className="bg-dark-surface p-4 rounded-xl border border-dark-border">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                      <h3 className="font-semibold text-white">Generated Image</h3>
                      <div className="flex items-center gap-2">
                          <button
                              onClick={handleRegenerateImage}
                              disabled={isRegeneratingImage || isLoading}
                              className="flex items-center bg-dark-bg px-3 py-1.5 border border-dark-border rounded-md text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {isRegeneratingImage ? '...' : 'Regenerate'}
                          </button>
                          <button
                              onClick={handleDownloadImage}
                              disabled={isLoading}
                              className="flex items-center bg-dark-bg px-3 py-1.5 border border-dark-border rounded-md text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                              >
                              <DownloadIcon className="w-4 h-4 mr-1.5" />
                              Download
                          </button>
                      </div>
                    </div>
                    <img src={displayedBundle.generatedImage} alt={displayedBundle.generatedImageAltText} className="rounded-lg w-full max-w-lg mx-auto" />
                    <p className="text-sm text-center text-dark-text-secondary mt-3 italic px-4">
                        <strong>Alt text:</strong> "{displayedBundle.generatedImageAltText}"
                    </p>
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <ClockIcon className="w-6 h-6 mr-3 text-brand-purple" />
                    Suggested Post Times
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-dark-surface p-4 rounded-xl border border-dark-border">
                        <h3 className="font-semibold text-white flex items-center"><LinkedInIcon className="w-5 h-5 mr-2" /> LinkedIn</h3>
                        <p className="text-sm text-dark-text mt-2"><strong>Days:</strong> {displayedBundle.timingSuggestions.linkedin.days}</p>
                        <p className="text-sm text-dark-text"><strong>Times:</strong> {displayedBundle.timingSuggestions.linkedin.times}</p>
                        <p className="text-xs text-dark-text-secondary mt-2"><em>{displayedBundle.timingSuggestions.linkedin.reason}</em></p>
                    </div>
                    <div className="bg-dark-surface p-4 rounded-xl border border-dark-border">
                        <h3 className="font-semibold text-white flex items-center"><TwitterIcon className="w-5 h-5 mr-2" /> Twitter</h3>
                        <p className="text-sm text-dark-text mt-2"><strong>Days:</strong> {displayedBundle.timingSuggestions.twitter.days}</p>
                        <p className="text-sm text-dark-text"><strong>Times:</strong> {displayedBundle.timingSuggestions.twitter.times}</p>
                        <p className="text-xs text-dark-text-secondary mt-2"><em>{displayedBundle.timingSuggestions.twitter.reason}</em></p>
                    </div>
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <LinkedInIcon className="w-6 h-6 mr-3 text-white" />
                    LinkedIn Variations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedBundle.linkedinPosts.map(post => (
                        <ContentPreview
                            key={post.id}
                            post={post}
                            platform={Platform.LinkedIn}
                        />
                    ))}
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <TwitterIcon className="w-6 h-6 mr-3 text-white" />
                    Twitter Variations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedBundle.twitterPosts.map(post => (
                        <ContentPreview
                            key={post.id}
                            post={post}
                            platform={Platform.Twitter}
                        />
                    ))}
                </div>
            </div>
            
            {displayedBundle.groundingChunks.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Sources</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {displayedBundle.groundingChunks.map((chunk, index) => chunk.web && (
                        <li key={index}>
                            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {chunk.web.title || chunk.web.uri}
                            </a>
                        </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      )}

      {!isLoading && !displayedBundle && (
         <div className="mt-10 text-center py-16 border-2 border-dashed border-dark-border rounded-xl">
            <SparklesIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
            <h3 className="mt-2 text-sm font-medium text-white">Your content will appear here</h3>
            <p className="mt-1 text-sm text-dark-text-secondary">Fill out the form above or get some ideas to get started.</p>
         </div>
      )}
    </>
  );
};

export default GeneratePage;
