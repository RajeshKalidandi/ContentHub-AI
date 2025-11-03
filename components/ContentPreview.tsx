import React, { useState } from 'react';
import { ContentPost, Platform } from '../types';
import LinkedInIcon from './icons/LinkedInIcon';
import TwitterIcon from './icons/TwitterIcon';
import CopyIcon from './icons/CopyIcon';

interface ContentPreviewProps {
  post: ContentPost;
  platform: Platform;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ post, platform }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const htmlContent = post.content.replace(/\n/g, '<br>');
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([post.content], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        })
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy rich text, falling back to plain text.', err);
      navigator.clipboard.writeText(post.content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(fallbackErr => {
        console.error('Fallback plain text copy failed: ', fallbackErr);
      });
    }
  };

  const formattedContent = post.content.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div 
      className={`bg-dark-surface border rounded-xl p-4 transition-all duration-300 flex flex-col h-full border-dark-border hover:border-gray-600`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {platform === Platform.LinkedIn ? <LinkedInIcon className="text-[#0A66C2]" /> : <TwitterIcon />}
          <span className="ml-2 text-sm font-semibold">{platform} Preview</span>
        </div>
        <button onClick={handleCopy} className="text-dark-text-secondary hover:text-white transition text-xs flex items-center">
          <CopyIcon className="w-4 h-4 mr-1" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="text-sm text-dark-text whitespace-pre-wrap leading-relaxed flex-grow">
        {formattedContent}
      </div>
    </div>
  );
};

export default ContentPreview;
