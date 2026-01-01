
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PlantAnalysisResult } from '../types';
import GroundingSources from './GroundingSources';
import PlantAssistantChat from './PlantAssistantChat';
import { Sprout, RefreshCw, Copy, Check, Play, MessageCircleQuestion, Sparkles } from 'lucide-react';

interface ResultCardProps {
  result: PlantAnalysisResult;
  imageSrc: string;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, imageSrc, onReset }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const isVideoResult = !!result.videoUri;
  const plantNameForChat = result.commonName || result.scientificName || "this plant";

  return (
    <>
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-fade-in transition-colors duration-300 flex flex-col h-[85vh] relative">
        
        {/* Media Section */}
        <div className={`relative flex-shrink-0 w-full bg-slate-100 dark:bg-slate-700 group overflow-hidden ${isVideoResult ? 'h-3/5 bg-black' : 'h-48 md:h-64'}`}>
          
          {isVideoResult ? (
            <video 
              src={result.videoUri} 
              controls 
              autoPlay 
              loop 
              className="w-full h-full object-contain"
              poster={imageSrc}
            />
          ) : (
            <img 
              src={imageSrc} 
              alt="Identified Plant" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}

          {!isVideoResult && (
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
          )}

          {!isVideoResult && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
               <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 text-white shadow-sm">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Analysis Result</span>
               </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-stone-800 relative">
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            
            {isVideoResult ? (
               <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-full">
                    <Play className="w-8 h-8 text-teal-600 dark:text-teal-400 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Cinematic Video Generated</h2>
                    <p className="text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
                      Veo has brought your plant to life.
                    </p>
                  </div>
               </div>
            ) : (
              <>
                <div className="prose prose-stone dark:prose-invert 
                  prose-headings:text-teal-600 dark:prose-headings:text-teal-400
                  prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-2
                  prose-h2:text-lg md:prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-4
                  prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50/50 dark:prose-blockquote:bg-teal-900/10 dark:prose-blockquote:border-teal-400/50 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                  prose-p:text-stone-600 dark:prose-p:text-stone-300 
                  prose-li:text-stone-600 dark:prose-li:text-stone-300
                  prose-sm md:prose-base max-w-none leading-relaxed">
                  <ReactMarkdown>{result.text}</ReactMarkdown>
                </div>

                <GroundingSources metadata={result.groundingMetadata} />
                
                <div className="h-6"></div>
              </>
            )}
          </div>

          {/* Floating Action for Assistant (Hidden in Video Mode) */}
          {!isVideoResult && (
            <div className="absolute bottom-[100px] right-6 animate-bounce">
               <button 
                 onClick={() => setIsChatOpen(true)}
                 className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-teal-500/40 hover:scale-105 transition-transform"
               >
                 <Sparkles className="w-4 h-4" />
                 <span className="font-bold text-sm">Ask AI Assistant</span>
               </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t border-stone-100 dark:border-stone-700 bg-white dark:bg-stone-800 z-10 flex-shrink-0 flex flex-col gap-3">
            {!isVideoResult && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <MessageCircleQuestion className="w-5 h-5" />
                Ask Follow-up Questions
              </button>
            )}

            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-md"
            >
              <RefreshCw className="w-5 h-5" />
              {isVideoResult ? 'Create Another Video' : 'Scan Another Plant'}
            </button>
            
            {!isVideoResult && (
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-stone-200 dark:border-stone-600"
              >
                {isCopied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                <span>{isCopied ? 'Copied to Clipboard' : 'Copy Result'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <PlantAssistantChat 
        plantName={plantNameForChat}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default ResultCard;
