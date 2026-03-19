import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, UserPlus, Sparkles, Save
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import PageTransition from '../components/layout/PageTransition';

const ROLE_PRESETS = [
  { role: 'devops', name: 'DevOps', icon: '⚙️', color: '#8B5CF6', desc: 'CI/CD, Docker, cloud infrastructure' },
  { role: 'security', name: 'Security', icon: '🔒', color: '#EF4444', desc: 'Vulnerability scanning, pen testing, audits' },
  { role: 'data', name: 'Data Analyst', icon: '📊', color: '#3B82F6', desc: 'SQL, data viz, statistical analysis' },
  { role: 'writer', name: 'Tech Writer', icon: '📝', color: '#14B8A6', desc: 'Documentation, tutorials, API docs' },
  { role: 'pm', name: 'Product Manager', icon: '🎯', color: '#F97316', desc: 'Requirements, user stories, roadmaps' },
  { role: 'seo', name: 'SEO Specialist', icon: '🔎', color: '#84CC16', desc: 'Keyword research, content optimization' },
];

const PERSONALITY_PRESETS = [
  { label: 'Professional', tone: 15, detail: 50 },
  { label: 'Balanced', tone: 50, detail: 50 },
  { label: 'Casual', tone: 80, detail: 40 },
  { label: 'Verbose Expert', tone: 30, detail: 90 },
  { label: 'Quick & Terse', tone: 40, detail: 15 },
];

