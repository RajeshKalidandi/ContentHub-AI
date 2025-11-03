import React from 'react';
import { Page, AppMode } from '../types';
import AnalyzeIcon from './icons/AnalyzeIcon';
import AnalyticsIcon from './icons/AnalyticsIcon';
import GenerateIcon from './icons/GenerateIcon';
import HistoryIcon from './icons/HistoryIcon';
import SparklesIcon from './icons/SparklesIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${
      isActive
        ? 'bg-gradient-to-r from-brand-blue to-brand-purple text-white'
        : 'text-dark-text hover:bg-dark-surface'
    }`}
  >
    {icon}
    <span className="ml-4">{label}</span>
  </button>
);

interface SidebarProps {
  activePage: Page;
  onNavChange: (page: Page) => void;
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const ModeButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center p-2 rounded-md text-xs transition-colors ${
      isActive ? 'bg-brand-blue text-white' : 'hover:bg-dark-surface'
    }`}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </button>
);


const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavChange, appMode, onModeChange }) => {
  return (
    <div className="flex flex-col w-64 bg-dark-bg border-r border-dark-border min-h-screen p-4">
      <div className="hidden lg:flex items-center mb-10 px-2">
        <SparklesIcon className="w-8 h-8 text-brand-purple" />
        <h1 className="text-xl font-bold ml-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          ContentHub AI
        </h1>
      </div>
      <nav className="flex-grow space-y-2">
        <NavItem 
          icon={<AnalyzeIcon />} 
          label="Analyze" 
          isActive={activePage === Page.Analyze}
          onClick={() => onNavChange(Page.Analyze)} 
        />
        <NavItem 
          icon={<GenerateIcon />} 
          label="Generate" 
          isActive={activePage === Page.Generate}
          onClick={() => onNavChange(Page.Generate)}
        />
        <NavItem 
          icon={<HistoryIcon />} 
          label="History" 
          isActive={activePage === Page.History}
          onClick={() => onNavChange(Page.History)}
        />
        <NavItem 
          icon={<AnalyticsIcon />} 
          label="Analytics" 
          isActive={activePage === Page.Analytics}
          onClick={() => onNavChange(Page.Analytics)}
        />
      </nav>
      
      <div className="mt-10">
          <p className="text-xs font-semibold text-dark-text-secondary uppercase px-4 mb-2">Mode</p>
          <div className="flex items-center space-x-1 bg-dark-surface p-1 rounded-lg border border-dark-border">
              <ModeButton 
                  label="Creator"
                  icon={<SparklesIcon className="w-4 h-4" />}
                  isActive={appMode === AppMode.ContentCreator}
                  onClick={() => onModeChange(AppMode.ContentCreator)}
              />
              <ModeButton 
                  label="Job Seeker"
                  icon={<BriefcaseIcon className="w-4 h-4" />}
                  isActive={appMode === AppMode.JobSeeker}
                  onClick={() => onModeChange(AppMode.JobSeeker)}
              />
          </div>
      </div>

    </div>
  );
};

export default Sidebar;
