import React from 'react';
import { GroundingMetadata } from '../types';
import { ExternalLink, Search } from 'lucide-react';

interface GroundingSourcesProps {
  metadata?: GroundingMetadata;
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ metadata }) => {
  if (!metadata?.groundingChunks || metadata.groundingChunks.length === 0) {
    return null;
  }

  // Filter chunks that have web URLs
  const sources = metadata.groundingChunks.filter(chunk => chunk.web?.uri);

  if (sources.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
        <Search className="w-4 h-4" />
        <span>Verified with Google Search</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.web?.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors shadow-sm"
          >
            <span className="truncate max-w-[200px]">{source.web?.title || 'Source'}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        ))}
      </div>
      {metadata.searchEntryPoint?.renderedContent && (
        <div 
          className="mt-4 text-xs text-slate-400 dark:text-slate-500" 
          dangerouslySetInnerHTML={{ __html: metadata.searchEntryPoint.renderedContent }} 
        />
      )}
    </div>
  );
};

export default GroundingSources;