export default function AgentCreatorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [agentColor, setAgentColor] = useState('#7C3AED');
  const [agentDesc, setAgentDesc] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tone, setTone] = useState(50);
  const [detail, setDetail] = useState(50);
  const [tools, setTools] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const AVAILABLE_TOOLS = [
    'File Read/Write', 'Terminal Commands', 'Git Operations',
    'Web Search', 'Screen Capture', 'Code Analysis',
    'Document Generation', 'API Calls', 'Database Queries',
  ];

  const applyPreset = (preset: typeof ROLE_PRESETS[0]) => {
    setAgentName(preset.name);
    setAgentRole(preset.role);
    setAgentColor(preset.color);
    setAgentDesc(preset.desc);
    setSelectedPreset(preset.role);
    setSystemPrompt(`You are NEXUS ${preset.name}, specializing in ${preset.desc}. Be thorough, precise, and proactive. Format outputs clearly with markdown.`);
  };

  const COLORS = ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981', '#F43F5E', '#6366F1', '#8B5CF6', '#EF4444', '#3B82F6', '#14B8A6', '#F97316', '#84CC16'];

  const steps = ['Identity', 'Personality', 'Tools', 'Review'];

  return (
    <PageTransition>
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-glass transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <UserPlus className="w-5 h-5 text-agent-designer" />
          <h1 className="text-sm font-semibold">Agent Creator</h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-6 py-4 border-b border-glass-border">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono ${
              i < step ? 'bg-status-done text-white' : i === step ? 'bg-agent-designer text-white' : 'bg-glass text-text-muted'
            }`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i === step ? 'text-white' : 'text-text-muted'}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-glass-border" />}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Identity */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Agent Identity</h2>
                  <p className="text-sm text-text-secondary">Choose a preset or create a custom agent.</p>
                </div>

                {/* Presets */}
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-3">Quick Presets</div>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLE_PRESETS.map((preset) => (
                      <GlassPanel
                        key={preset.role}
                        hover
                        onClick={() => applyPreset(preset)}
                        className={`p-3 cursor-pointer text-center ${selectedPreset === preset.role ? '!border-white/30' : ''}`}
                        glowColor={selectedPreset === preset.role ? preset.color : undefined}
                      >
                        <div className="text-xl mb-1">{preset.icon}</div>
                        <div className="text-xs font-medium" style={{ color: preset.color }}>{preset.name}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">{preset.desc}</div>
                      </GlassPanel>
                    ))}
                  </div>
                </div>

                {/* Custom fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-text-muted uppercase tracking-widest font-mono block mb-1.5">Agent Name</label>
                    <input
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g., DevOps Engineer"
                      className="w-full bg-glass border border-glass-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-text-muted outline-none focus:border-agent-designer/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted uppercase tracking-widest font-mono block mb-1.5">Description</label>
                    <input
                      type="text"
                      value={agentDesc}
                      onChange={(e) => setAgentDesc(e.target.value)}
                      placeholder="What does this agent specialize in?"
                      className="w-full bg-glass border border-glass-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-text-muted outline-none focus:border-agent-designer/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted uppercase tracking-widest font-mono block mb-1.5">Accent Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setAgentColor(c)}
                          className={`w-8 h-8 rounded-full transition-transform ${agentColor === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Personality */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Personality & Behavior</h2>
                  <p className="text-sm text-text-secondary">Define how your agent communicates.</p>
                </div>

                {/* Personality presets */}
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-widest font-mono mb-3">Presets</div>
                  <div className="flex gap-2 flex-wrap">
                    {PERSONALITY_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => { setTone(p.tone); setDetail(p.detail); }}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          tone === p.tone && detail === p.detail
                            ? 'bg-agent-designer/20 text-agent-designer border border-agent-designer/30'
                            : 'bg-glass text-text-secondary hover:text-white border border-glass-border'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders */}
                <GlassPanel className="p-4 space-y-5">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-text-secondary">Professional</span>
                      <span className="font-mono" style={{ color: agentColor }}>{tone}%</span>
                      <span className="text-text-secondary">Casual</span>
                    </div>
                    <input type="range" min="0" max="100" value={tone} onChange={(e) => setTone(Number(e.target.value))}
                      className="w-full accent-agent-designer h-1.5 rounded-full appearance-none bg-glass cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-text-secondary">Concise</span>
                      <span className="font-mono" style={{ color: agentColor }}>{detail}%</span>
                      <span className="text-text-secondary">Verbose</span>
                    </div>
                    <input type="range" min="0" max="100" value={detail} onChange={(e) => setDetail(Number(e.target.value))}
                      className="w-full accent-agent-designer h-1.5 rounded-full appearance-none bg-glass cursor-pointer" />
                  </div>
                </GlassPanel>

                {/* System prompt */}
                <div>
                  <label className="text-[10px] text-text-muted uppercase tracking-widest font-mono block mb-1.5">System Prompt</label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Define the agent's personality and expertise..."
                    rows={5}
                    className="w-full bg-glass border border-glass-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-text-muted outline-none font-mono leading-relaxed resize-none focus:border-agent-designer/50"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Tools */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Tools & Capabilities</h2>
                  <p className="text-sm text-text-secondary">Select what this agent can do.</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_TOOLS.map((tool) => {
                    const isSelected = tools.includes(tool);
                    return (
                      <GlassPanel
                        key={tool}
                        hover
                        onClick={() => setTools(isSelected ? tools.filter((t) => t !== tool) : [...tools, tool])}
                        className={`p-3 cursor-pointer text-center ${isSelected ? '!border-agent-designer/50' : ''}`}
                        glowColor={isSelected ? agentColor : undefined}
                      >
                        <div className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
                          {tool}
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] mt-1 font-mono"
                            style={{ color: agentColor }}
                          >
                            ✓ Enabled
                          </motion.div>
                        )}
                      </GlassPanel>
                    );
                  })}
                </div>

                <div className="text-xs text-text-muted">
                  {tools.length} tool(s) selected. Tools require the Tauri backend to execute.
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Review Your Agent</h2>
                  <p className="text-sm text-text-secondary">Everything look good?</p>
                </div>

                <GlassPanel className="p-6" glowColor={agentColor}>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                      style={{ background: `${agentColor}15`, border: `2px solid ${agentColor}40` }}
                    >
                      {agentName.slice(0, 2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <div className="text-xl font-semibold" style={{ color: agentColor }}>
                        {agentName || 'Unnamed Agent'}
                      </div>
                      <div className="text-xs text-text-muted font-mono">{agentRole || 'custom'}</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex gap-2">
                      <span className="text-text-muted w-24 shrink-0">Description:</span>
                      <span className="text-text-secondary">{agentDesc || 'No description'}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-muted w-24 shrink-0">Tone:</span>
                      <span className="text-text-secondary">{tone}% ({tone < 30 ? 'Professional' : tone > 70 ? 'Casual' : 'Balanced'})</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-muted w-24 shrink-0">Detail:</span>
                      <span className="text-text-secondary">{detail}% ({detail < 30 ? 'Concise' : detail > 70 ? 'Verbose' : 'Balanced'})</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-muted w-24 shrink-0">Tools:</span>
                      <span className="text-text-secondary">{tools.length > 0 ? tools.join(', ') : 'None'}</span>
                    </div>
                  </div>

                  {systemPrompt && (
                    <div className="mt-4 p-3 bg-void rounded-lg">
                      <div className="text-[10px] text-text-muted font-mono uppercase mb-1">System Prompt</div>
                      <div className="text-xs text-text-secondary font-mono leading-relaxed">{systemPrompt}</div>
                    </div>
                  )}
                </GlassPanel>

                <div className="text-xs text-text-muted text-center">
                  Custom agents will be saved locally and appear alongside the default 6 agents.
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="px-6 py-4 border-t border-glass-border flex items-center justify-between">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 0 ? 'Back' : 'Cancel'}
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && !agentName.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-agent-designer to-agent-manager text-white text-sm font-medium disabled:opacity-30 hover:brightness-110 transition-all"
          >
            Continue
            <Sparkles className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => { /* Save agent logic */ navigate('/'); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-status-done to-agent-coder text-white text-sm font-medium hover:brightness-110 transition-all"
          >
            <Save className="w-4 h-4" />
            Create Agent
          </button>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
