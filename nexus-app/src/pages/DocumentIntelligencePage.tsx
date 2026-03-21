import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Brain, Network, ChevronRight, ChevronDown, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import GlassPanel from '../components/ui/GlassPanel';
import NeonIcon from '../components/ui/NeonIcon';
import { pageIndexService, PageIndexTree } from '../services/pageindex';
import SpatialSidebar from '../components/layout/SpatialSidebar';

const DocumentIntelligencePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [treeData, setTreeData] = useState<PageIndexTree | null>(null);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcessDocument = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgressStatus('Uploading to NEXUS PageIndex Engine...');
    
    try {
      setProgressStatus('Generating reasoning tree (this may take a while)...');
      const result = await pageIndexService.indexDocument(file);
      setTreeData(result.tree);
      setProgressStatus('Processing complete!');
    } catch (error) {
      console.error(error);
      setProgressStatus('Error processing document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuery = async () => {
    if (!query || !treeData) return;
    
    setIsQuerying(true);
    setQueryResult(null);
    
    try {
      const result = await pageIndexService.queryTree(query, treeData);
      setQueryResult(result.answer);
    } catch (error) {
      console.error(error);
      setQueryResult('Error executing query. Ensure backend is running.');
    } finally {
      setIsQuerying(false);
    }
  };

  const renderTreeNode = (node: PageIndexTree, idx: string) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = node.nodes && node.nodes.length > 0;

    return (
      <div key={idx} className="ml-4 mt-2">
        <div 
          className="flex items-start gap-2 cursor-pointer group"
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4 text-primary-400 mt-1" /> : <ChevronRight className="w-4 h-4 text-primary-400 mt-1" />
          ) : (
            <div className="w-4 h-4" /> // Spacing
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary-300 bg-primary-900/40 px-1.5 py-0.5 rounded">
                p{node.start_index}-{node.end_index}
              </span>
              <span className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                {node.title}
              </span>
            </div>
            {node.summary && (
              <p className="text-sm text-gray-400 mt-1 pl-1 border-l-2 border-primary-500/20 ml-1">
                {node.summary}
              </p>
            )}
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-2 border-l border-white/10 pl-2">
            {node.nodes!.map((child, childIdx) => renderTreeNode(child, `${idx}-${childIdx}`))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white selection:bg-primary-500/30">
      
      {/* LEFT PANEL */}
      <SpatialSidebar position="left" width="320" className="border-r border-white/10">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <NeonIcon icon={Brain} color="purple" size="lg" />
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-white mb-1">
                Document Intelligence
              </h1>
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded">
                Vectorless RAG
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mb-6 font-mono leading-relaxed">
            Powered by PageIndex. Replaces traditional vector databases with hierarchical LLM reasoning trees for human-like document comprehension.
          </p>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <GlassPanel className="p-4 border border-white/5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary-400" />
                Index New Document
              </h3>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all rounded-lg cursor-pointer mb-4">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-300">
                    <span className="font-semibold">Click to upload</span> PDF
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                />
              </label>

              {file && (
                <div className="flex items-center justify-between bg-black/50 p-3 rounded-md border border-white/5 mb-4">
                  <span className="text-sm truncate text-white max-w-[180px]">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}

              <button
                onClick={handleProcessDocument}
                disabled={!file || isProcessing}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white font-medium py-2.5 rounded transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Network className="w-4 h-4" />
                    Generate Reasoning Tree
                  </>
                )}
              </button>

              {progressStatus && (
                <div className="mt-4 flex items-start gap-2 text-xs font-mono text-gray-400 bg-black/40 p-3 rounded border border-white/5">
                  <Activity className="w-3.5 h-3.5 mt-0.5 text-primary-400" />
                  <span>{progressStatus}</span>
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      </SpatialSidebar>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-black to-slate-950">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {treeData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Query Interface */}
              <GlassPanel className="p-6 border border-primary-500/20 shadow-[0_0_30px_rgba(var(--color-primary-500),0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <NeonIcon icon={Brain} color="primary" size="lg" className="opacity-20" />
                </div>
                
                <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Index Active: {file?.name}
                </h2>
                <p className="text-gray-400 text-sm mb-6">Ask complex, multi-hop questions. The engine will reason through the document structure.</p>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                    placeholder="e.g., What are the main risk factors mentioned in section 3?"
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono text-sm"
                  />
                  <button
                    onClick={handleQuery}
                    disabled={isQuerying || !query}
                    className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 px-6 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {isQuerying ? <Activity className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    Cognitive Search
                  </button>
                </div>

                {queryResult && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 pt-6 border-t border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 border border-primary-500/50 mt-1">
                        <Brain className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-gray-200 leading-relaxed font-mono whitespace-pre-wrap">{queryResult}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </GlassPanel>

              {/* Tree Visualization */}
              <GlassPanel className="p-6 border border-white/5">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Semantic Document Tree
                </h3>
                
                {treeData.error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500/50 mb-4" />
                    <p className="text-red-400 font-mono text-sm">{treeData.error}</p>
                    <p className="text-gray-500 mt-2 text-xs">Ensure your API keys are configured correctly or the Ollama instance is running.</p>
                  </div>
                ) : treeData.message ? (
                  <div className="bg-black/40 border border-white/5 rounded-lg p-6">
                    <p className="text-gray-400 font-mono text-sm mb-4">{treeData.message}</p>
                    <div className="mockup-tree opacity-50 pointer-events-none grayscale">
                      {/* Fake tree for visual feedback while using mock backend */}
                      {renderTreeNode({
                        title: "Document Root", start_index: 1, end_index: 10, summary: "Root document node generated by simulation.", node_id: "1", nodes: [
                          { title: "Introduction", start_index: 1, end_index: 2, summary: "Overview of the document contents.", node_id: "2" },
                          { title: "Analysis", start_index: 3, end_index: 8, summary: "Detailed breakdown and reasoning.", node_id: "3", nodes: [
                            { title: "Methodology", start_index: 3, end_index: 5, summary: "The approach taken.", node_id: "4" }
                          ]}
                        ]
                      }, "mock-root")}
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    {renderTreeNode(treeData, 'root')}
                  </div>
                )}
              </GlassPanel>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-32">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 border-2 border-primary-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 border-2 border-primary-500/40 rounded-full flex items-center justify-center bg-black">
                  <Network className="w-8 h-8 text-primary-400" />
                </div>
              </div>
              <h2 className="text-xl font-display font-semibold text-white mb-2">No Document Indexed</h2>
              <p className="text-gray-400 max-w-md font-mono text-sm">Upload a PDF document to generate an LLM-reasoning tree structure. This process takes a few minutes for large documents.</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default DocumentIntelligencePage;
