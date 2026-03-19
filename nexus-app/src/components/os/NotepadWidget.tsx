import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Sparkles, X, Maximize2, Minimize2, Loader2, Trash2 } from 'lucide-react';
import GlassPanel from '../ui/GlassPanel';
import { ollama } from '../../services/ollama';

interface NotepadWidgetProps {
  onClose?: () => void;
}

export default function NotepadWidget({ onClose }: NotepadWidgetProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);

  const handleAIAction = async (promptType: 'summarize' | 'improve' | 'continue') => {
    if (!content.trim()) return;
    setIsGenerating(true);
    setShowAIOptions(false);

    let prompt = '';
    if (promptType === 'summarize') prompt = `Summarize the following text concisely. Output ONLY the summary:\n\n${content}`;
    if (promptType === 'improve') prompt = `Rewrite and improve the following text to be more professional and clear, preserving the original meaning. Output ONLY the rewritten text:\n\n${content}`;
    if (promptType === 'continue') prompt = `Continue writing the following text naturally. Output ONLY the continuation text:\n\n${content}`;

    try {
      const result = await ollama.generate('llama3.2:latest', prompt);
      
      // Append or replace
      if (promptType === 'summarize' || promptType === 'improve') {
        setContent(result.trim());
      } else {
        setContent(prev => prev.trim() + ' ' + result.trim());
      }
    } catch (e) {
      console.error('Ollama generation failed', e);
      setContent(prev => prev + '\n\n[Error: Could not reach Ollama Engine]');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: -500, right: 500, top: -200, bottom: 500 }}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`absolute z-50 flex flex-col ${isExpanded ? 'w-[700px] h-[550px]' : 'w-[450px] h-[400px]'}`}
      style={{ left: '15%', top: '25%' }}
    >
      <GlassPanel className="w-full h-full flex flex-col overflow-hidden border border-glass-border/50 shadow-2xl backdrop-blur-2xl bg-[#0a0a0a]/80 group">
        
        {/* Header (Drag Handle) */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-glass-border bg-white/5 cursor-move">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono tracking-widest text-text-secondary uppercase">OS Notepad</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-white/10 rounded transition-colors text-text-muted hover:text-white">
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors text-text-muted">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-3 py-2 border-b border-glass-border flex items-center justify-between bg-black/40">
          <div className="relative">
            <button 
              disabled={isGenerating || !content.trim()}
              onClick={() => setShowAIOptions(!showAIOptions)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isGenerating ? 'AI Generating...' : 'Nexus AI Actions'}
            </button>
            
            <AnimatePresence>
              {showAIOptions && (
                <motion.div 
                  initial={{ opacity: 0, y: -5, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-[#18181b] border border-glass-border rounded-lg shadow-2xl py-1 z-50 overflow-hidden"
                >
                  <button onClick={() => handleAIAction('improve')} className="w-full text-left px-4 py-2 text-[11px] font-mono text-text-secondary hover:text-white hover:bg-indigo-500/20 transition-colors">✨ Improve Style</button>
                  <button onClick={() => handleAIAction('summarize')} className="w-full text-left px-4 py-2 text-[11px] font-mono text-text-secondary hover:text-white hover:bg-indigo-500/20 transition-colors">📝 Summarize</button>
                  <div className="h-px w-full bg-glass-border my-1" />
                  <button onClick={() => handleAIAction('continue')} className="w-full text-left px-4 py-2 text-[11px] font-mono text-text-secondary hover:text-white hover:bg-indigo-500/20 transition-colors">✍️ Continue Writing</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button onClick={() => setContent('')} className="p-1.5 rounded hover:bg-white/5 text-text-muted hover:text-red-400 transition-colors" title="Clear Notes">
             <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-0 relative bg-black/20">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isGenerating}
            placeholder="Type your notes here, or paste text to have the Agentic AI brainstorm..."
            className="w-full h-full bg-transparent text-[13px] text-[#e0e0e0] p-5 outline-none resize-none font-mono leading-relaxed disabled:opacity-60"
            spellCheck={false}
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-[#0a0a0a]/40 backdrop-blur-[2px] pointer-events-none flex items-center justify-center">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }} 
                 transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                 className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.3)]"
               >
                 <Sparkles className="w-6 h-6 text-indigo-400" />
               </motion.div>
            </div>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  );
}
