import React, { useMemo } from 'react';
import { GeneratedContentBundle, Framework } from '../types';
import AnalyticsIcon from './icons/AnalyticsIcon';
import ThumbsUpIcon from './icons/ThumbsUpIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import TwitterIcon from './icons/TwitterIcon';
import { FRAMEWORKS } from '../constants';
import ChartBarIcon from './icons/ChartBarIcon';

interface AnalyticsPageProps {
  history: GeneratedContentBundle[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-dark-surface p-4 rounded-xl border border-dark-border">
        <div className="flex items-center">
            <div className="p-3 bg-dark-bg rounded-lg mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-dark-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);


const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ history }) => {
  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const totalGenerations = history.length;
    const totalLinkedInPosts = history.reduce((acc, bundle) => acc + bundle.linkedinPosts.length, 0);
    const totalTwitterPosts = history.reduce((acc, bundle) => acc + bundle.twitterPosts.length, 0);

    const bundlesWithFeedback = history.filter(b => b.feedback !== null);
    const positiveFeedbackCount = bundlesWithFeedback.filter(b => b.feedback === 'up').length;
    const positiveFeedbackRate = bundlesWithFeedback.length > 0 ? (positiveFeedbackCount / bundlesWithFeedback.length) * 100 : 0;

    const frameworkStats: { [key in Framework]?: { total: number; positive: number } } = {};
    for(const framework of FRAMEWORKS) {
        frameworkStats[framework] = { total: 0, positive: 0 };
    }

    for (const bundle of bundlesWithFeedback) {
      // Framework might not exist on older data, so check
      const framework = bundle.linkedinPosts[0]?.frameworkUsed;
      if (framework && frameworkStats[framework]) {
        frameworkStats[framework]!.total++;
        if (bundle.feedback === 'up') {
          frameworkStats[framework]!.positive++;
        }
      }
    }

    const frameworkPerformance = Object.entries(frameworkStats)
      .map(([framework, data]) => ({
        framework: framework as Framework,
        performance: data!.total > 0 ? (data!.positive / data!.total) * 100 : 0,
        count: data!.total,
      }))
      .sort((a, b) => b.performance - a.performance);

    const topTopics = history
      .filter(b => b.feedback === 'up')
      .map(b => b.topic)
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, 5);

    return {
      totalGenerations,
      totalLinkedInPosts,
      totalTwitterPosts,
      positiveFeedbackRate,
      frameworkPerformance,
      topTopics,
    };
  }, [history]);

  if (!stats) {
    return (
      <>
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-dark-text-secondary mt-1">
            Track your content performance and gain valuable insights.
            </p>
        </header>
        <div className="mt-10 text-center py-16 border-2 border-dashed border-dark-border rounded-xl">
            <AnalyticsIcon className="mx-auto h-12 w-12 text-dark-text-secondary"/>
            <h3 className="mt-2 text-lg font-medium text-white">No Data Yet</h3>
            <p className="mt-1 text-sm text-dark-text-secondary">
            Generate some content and provide feedback to see your analytics.
            </p>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-dark-text-secondary mt-1">
          Insights from your generated content and feedback.
        </p>
      </header>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Generations" value={stats.totalGenerations} icon={<AnalyticsIcon className="w-6 h-6 text-brand-purple" />} />
            <StatCard title="Posts Created" value={stats.totalLinkedInPosts + stats.totalTwitterPosts} icon={<div className="flex text-dark-text-secondary"><LinkedInIcon /><TwitterIcon/></div>} />
            <StatCard title="Positive Feedback" value={`${stats.positiveFeedbackRate.toFixed(0)}%`} icon={<ThumbsUpIcon className="w-6 h-6 text-green-400" />} />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-3" />
            Framework Performance
          </h2>
          <div className="bg-dark-surface p-6 rounded-xl border border-dark-border">
            <p className="text-sm text-dark-text-secondary mb-4">Positive feedback rate for each content framework.</p>
            <div className="space-y-4">
              {stats.frameworkPerformance.map(({ framework, performance, count }) => (
                <div key={framework}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{framework}</span>
                        <span className="text-xs text-dark-text-secondary">{count > 0 ? `${count} rated` : 'Not used'}</span>
                    </div>
                    <div className="flex items-center">
                        <div className="flex-1 bg-dark-bg rounded-full h-3">
                            <div
                            className="bg-gradient-to-r from-brand-blue to-brand-purple h-3 rounded-full"
                            style={{ width: `${performance}%` }}
                            ></div>
                        </div>
                        <span className="w-12 text-right text-sm font-semibold">{performance.toFixed(0)}%</span>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Top Performing Topics</h2>
          <div className="bg-dark-surface p-6 rounded-xl border border-dark-border">
            {stats.topTopics.length > 0 ? (
                 <ul className="space-y-3">
                    {stats.topTopics.map((topic, index) => (
                        <li key={index} className="flex items-start p-2 bg-dark-bg rounded-md">
                            <span className="text-green-400 mr-3 mt-1"><ThumbsUpIcon /></span>
                            <p className="text-sm text-dark-text">{topic}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-dark-text-secondary text-center py-4">Provide "thumbs up" feedback on generated content to see your top topics here.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default AnalyticsPage;
