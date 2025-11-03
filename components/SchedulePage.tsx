
import React from 'react';
import ScheduleIcon from './icons/ScheduleIcon';

const SchedulePage: React.FC = () => {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Schedule Posts</h1>
        <p className="text-dark-text-secondary mt-1">
          Plan and automate your content calendar with ease.
        </p>
      </header>
      <div className="mt-10 text-center py-16 border-2 border-dashed border-dark-border rounded-xl">
        <ScheduleIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
        <h3 className="mt-2 text-lg font-medium text-white">Feature Coming Soon</h3>
        <p className="mt-1 text-sm text-dark-text-secondary">
          The content scheduling calendar is being built. Stay tuned!
        </p>
      </div>
    </>
  );
};

export default SchedulePage;
