import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, File, Folder, FolderOpen,
  Send, ChevronRight, ChevronDown, X
} from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { useSettingsStore } from '../stores/settingsStore';
import { ollama } from '../services/ollama';

// Simple demo file tree
const DEMO_FILES = [
  { name: 'app', type: 'folder', children: [
    { name: 'src', type: 'folder', children: [
      { name: 'main', type: 'folder', children: [
        { name: 'ui', type: 'folder', children: [
          { name: 'LoginScreen.kt', type: 'file' },
          { name: 'Theme.kt', type: 'file' },
        ]},
      ]},
    ]},
  ]},
];

const DEMO_FILE_CONTENT = `package com.nexus.chargelink.ui

import androidx.compose.runtime.Composable
import androidx.compose.material3.*

// Component for the main login screen entry point
@Composable
fun LoginScreen() {
    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            "Welcome to ChargeLink",
            style = MaterialTheme.typography.headlineLarge
        )
        Spacer(modifier = Modifier.height(32.dp))
        // AI-Suggestion: Add username field here
    }
}`;

interface FileNode {
  name: string;
  type: string;
  children?: FileNode[];
}

function FileTree({ nodes, depth = 0 }: { nodes: FileNode[]; depth?: number }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ app: true, src: true, main: true, ui: true });

  return (
    <div>
      {nodes.map((node) => (
        <div key={node.name}>
          <button
            onClick={() => node.type === 'folder' && setExpanded((p) => ({ ...p, [node.name]: !p[node.name] }))}
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-left hover:bg-glass rounded text-xs transition-colors ${
              node.name === 'LoginScreen.kt' ? 'bg-agent-manager/10 text-white' : 'text-text-secondary'
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {node.type === 'folder' ? (
              <>
                {expanded[node.name] ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                {expanded[node.name] ? <FolderOpen className="w-3.5 h-3.5 text-agent-designer shrink-0" /> : <Folder className="w-3.5 h-3.5 text-agent-designer shrink-0" />}
              </>
            ) : (
              <>
                <span className="w-3" />
                <File className="w-3.5 h-3.5 text-agent-coder shrink-0" />
              </>
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {node.type === 'folder' && expanded[node.name] && node.children && (
            <FileTree nodes={node.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CodeEditorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('LoginScreen.kt');
  const [terminalOutput] = useState(
    `nexus@charge-link:~/project$ ./gradlew assembleDebug
> Task :app:compileDebugKotlin
> Task :app:processDebugResources
BUILD SUCCESSFUL in 12s
nexus@charge-link:~/project$ `
  );
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'user' as const,
      content: 'How can I optimize the LoginScreen.kt layout for accessibility?',
    },
    {
      role: 'assistant' as const,
      content: `For better accessibility in Jetpack Compose, I recommend:

• Add **contentDescription** to image elements.
• Use **Modifier.semantics** for custom components.
• Ensure touch targets are at least **48.dp**.`,
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const workspace = useSettingsStore((s) => s.workspace);

  const handleChatSend = async () => {
    if (!chatInput.trim() || isStreaming) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsStreaming(true);

    try {
      let response = '';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: '▋' }]);

      for await (const token of ollama.chat(
        workspace.modelAssignments.coder,
        [...chatMessages, { role: 'user', content: userMsg }],
        'You are NEXUS Coder, a Senior Engineer specializing in Kotlin, Jetpack Compose, and mobile development. Give concise, actionable code advice. Use markdown formatting.'
      )) {
        response += token;
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: response };
          return updated;
        });
      }
    } catch (error) {
      setChatMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `⚠️ ${error instanceof Error ? error.message : 'Connection error'}`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-glass-border bg-void-light/50">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-glass rounded transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <span className="text-xs font-mono text-text-muted">EXPLORER: CHARGELINK</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File explorer sidebar */}
        <div className="w-52 border-r border-glass-border py-2 overflow-y-auto shrink-0">
          <FileTree nodes={DEMO_FILES} />
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* File tabs */}
          <div className="flex items-center border-b border-glass-border bg-void-light/30">
            <div className="flex items-center gap-px">
              {['LoginScreen.kt', 'Theme.kt'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs flex items-center gap-2 border-r border-glass-border transition-colors ${
                    activeTab === tab ? 'bg-void text-white' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-agent-coder" />
                  {tab}
                  <X className="w-3 h-3 opacity-50 hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>

          {/* Code display */}
          <div className="flex-1 overflow-auto p-0 bg-void">
            <div className="font-mono text-sm leading-7">
              {DEMO_FILE_CONTENT.split('\n').map((line, i) => (
                <div key={i} className="flex hover:bg-glass/50">
                  <span className="w-12 text-right pr-4 text-text-muted/50 select-none shrink-0 text-xs leading-7">
                    {i + 1}
                  </span>
                  <pre className="flex-1">
                    <code className="text-text-secondary">
                      {/* Simple syntax highlighting */}
                      {line.includes('package') || line.includes('import') ? (
                        <span className="text-agent-tester">{line}</span>
                      ) : line.includes('//') ? (
                        <span className="text-agent-marketer/70">{line}</span>
                      ) : line.includes('fun ') || line.includes('@Composable') ? (
                        <span>
                          <span className="text-agent-coder">{line.split('(')[0]}</span>
                          {line.includes('(') ? `(${line.split('(').slice(1).join('(')}` : ''}
                        </span>
                      ) : line.includes('"') ? (
                        <span>
                          {line.split('"').map((part, j) =>
                            j % 2 === 1 ? (
                              <span key={j} className="text-agent-marketer">"{part}"</span>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                        </span>
                      ) : (
                        <span>{line}</span>
                      )}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal */}
          <div className="h-40 border-t border-glass-border flex flex-col">
            <div className="flex items-center gap-4 px-3 py-1 border-b border-glass-border">
              {['TERMINAL', 'BUILD', 'LOGCAT'].map((tab) => (
                <button
                  key={tab}
                  className={`text-[10px] font-mono tracking-wider py-1 ${
                    tab === 'TERMINAL' ? 'text-white border-b border-white' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-3">
              <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap">
                {terminalOutput.split('\n').map((line, i) => (
                  <div key={i}>
                    {line.includes('nexus@') ? (
                      <span>
                        <span className="text-agent-marketer">{line.split('$')[0]}$</span>
                        <span className="text-white">{line.split('$').slice(1).join('$')}</span>
                      </span>
                    ) : line.includes('BUILD SUCCESSFUL') ? (
                      <span className="text-agent-marketer font-bold">{line}</span>
                    ) : (
                      <span className="text-text-muted">{line}</span>
                    )}
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-3 py-1 border-t border-glass-border bg-void-light/30 text-[10px] font-mono text-text-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-status-done" /> 0 Errors
              </span>
              <span>⚠ 2 Warnings</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Line 12, Col 48</span>
              <span>Spaces: 4</span>
              <span>UTF-8</span>
              <span className="text-agent-coder">Kotlin</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="w-72 border-l border-glass-border flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-agent-coder animate-pulse" />
              <span className="text-xs font-medium">NEXUS AI ASSISTANT</span>
            </div>
            <button className="text-text-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'text-right' : ''}>
                <GlassPanel
                  className={`px-3 py-2.5 ${
                    msg.role === 'user' ? '!bg-agent-manager/10 !border-agent-manager/20' : ''
                  }`}
                >
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  {msg.role === 'assistant' && i === chatMessages.length - 1 && !isStreaming && (
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 text-[10px] rounded-lg bg-agent-coder/20 text-agent-coder hover:bg-agent-coder/30 transition-colors">
                        Apply Fixes
                      </button>
                      <button className="px-3 py-1.5 text-[10px] rounded-lg bg-glass hover:bg-glass-hover text-text-secondary transition-colors">
                        Explain More
                      </button>
                    </div>
                  )}
                </GlassPanel>
                <div className="text-[10px] text-text-muted mt-1 font-mono">
                  {msg.role === 'user' ? '' : 'Nexus AI'} • 14:02 PM
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-glass-border">
            <GlassPanel className="flex items-center gap-2 px-3 py-1">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask Nexus anything..."
                className="flex-1 bg-transparent py-2 text-xs text-white placeholder:text-text-muted outline-none"
              />
              <button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || isStreaming}
                className="text-agent-coder disabled:opacity-30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
