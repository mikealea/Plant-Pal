
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2, Sparkles, Volume2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { startPlantChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import VoiceAssistant from './VoiceAssistant';

interface PlantAssistantChatProps {
  plantName: string;
  isOpen: boolean;
  onClose: () => void;
}

const PlantAssistantChat: React.FC<PlantAssistantChatProps> = ({ plantName, isOpen, onClose }) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = startPlantChat(plantName);
      setMessages([
        { role: 'model', text: `Hi! I'm your Plant Assistant. I see you've identified a **${plantName}**. How can I help you care for it today?` }
      ]);
    }
  }, [isOpen, plantName]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isVoiceMode]);

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault();
    const prompt = customPrompt || input;
    if (!prompt.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message: prompt });
      
      let assistantText = "";
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        assistantText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: assistantText };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How often should I water it?",
    "Is it toxic to cats?",
    "Best soil type?",
    "Signs of overwatering?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl h-[90vh] sm:h-[80vh] bg-white dark:bg-stone-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        {isVoiceMode ? (
          <VoiceAssistant plantName={plantName} onClose={() => setIsVoiceMode(false)} />
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-teal-600 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Plant Assistant</h3>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">Context: {plantName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsVoiceMode(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Voice Mode
                </button>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-stone-50 dark:bg-stone-950/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-stone-800 text-teal-600 border border-teal-100 dark:border-stone-700'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-teal-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none border border-stone-100 dark:border-stone-800'
                    }`}>
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && !messages[messages.length - 1]?.text && (
                <div className="flex justify-start animate-pulse">
                   <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center">
                       <Bot className="w-4 h-4 text-stone-400" />
                     </div>
                     <div className="p-4 bg-white dark:bg-stone-800 rounded-2xl rounded-tl-none border border-stone-100 dark:border-stone-800">
                       <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                     </div>
                   </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            {/* Suggestion Bar */}
            {!isLoading && messages.length < 4 && (
              <div className="p-2 flex gap-2 overflow-x-auto no-scrollbar bg-stone-50 dark:bg-stone-950/50 border-t border-stone-100 dark:border-stone-800">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(undefined, s)}
                    className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-400 hover:border-teal-400 hover:text-teal-600 transition-colors shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your plant..."
                  className="flex-1 bg-stone-100 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none dark:text-white"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <div className="mt-2 text-[10px] text-center text-stone-400 font-medium flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-500" />
                Powered by Gemini AI Assistant
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlantAssistantChat;
