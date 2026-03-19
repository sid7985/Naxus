import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Mic, Settings, Volume2, 
  MoreHorizontal, Radio, Activity, StopCircle
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { useAgentStore } from '../stores/agentStore';
import { DEFAULT_AGENTS } from '../lib/constants';
import { sttService } from '../services/audio/stt';
import { ttsService } from '../services/audio/tts';
import { ollama } from '../services/ollama';
import PageTransition from '../components/layout/PageTransition';

interface TranscriptItem {
  id: string;
  role: 'user' | 'agent';
  agentId?: string;
  text: string;
  timestamp: number;
}

export default function VoiceControlPage() {
  const navigate = useNavigate();
  const { agents } = useAgentStore();
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeAgentId = 'nexus-1';
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 'mock-1',
      role: 'agent',
      agentId: 'nexus-1',
      text: "Voice interface initialized. Wake word is 'Hey NEXUS'. I am ready.",
      timestamp: Date.now() - 60000,
    }
  ]);

  const activeAgent = agents.find(a => a.id === activeAgentId) || DEFAULT_AGENTS[0];
  
  // Real or Simulated visualizer heights
  const [bars, setBars] = useState<number[]>(Array(30).fill(10));
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setBars(prev => prev.map(() => 
          isSpeaking 
            ? Math.random() * 80 + 20 
            : Math.random() * 40 + 5
        ));
      }, 50);
    } else {
      setBars(Array(30).fill(5));
    }
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  useEffect(() => {
    // Web Speech API Event Listeners
    const handleStart = () => setIsListening(true);
    const handleEnd = () => setIsListening(false);
    
    const handleResult = async (text: string, isFinal: boolean) => {
      if (!isFinal) return; // Ignore partial matches for now

      // 1. User spoke
      setTranscripts(prev => [...prev, {
        id: `usr-${Date.now()}`,
        role: 'user',
        text,
        timestamp: Date.now()
      }]);

      // 2. Stop listening while agent thinks/speaks
      sttService.stop();
      setIsSpeaking(true);

      try {
        // 3. Simple, fast Ollama query bypassing the heavy orchestrator
        const systemPrompt = "You are a specialized AI agent taking voice commands. Keep your responses VERY brief and conversational (1-2 sentences max). Do not use markdown, code blocks, or special formatting. Just raw spoken English text.";
        let responseText = "";
        
        const stream = ollama.chat(
          activeAgent.model || 'llama3.2',
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ]
        );
        
        for await (const chunk of stream) {
          if (typeof chunk === 'string') {
            responseText += chunk;
          }
        }

        // 4. Log agent transcript
        setTranscripts(prev => [...prev, {
          id: `agt-${Date.now()}`,
          role: 'agent',
          agentId: activeAgentId,
          text: responseText,
          timestamp: Date.now()
        }]);

        // 5. Speak the response aloud (TTS)
        ttsService.speak(responseText, {
          onEnd: () => {
             setIsSpeaking(false);
             // Auto-resume listening if they were previously in full-auto mode
             // For now, require manual re-triggering of the mic
          }
        });

      } catch (err) {
         console.error(err);
         setIsSpeaking(false);
      }
    };

    sttService.on('start', handleStart);
    sttService.on('end', handleEnd);
    sttService.on('result', handleResult as any);

    return () => {
      sttService.off('start', handleStart);
      sttService.off('end', handleEnd);
      sttService.off('result', handleResult as any);
      sttService.stop();
      ttsService.stop();
    };
  }, [activeAgentId]);

  const toggleListen = () => {
    if (isListening) {
      sttService.stop();
    } else {
      // If the agent is speaking, stop them so we can talk
      if (isSpeaking) {
        ttsService.stop();
        setIsSpeaking(false);
      }
      sttService.start();
    }
  };

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-glass transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div className="relative">
             <Mic className="w-5 h-5 text-indigo-400" />
             {(isListening || isSpeaking) && (
               <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             )}
          </div>
          <div>
            <h1 className="text-sm font-semibold">Voice Control</h1>
            <p className="text-[10px] text-text-muted mt-0.5">Continuous Conversation Mode</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="p-2 rounded-lg bg-glass text-text-secondary hover:text-white transition-colors" title="Audio Settings">
             <Settings className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Visualizer and Controls */}
        <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-glass-border bg-void relative">
           
           {/* Ambient background glow matching the active agent */}
           <div 
             className="absolute inset-0 opacity-10 transition-colors duration-1000"
             style={{ 
               background: `radial-gradient(circle at 50% 50%, ${activeAgent.color} 0%, transparent 60%)` 
             }} 
           />

           {/* Voice Visualizer */}
           <div className="h-32 flex items-center justify-center gap-1.5 mb-16 z-10 w-full max-w-sm">
             {bars.map((h, i) => (
               <motion.div 
                 key={i}
                 className="w-2 rounded-full transition-all duration-75"
                 style={{ 
                   height: `${h}%`,
                   backgroundColor: isSpeaking ? activeAgent.color : (isListening ? 'var(--color-agent-researcher)' : 'var(--color-glass-border)')
                 }}
               />
             ))}
           </div>

           {/* Status Indicator */}
           <div className="flex flex-col items-center z-10 mb-8 h-12">
             <AnimatePresence mode="popLayout">
               {isSpeaking ? (
                 <motion.div 
                   key="speaking"
                   className="flex items-center gap-2 text-sm font-medium"
                   style={{ color: activeAgent.color }}
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 >
                   <Volume2 className="w-4 h-4 mr-1 animate-pulse" />
                   {activeAgent.name} is speaking...
                 </motion.div>
               ) : isListening ? (
                 <motion.div 
                   key="listening"
                   className="flex items-center gap-2 text-sm font-medium text-blue-400"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 >
                   <Radio className="w-4 h-4 mr-1 animate-pulse" />
                   Listening 
                   <span className="flex gap-0.5 ml-1">
                     <span className="animate-bounce delay-75">.</span>
                     <span className="animate-bounce delay-150">.</span>
                     <span className="animate-bounce delay-300">.</span>
                   </span>
                 </motion.div>
               ) : (
                 <motion.div 
                   key="idle"
                   className="flex items-center gap-2 text-sm text-text-muted"
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                 >
                   <Activity className="w-4 h-4 mr-1" />
                   Standby Matrix Offline
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {/* Central Control Button */}
           <div className="z-10">
              <button 
                onClick={toggleListen}
                className={`
                  w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
                  ${isListening 
                    ? 'bg-red-500/20 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:bg-red-500/30 border-2 border-red-500/50' 
                    : 'bg-glass border border-glass-border text-white hover:bg-white/10 hover:scale-105'
                  }
                `}
              >
                {isListening ? <StopCircle className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
           </div>
           
           {/* Info Banner */}
           {(!sttService.isSupported || !ttsService.isSupported) && (
              <div className="absolute top-5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 max-w-[80%] text-center">
                 <Radio className="w-3.5 h-3.5" />
                 Web Speech API is unsupported in your environment.
              </div>
           )}
        </div>

        {/* Right Side: Live Transcription Log */}
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col bg-void">
           <div className="p-4 border-b border-glass-border flex justify-between items-center bg-void/50">
             <h3 className="text-xs font-medium uppercase tracking-widest text-text-muted">Live Transcript</h3>
             <button className="p-1 rounded hover:bg-glass text-text-muted hover:text-white transition-colors">
               <MoreHorizontal className="w-4 h-4" />
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-5 space-y-6">
             <AnimatePresence>
               {transcripts.map((t) => (
                 <motion.div 
                   key={t.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex flex-col max-w-[85%] ${t.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                 >
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-mono text-text-muted opacity-60">
                       {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                     </span>
                     <span className="text-[10px] uppercase font-bold tracking-wider" style={{
                       color: t.role === 'user' ? '#94a3b8' : (agents.find(a => a.id === t.agentId)?.color || '#fff')
                     }}>
                       {t.role === 'user' ? 'You' : (agents.find(a => a.id === t.agentId)?.name || 'NEXUS')}
                     </span>
                   </div>
                   
                   <GlassPanel className={`p-3.5 ${
                     t.role === 'user' 
                       ? 'bg-glass border-glass-border/30 rounded-tr-sm text-sm' 
                       : 'bg-void-light border-glass-border/30 rounded-tl-sm text-sm'
                     }`}
                   >
                     {t.text}
                   </GlassPanel>
                 </motion.div>
               ))}
               
               {(isListening || isSpeaking) && (
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   className={`flex flex-col mt-4 ${isSpeaking ? 'items-start mr-auto' : 'items-end ml-auto'}`}
                 >
                    <div className="px-4 py-2 bg-glass rounded-full text-text-muted italic text-xs animate-pulse">
                      {isSpeaking ? 'Synthesizing voice...' : 'Listening...'}
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>

      </div>
    </div>
    </PageTransition>
  );
}
