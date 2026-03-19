import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain } from 'lucide-react';
import { 
  ReactFlow, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useMemoryStore } from '../stores/memoryStore';
import { useAgentStore } from '../stores/agentStore';
import GlassPanel from '../components/ui/GlassPanel';
import { formatTimestamp } from '../lib/utils';
import PageTransition from '../components/layout/PageTransition';

// We map Memory layers to node styles
const LAYER_COLORS = {
  core: '#7C3AED',    // Purple
  project: '#06B6D4', // Cyan
  agent: '#F59E0B',   // Amber
  episodic: '#10B981',// Green
  semantic: '#F43F5E',// Rose
};

export default function MemoryGraphPage() {
  const navigate = useNavigate();
  const memories = useMemoryStore((s) => s.memories);
  const agents = useAgentStore((s) => s.agents);

  // Auto-generate graph nodes based on existing memory items
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    
    // 1. Create a central node representing the NEXUS Core
    nodes.push({
      id: 'nexus-core',
      position: { x: window.innerWidth / 2 - 100, y: 150 },
      data: { label: 'NEXUS Knowledge Base' },
      style: {
        background: '#12121A',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px',
        fontWeight: 'bold',
        fontSize: '14px',
        boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)'
      }
    });

    // 2. Map all memories to nodes scattered around the root
    memories.forEach((mem, index) => {
      // Create a spiral/circle layout algorithm
      const radius = 250 + (index * 20); // Spiral outward
      const angle = (index * Math.PI * 2) / 8; // 8 items per circle
      
      const px = (window.innerWidth / 2 - 100) + radius * Math.cos(angle);
      const py = 150 + radius * Math.sin(angle);

      const color = LAYER_COLORS[mem.layer] || '#fff';

      nodes.push({
        id: mem.id,
        position: { x: px, y: py },
        data: { 
          label: (
            <div className="flex flex-col gap-1 max-w-[200px]">
              <div className="text-[9px] uppercase tracking-widest opacity-70 flex justify-between">
                <span>{mem.layer}</span>
                <span>{mem.agentId?.replace('agent-', '') || 'User'}</span>
              </div>
              <div className="text-xs truncate">{mem.content}</div>
            </div>
          ),
          fullMemory: mem // Store the full memory data for the inspector panel
        },
        style: {
          background: 'rgba(10, 10, 10, 0.9)',
          color: '#fff',
          border: `1px solid ${color}60`,
          borderRadius: '8px',
          padding: '10px',
          boxShadow: `0 4px 12px ${color}15`
        }
      });
    });

    return nodes;
  }, [memories]);

  // Generate edges linking to the core or to specific agents
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    memories.forEach(mem => {
      edges.push({
        id: `edge-core-${mem.id}`,
        source: 'nexus-core',
        target: mem.id,
        animated: true,
        style: { stroke: LAYER_COLORS[mem.layer] || '#555', opacity: 0.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: LAYER_COLORS[mem.layer] || '#555',
        },
      });
    });
    return edges;
  }, [memories]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.id === 'nexus-core') {
      setSelectedNode(null);
      return;
    }
    setSelectedNode(node.data.fullMemory);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <PageTransition>
    <div className="h-full w-full flex flex-col relative overflow-hidden bg-void">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-glass-border bg-void-light/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 hover:bg-glass rounded text-text-muted hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-glass-border mx-1" />
          <Brain className="w-4 h-4 text-agent-coder" />
          <h1 className="text-sm font-medium tracking-wide">Interactive Memory Graph</h1>
          <span className="ml-2 text-[10px] font-mono text-text-muted px-2 py-0.5 rounded bg-glass border border-glass-border">
            {memories.length} Tensors Active
          </span>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          className="bg-void"
          minZoom={0.1}
          maxZoom={4}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(255,255,255,0.08)" gap={20} size={1} />
          <Controls 
            className="bg-glass border border-glass-border fill-white text-white rounded-lg overflow-hidden shadow-2xl" 
            showInteractive={false} 
          />
        </ReactFlow>

        {/* Memory Inspector Side Panel */}
        {selectedNode && (
          <GlassPanel className="absolute top-4 right-4 w-80 h-auto max-h-[80vh] flex flex-col shadow-2xl z-40 border border-glass-border">
            <div className="px-4 py-3 border-b border-glass-border flex items-center justify-between">
              <span className="text-xs font-mono text-text-muted uppercase tracking-widest">Memory Inspector</span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-text-muted hover:text-white"
              >
                 &times;
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4">
               <div>
                  <div className="text-[10px] text-text-muted uppercase mb-1">Layer Designation</div>
                  <div className="inline-flex px-2 py-1 rounded bg-glass border border-glass-border text-xs capitalize"
                    style={{ color: LAYER_COLORS[selectedNode.layer as keyof typeof LAYER_COLORS] }}
                  >
                    {selectedNode.layer} Memory
                  </div>
               </div>

               <div>
                  <div className="text-[10px] text-text-muted uppercase mb-1">Author Entity</div>
                  <div className="text-sm font-medium">
                    {selectedNode.agentId ? (
                      agents.find(a => a.id === selectedNode.agentId)?.name || selectedNode.agentId
                    ) : 'ROOT_USER'}
                  </div>
               </div>

               <div>
                  <div className="text-[10px] text-text-muted uppercase mb-1">Timestamp</div>
                  <div className="text-xs font-mono text-text-secondary">
                    {formatTimestamp(selectedNode.timestamp)}
                  </div>
               </div>

               <div>
                  <div className="text-[10px] text-text-muted uppercase mb-1">Tensor Payload</div>
                  <div className="p-3 bg-black/40 border border-glass-border rounded-lg text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
                    {selectedNode.content}
                  </div>
               </div>
               
               {/* Aesthetic embellishments */}
               <div className="pt-4 mt-4 border-t border-glass-border/50">
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                     <span>VECTOR ID:</span>
                     <span className="truncate max-w-[120px]">{selectedNode.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted mt-1">
                     <span>DIMENSIONS:</span>
                     <span>768 (nomic-embed)</span>
                  </div>
               </div>
            </div>
          </GlassPanel>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
