import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MousePointer2, Shield, Eye, Camera, Command, AlertTriangle, MonitorPlay } from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import { clawService, SafetyTier } from '../services/clawService';

export default function ZeroClawPage() {
  const navigate = useNavigate();
  const [tier, setTier] = useState<SafetyTier>('locked');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  
  // Safe Zone State
  const [safeZone, setSafeZone] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({x: 0, y: 0});
  
  // Test Action State
  const [actionType, setActionType] = useState('click');
  const [actionX, setActionX] = useState('');
  const [actionY, setActionY] = useState('');
  const [actionText, setActionText] = useState('');

  // Update backend when tier changes
  useEffect(() => {
    clawService.setSafetyTier(tier).then(success => {
      if (success) {
        logAction(`System Safety Tier set to: ${tier.toUpperCase()}`);
      } else {
        logAction(`Failed to set safety tier: ${tier.toUpperCase()} - ensure sidecar is running`);
      }
    });
  }, [tier]);

  const logAction = (msg: string) => {
    setActionLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleCapture = async () => {
    setIsCapturing(true);
    logAction('Requesting screen capture...');
    const b64 = await clawService.getScreenshot();
    if (b64) {
      setScreenshot(b64);
      logAction('Capture successful.');
    } else {
      logAction('Capture failed.');
    }
    setIsCapturing(false);
  };

  const handleExecute = async () => {
    logAction(`Executing ${actionType}...`);
    const actionPayload: any = { type: actionType };
    
    if (actionType === 'click' || actionType === 'move') {
      actionPayload.x = parseInt(actionX) || undefined;
      actionPayload.y = parseInt(actionY) || undefined;
    } else if (actionType === 'type') {
      actionPayload.text = actionText;
    }

    const res = await clawService.executeAction(actionPayload);
    if (res.success) {
      logAction(`Success: ${actionType} executed`);
    } else {
      logAction(`Blocked/Error: ${res.error}`);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({x, y});
    setSafeZone({x, y, w: 0, h: 0});
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setSafeZone({
      x: Math.min(startPoint.x, currentX),
      y: Math.min(startPoint.y, currentY),
      w: Math.abs(currentX - startPoint.x),
      h: Math.abs(currentY - startPoint.y)
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (safeZone && safeZone.w > 20 && safeZone.h > 20) {
      logAction(`Safe zone defined: [x:${Math.round(safeZone.x)}, y:${Math.round(safeZone.y)}, w:${Math.round(safeZone.w)}, h:${Math.round(safeZone.h)}]`);
    } else {
      setSafeZone(null); // Too small
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1.5 rounded-lg hover:bg-glass transition-colors">
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <MousePointer2 className="w-5 h-5 text-indigo-400" />
          <h1 className="text-sm font-semibold">Zero Claw Controller</h1>
        </div>
        <div className="flex items-center gap-2">
          {tier === 'ghost' && <div className="text-xs text-green-400 flex items-center gap-1"><Shield className="w-3 h-3"/> Ghost Mode Active</div>}
          {tier === 'guided' && <div className="text-xs text-yellow-400 flex items-center gap-1"><Shield className="w-3 h-3"/> Guided Mode Active</div>}
          {tier === 'locked' && <div className="text-xs text-red-400 flex items-center gap-1"><Shield className="w-3 h-3"/> Locked Mode Active</div>}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 grid grid-cols-12 gap-5">
        
        {/* Left Col: Safety & Configuration */}
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <GlassPanel className="p-4">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-indigo-400" />
              Safety Tiers
            </h2>
            <div className="space-y-2">
              <button 
                onClick={() => setTier('ghost')}
                className={`w-full flex flex-col items-start text-left p-3 rounded-lg border text-sm transition-colors ${tier === 'ghost' ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-glass border-glass-border text-text-muted hover:border-glass-border-hover'}`}
              >
                <div className="font-medium mb-1">Ghost Mode (Layer 1)</div>
                <div className="text-xs opacity-80">Read-only. Agents can capture screen but cannot move mouse or type anywhere.</div>
              </button>
              <button 
                onClick={() => setTier('guided')}
                className={`w-full flex flex-col items-start text-left p-3 rounded-lg border text-sm transition-colors ${tier === 'guided' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : 'bg-glass border-glass-border text-text-muted hover:border-glass-border-hover'}`}
              >
                <div className="font-medium mb-1">Guided Mode (Layer 2)</div>
                <div className="text-xs opacity-80">Prompts for user approval before executing clicks or keystrokes. Best for testing.</div>
              </button>
              <button 
                onClick={() => setTier('locked')}
                className={`w-full flex flex-col items-start text-left p-3 rounded-lg border text-sm transition-colors ${tier === 'locked' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-glass border-glass-border text-text-muted hover:border-glass-border-hover'}`}
              >
                <div className="font-medium mb-1">Locked Mode (Layer 3)</div>
                <div className="text-xs opacity-80">Full autonomy enabled. Blacklisted apps (Settings, Terminal) are hard-blocked.</div>
              </button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-4">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-4">
              <Command className="w-4 h-4 text-indigo-400" />
              Test Action Node
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Action Type</label>
                <select 
                  value={actionType} 
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-glass border border-glass-border rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-400/50 outline-none"
                >
                  <option value="click">Mouse Click</option>
                  <option value="move">Move Mouse</option>
                  <option value="type">Type Text</option>
                </select>
              </div>

              {(actionType === 'click' || actionType === 'move') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-1">X Coord (px)</label>
                    <input type="number" value={actionX} onChange={e => setActionX(e.target.value)} className="w-full bg-glass border border-glass-border rounded-lg px-3 py-2 text-sm text-white outline-none" placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-1">Y Coord (px)</label>
                    <input type="number" value={actionY} onChange={e => setActionY(e.target.value)} className="w-full bg-glass border border-glass-border rounded-lg px-3 py-2 text-sm text-white outline-none" placeholder="e.g. 500" />
                  </div>
                </div>
              )}

              {actionType === 'type' && (
                <div>
                  <label className="text-xs text-text-muted block mb-1">Text String</label>
                  <input type="text" value={actionText} onChange={e => setActionText(e.target.value)} className="w-full bg-glass border border-glass-border rounded-lg px-3 py-2 text-sm text-white outline-none" placeholder="Hello World" />
                </div>
              )}

              <button 
                onClick={handleExecute}
                className="w-full py-2 mt-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Execute
              </button>
            </div>
          </GlassPanel>
        </div>

        {/* Right Col: Vision & Logs */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
          <GlassPanel className="p-4 flex-1 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-indigo-400" />
                Live Vision Feed
              </h2>
              <button 
                onClick={handleCapture}
                disabled={isCapturing}
                className="flex items-center gap-2 px-3 py-1.5 bg-glass border border-glass-border hover:bg-glass/80 text-xs rounded-lg transition-colors disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
                {isCapturing ? 'Capturing...' : 'Take Screenshot'}
              </button>
            </div>
            
            <div className="flex-1 bg-void rounded-lg border border-glass-border flex items-center justify-center overflow-hidden relative cursor-crosshair">
              {screenshot ? (
                <div className="relative inline-block">
                  <img 
                    src={screenshot} 
                    alt="Captured screen" 
                    className="max-w-full max-h-full object-contain pointer-events-auto select-none"
                    draggable={false}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                  />
                  {safeZone && (
                     <div 
                        className="absolute border-2 border-green-400 bg-green-400/10 pointer-events-none"
                        style={{
                          left: safeZone.x,
                          top: safeZone.y,
                          width: safeZone.w,
                          height: safeZone.h,
                        }}
                     >
                       <span className="absolute -top-6 left-0 bg-green-400 text-black text-[10px] px-1 font-bold whitespace-nowrap">
                         SAFE ZONE
                       </span>
                     </div>
                  )}
                  {/* Annotation Overlay (Phase 11/12) - Simulated agent attention Box */}
                  <div className="absolute border border-red-500 bg-red-500/10 pointer-events-none opacity-50 animate-pulse"
                       style={{ left: '25%', top: '30%', width: '15%', height: '10%' }}>
                       <span className="absolute -top-4 left-0 text-red-500 text-[9px] font-bold">AGENT TARGET</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-text-muted flex flex-col items-center">
                  <Eye className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-sm">No screenshot captured yet.</p>
                  <p className="text-xs mt-1 opacity-60">Click 'Take Screenshot' to grab the primary monitor.</p>
                </div>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-4 h-48 flex flex-col">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-indigo-400" />
              Action Log
            </h2>
            <div className="flex-1 overflow-y-auto bg-void/50 rounded-lg border border-glass-border p-3 space-y-1">
              {actionLog.length === 0 ? (
                <div className="text-xs text-text-muted italic">Waiting for connection...</div>
              ) : (
                actionLog.map((log, i) => (
                  <div key={i} className={`text-xs font-mono mb-1 ${log.includes('Failed') || log.includes('Error') ? 'text-red-400' : 'text-text-secondary'}`}>{log}</div>
                ))
              )}
            </div>
          </GlassPanel>
        </div>

      </div>
    </div>
  );
}
