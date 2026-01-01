
import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Bot, User, Sparkles, Loader2, Volume2 } from 'lucide-react';
import { connectPlantVoice, createPcmBlob } from '../services/geminiLiveService';

interface VoiceAssistantProps {
  plantName: string;
  onClose: () => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ plantName, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [userText, setUserText] = useState('');
  const [aiText, setAiText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let currentInputTranscription = "";
    let currentOutputTranscription = "";

    const startSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.ref = stream;
        
        const { sessionPromise, audioContext } = connectPlantVoice(plantName, {
          onTranscription: (text, role) => {
            if (role === 'user') {
              currentInputTranscription += text;
              setUserText(currentInputTranscription);
            } else {
              currentOutputTranscription += text;
              setAiText(currentOutputTranscription);
            }
          },
          onTurnComplete: () => {
            currentInputTranscription = "";
            currentOutputTranscription = "";
          },
          onError: (err) => setError(err),
          onClose: () => onClose(),
        });

        audioContextRef.current = audioContext;
        const session = await sessionPromise;
        sessionRef.current = session;
        setIsConnecting(false);
        setIsListening(true);

        // Setup microphone streaming
        const inputCtx = new AudioContext({ sampleRate: 16000 });
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm = createPcmBlob(inputData);
          session.sendRealtimeInput({ media: pcm });
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);

      } catch (err: any) {
        setError(err.message || "Could not access microphone.");
        setIsConnecting(false);
      }
    };

    startSession();

    return () => {
      sessionRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close();
    };
  }, [plantName]);

  return (
    <div className="flex-1 flex flex-col bg-stone-950 text-white relative overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 rounded-lg">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Voice Mode</h3>
            <p className="text-[10px] text-teal-400 font-mono uppercase tracking-widest">Live Session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {isListening && (
             <div className="flex gap-1">
               <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce"></span>
             </div>
           )}
        </div>
      </div>

      {/* Center Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {isConnecting ? (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
            <p className="text-stone-400 font-medium animate-pulse">Establishing secure link...</p>
          </div>
        ) : error ? (
          <div className="text-center bg-red-900/20 p-6 rounded-3xl border border-red-500/30">
            <p className="text-red-400 font-medium mb-4">{error}</p>
            <button onClick={onClose} className="px-6 py-2 bg-red-600 rounded-xl text-sm font-bold">Close</button>
          </div>
        ) : (
          <div className="relative w-full flex flex-col items-center">
             {/* Animated Orb */}
             <div className="relative w-48 h-48 md:w-64 md:h-64 mb-12">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                <div className="absolute inset-4 bg-gradient-to-tr from-teal-400 via-emerald-300 to-white/30 rounded-full shadow-[0_0_50px_rgba(45,212,191,0.5)] flex items-center justify-center overflow-hidden border border-white/20">
                   <Sparkles className="w-12 h-12 text-white/50 animate-pulse" />
                   {/* Voice Rings */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-3/4 h-3/4 rounded-full border border-white/20 animate-ping opacity-20`}></div>
                      <div className={`w-1/2 h-1/2 rounded-full border border-white/20 animate-ping opacity-10 [animation-delay:0.5s]`}></div>
                   </div>
                </div>
             </div>

             {/* Live Transcription Display */}
             <div className="w-full max-w-lg space-y-6">
                <div className={`transition-all duration-500 ${aiText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                         <Bot className="w-4 h-4" />
                      </div>
                      <p className="text-teal-50 text-lg font-medium leading-relaxed italic">
                        "{aiText || "How can I help you today?"}"
                      </p>
                   </div>
                </div>

                <div className={`transition-all duration-500 ${userText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} text-right`}>
                   <div className="flex flex-row-reverse gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                         <User className="w-4 h-4" />
                      </div>
                      <p className="text-stone-400 text-sm font-medium">
                        {userText}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-8 pb-12 flex justify-center gap-6 relative z-10">
        <button 
          onClick={onClose}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg shadow-red-900/40 transition-all active:scale-90">
             <PhoneOff className="w-6 h-6" />
          </div>
          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">End Call</span>
        </button>

        <button 
          onClick={() => setIsListening(!isListening)}
          className="flex flex-col items-center gap-2 group"
        >
          <div className={`p-5 ${isListening ? 'bg-white text-black' : 'bg-stone-800 text-white'} rounded-full shadow-lg transition-all active:scale-90`}>
             {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </div>
          <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
            {isListening ? 'Mute' : 'Unmute'}
          </span>
        </button>
      </div>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};

export default VoiceAssistant;
