import React, { useState, useEffect } from 'react';
import { GenerationRequest, AppMode } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface GeneratorFormProps {
  onGenerate: (request: GenerationRequest) => void;
  isLoading: boolean;
  initialTopic?: string | null;
  appMode: AppMode;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading, initialTopic, appMode }) => {
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate({ topic });
    }
  };
  
  const formConfig = {
    [AppMode.ContentCreator]: {
        label: "What do you want to post about?",
        placeholder: "e.g., The future of AI in content marketing..."
    },
    [AppMode.JobSeeker]: {
        label: "What role, company, or skill are you targeting?",
        placeholder: "e.g., Senior Product Manager at Google, or proficiency in Python and data analysis..."
    }
  };
  
  const currentConfig = formConfig[appMode];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-dark-text-secondary mb-2">
          {currentConfig.label}
        </label>
        <textarea
          id="topic"
          rows={4}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={currentConfig.placeholder}
          className="w-full bg-dark-surface border border-dark-border rounded-lg p-3 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className="w-full flex justify-center items-center bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Content & Image
          </>
        )}
      </button>
    </form>
  );
};

export default GeneratorForm;
