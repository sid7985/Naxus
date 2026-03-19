import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassPanel from '../components/ui/GlassPanel';
import PageTransition from '../components/layout/PageTransition';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function QuickTodoPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('nexus-todos');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', text: 'Deploy NEXUS AI OS Core', completed: true, createdAt: Date.now() - 100000 },
      { id: '2', text: 'Initialize Multi-Agent Debate Protocol', completed: true, createdAt: Date.now() - 50000 },
      { id: '3', text: 'Execute Final QA To-Do E2E Test', completed: false, createdAt: Date.now() },
    ];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('nexus-todos', JSON.stringify(todos));
  }, [todos]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([{
      id: Math.random().toString(36).substring(7),
      text: input.trim(),
      completed: false,
      createdAt: Date.now()
    }, ...todos]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <PageTransition>
    <div className="h-full w-full flex flex-col bg-void overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border bg-void-light/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-glass rounded text-text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-glass-border mx-1" />
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h1 className="text-sm font-medium tracking-wide">Final E2E Test: To-Do App Engine</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center items-start">
        <div className="w-full max-w-xl">
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  NEXUS Directives
                </h2>
                <p className="text-xs text-text-muted font-mono mt-1">
                  SYS_STATUS: OPERATIONAL
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono text-white tracking-wider">
                  {completedCount}<span className="text-text-muted text-sm border-l border-glass-border ml-2 pl-2 md:inline">/ {todos.length}</span>
                </div>
                <div className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Tasks Yielded</div>
              </div>
            </div>

            <form onSubmit={handleAdd} className="flex gap-3 mb-6">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter new objective..."
                className="flex-1 bg-void/50 border border-glass-border rounded-lg px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="px-4 border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 disabled:opacity-50 disabled:hover:bg-cyan-500/10 transition-colors flex items-center justify-center font-medium"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-3">
              {todos.length === 0 ? (
                <div className="text-center py-10 text-text-muted text-sm border border-dashed border-glass-border rounded-lg bg-void/20">
                  No pending directives detected.
                </div>
              ) : (
                todos.map(todo => (
                  <div 
                    key={todo.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      todo.completed 
                        ? 'bg-void/40 border-glass-border opacity-60 hover:opacity-100' 
                        : 'bg-glass border-glass-border hover:border-cyan-500/30'
                    }`}
                  >
                    <button onClick={() => toggleTodo(todo.id)} className="shrink-0 text-cyan-400 hover:scale-110 transition-transform">
                      {todo.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 opacity-50" />}
                    </button>
                    
                    <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-text-muted' : 'text-text-secondary'}`}>
                      {todo.text}
                    </span>
                    
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 shrink-0 p-2 text-status-error/70 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                      style={{ opacity: 1 /* forced to 1 for touch screens */ }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
