import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

import { orchestrator } from './services/orchestrator';

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nexus-daemon',
    version: '1.0.0',
    capabilities: ['ollama', 'docker-sandbox', 'mcp-tools', 'workflow-deployer']
  });
});

// Main AI Agent Execution Endpoint
app.post('/api/agent/task', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
  
  try {
    const result = await orchestrator.handleTask(prompt);
    res.json(result);
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[NEXUS-DAEMON] Server initialized on port ${PORT}`);
});
