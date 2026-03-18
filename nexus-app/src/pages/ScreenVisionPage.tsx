import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Eye, Camera, MousePointer2, Crosshair,
  Layers, ZoomIn, Info
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';

export default function ScreenVisionPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'capture' | 'analyze' | 'annotate'>('capture');

  const captureActions = [
    { id: 'full', label: 'Full Screen', icon: Camera, desc: 'Capture the entire screen', color: '#7C3AED' },
    { id: 'region', label: 'Region Select', icon: Crosshair, desc: 'Select area to capture', color: '#06B6D4' },
    { id: 'window', label: 'Window', icon: Layers, desc: 'Capture a specific window', color: '#F59E0B' },
    { id: 'element', label: 'Element Detect', icon: MousePointer2, desc: 'AI detects UI elements', color: '#10B981' },
  ];

  const analysisCapabilities = [
    { name: 'Element Detection', desc: 'Identify buttons, inputs, text, images using vision model', status: 'ready' as const },
    { name: 'Text Extraction (OCR)', desc: 'Extract text from screenshots using Tesseract', status: 'ready' as const },
    { name: 'Layout Analysis', desc: 'Understand page structure and hierarchy', status: 'ready' as const },
    { name: 'Accessibility Audit', desc: 'Check contrast, labels, tab order from screenshot', status: 'beta' as const },
    { name: 'Design Comparison', desc: 'Compare mockup vs implementation pixel diff', status: 'coming' as const },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-glass transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <Eye className="w-5 h-5 text-agent-designer" />
          <h1 className="text-sm font-semibold">Screen Vision</h1>
          <span className="ml-2 px-2 py-0.5 bg-agent-designer/10 text-agent-designer text-[10px] font-mono rounded-full">
            VISION AI
          </span>
        </div>
        <div className="flex items-center gap-1 bg-glass rounded-lg p-1">
          {(['capture', 'analyze', 'annotate'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors capitalize ${
                mode === m ? 'bg-agent-designer/20 text-agent-designer' : 'text-text-muted hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {mode === 'capture' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-3">Capture Mode</div>
            <div className="grid grid-cols-2 gap-3">
              {captureActions.map((action) => {
                const Icon = action.icon;
                return (
                  <GlassPanel key={action.id} hover className="p-5 cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: action.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: action.color }}>{action.label}</div>
                        <div className="text-xs text-text-muted">{action.desc}</div>
                      </div>
                    </div>
                  </GlassPanel>
                );
              })}
            </div>

            {/* Preview area */}
            <GlassPanel className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
                <p className="text-sm text-text-muted">Capture a screenshot to begin analysis</p>
                <p className="text-xs text-text-muted/50 mt-1">Requires Tauri backend + vision model</p>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {mode === 'analyze' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-3">Analysis Capabilities</div>
            {analysisCapabilities.map((cap) => (
              <GlassPanel key={cap.name} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-agent-designer/10 flex items-center justify-center shrink-0">
                  <ZoomIn className="w-5 h-5 text-agent-designer" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{cap.name}</div>
                  <div className="text-xs text-text-muted">{cap.desc}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  cap.status === 'ready' ? 'bg-status-done/10 text-status-done' :
                  cap.status === 'beta' ? 'bg-status-thinking/10 text-status-thinking' :
                  'bg-glass text-text-muted'
                }`}>
                  {cap.status}
                </span>
              </GlassPanel>
            ))}

            <GlassPanel className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-agent-designer shrink-0 mt-0.5" />
                <div className="text-xs text-text-secondary leading-relaxed">
                  Screen Vision uses a local vision model (e.g., <code className="text-agent-coder">llava</code>) to understand screenshots.
                  This enables the Designer agent to provide UI feedback, the Tester to find visual bugs,
                  and Zero Claw to control desktop applications.
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {mode === 'annotate' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-80">
            <Layers className="w-10 h-10 text-text-muted/20 mb-4" />
            <p className="text-sm text-text-muted">Annotation tools available after capturing a screenshot</p>
            <p className="text-xs text-text-muted/60 mt-1">Draw boxes, add labels, highlight elements</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
