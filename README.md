<div align="center">

# 🌌 NEXUS AI OS

### The Multi-Agent Desktop Operating System

*A VS Code-inspired AI workspace powered by a team of specialized agents — built with Tauri, React, and a Neo-Glass spatial design system.*

[![Built with Tauri](https://img.shields.io/badge/Built%20with-Tauri%202-FFC131?style=flat-square&logo=tauri)](https://tauri.app)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-A855F7?style=flat-square)](LICENSE)

</div>

---

## ✨ What is NEXUS?

NEXUS is a **desktop-native AI operating system** that manages a team of 6 specialized AI agents — each with distinct roles, personalities, and tool access. Think of it as a VS Code-like workspace where every panel is powered by AI.

**Key differentiators:**
- 🤖 **Multi-Agent Architecture** — Manager, Coder, Designer, Marketer, Researcher, Tester
- 🎯 **Mission-Based Execution** — Natural language → Manager plan → Agent delegation → Results
- 🛡️ **Debate Protocol** — Destructive actions require Tester agent approval before execution
- 🔌 **10 LLM Providers** — Ollama, OpenAI, Anthropic, Gemini, Groq, Mistral, DeepSeek, xAI, GLM, OpenRouter
- 🧩 **MCP Plugin System** — Extend agent capabilities via Model Context Protocol servers
- 🌌 **Neo-Glass Spatial UI** — Glassmorphism + neon accents + spatial floating elements on a void background

---

## 🖼️ Design System

NEXUS uses a custom **Neo-Glass Spatial** design system:

| Element | Description |
|---------|-------------|
| **Void Background** | Deep `#0A0A0F` base with nebula gradient overlay |
| **Glassmorphism** | `backdrop-blur(24px)` panels with subtle white borders |
| **Neon Accents** | Color-coded agent icons with gradient glow halos |
| **Spatial Layout** | Floating panels with margins (no edge-to-edge borders) |
| **Pill Tabs** | Glass pill containers with active state glow |
| **Animations** | Framer Motion stagger, spring physics, page transitions |

---

## 🧠 Agent Architecture

```
┌─────────────────────────────────────────────┐
│                  FOUNDER (You)              │
│              "Build me a landing page"      │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│              🟣 MANAGER AGENT               │
│  Breaks mission into tasks, delegates work  │
└──┬──────┬──────┬──────┬──────┬──────┬───────┘
   ▼      ▼      ▼      ▼      ▼      ▼
  💻     🎨     📈     🔬     🧪     🤖
 CODER DESIGNER MARKETER RESEARCHER TESTER CUSTOM
```

Each agent has:
- **Dedicated LLM model assignment** (mix local + cloud)
- **Tool access** — file ops, terminal, git, web search, scraping
- **Memory context** — episodic + semantic + RAG injection
- **Personality tuning** — tone and detail sliders
- **Metrics tracking** — tokens, tasks, execution time, errors

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Runtime** | Tauri 2 (Rust backend) |
| **Frontend** | React 19 + TypeScript 5.8 |
| **Styling** | Tailwind CSS 4 + custom design tokens |
| **State** | Zustand (persisted) |
| **Animations** | Framer Motion |
| **Code Editor** | Monaco Editor |
| **Graph Viz** | XY Flow + Dagre |
| **Build** | Vite 7 |
| **Icons** | Lucide React |

---

## 🗂️ Project Structure

```
nexus-app/src/
├── agents/              # Agent prompts & tool definitions
├── components/
│   ├── ide/             # AgentSidebar, FloatingAgentWindow, OfficeSimulator
│   ├── layout/          # ErrorBoundary, PageHeader, PageTransition, SpatialSidebar
│   ├── os/              # NotepadWidget
│   ├── rpg/             # AgentSprite
│   └── ui/              # GlassPanel, GlassInput, GlassModal, GlassDropdown,
│                        # TabPills, Breadcrumb, NeonIcon, StatusBadge,
│                        # CommandPalette, NotificationCenter, SkeletonLoader,
│                        # ModelSelector, ToastContainer, AsyncTrayIndicator
├── hooks/               # useKeyboardShortcuts
├── lib/                 # constants, types, utils
├── pages/               # 26 pages (see below)
├── services/
│   ├── audio/           # STT, TTS
│   ├── network/         # Proxy client
│   ├── connectors.ts    # Integration registry
│   ├── eventBus.ts      # Type-safe pub-sub (12 event types)
│   ├── llmProvider.ts   # Multi-provider LLM abstraction (10 providers)
│   ├── mcpClient.ts     # MCP plugin server connections
│   ├── memory.ts        # Local + semantic + RAG memory
│   ├── missionQueue.ts  # Background mission execution
│   ├── orchestrator.ts  # Agent delegation & tool execution engine
│   └── tauri.ts         # Rust command wrappers
├── stores/              # Zustand stores (agent, memory, settings, skills, rpg, missions)
└── styles/              # globals.css (design tokens), themes.css, rpg.css
```

---

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| **Launcher** | `/launcher` | Onboarding & workspace setup |
| **Launch Selection** | `/` | Home dashboard with quick actions |
| **Command Center** | `/command` | Mission input, agent roster, live feed |
| **Agent Profile** | `/agent/:id` | 1-on-1 chat, personality tuning, metrics |
| **Agent Creator** | `/agent/create` | Custom agent builder |
| **Code Editor** | `/editor` | Monaco editor with file tree & terminal |
| **Global Search** | `/search` | Find-in-files with regex & filters |
| **Git Panel** | `/git` | Staging, commit, history |
| **Settings** | `/settings` | Models, providers, API keys, themes |
| **Observability** | `/observability` | Agent metrics, token usage, performance |
| **Memory** | `/memory` | Memory entries browser |
| **Memory Graph** | `/memory-graph` | Visual knowledge graph (XY Flow) |
| **Workflows** | `/workflows` | Multi-agent automation templates |
| **Integrations** | `/integrations` | External service connectors |
| **Plugins** | `/plugins` | MCP server management |
| **Projects** | `/projects` | Workspace manager |
| **Tester Console** | `/tester` | Tri-agent UI verification suite |
| **Voice Control** | `/voice` | STT/TTS voice interface |
| **Screen Vision** | `/vision` | Vision model screen analysis |
| **Internet Control** | `/internet` | Proxy rules & domain whitelist |
| **Background Auto** | `/computer` | Watcher daemons & skill triggers |
| **Quick Todo** | `/todo` | Lightweight task list |
| **Zero Claw** | `/zeroclaw` | Advanced agent debugging |
| **RPG World** | `/rpg` | Gamified agent visualization |
| **Mission Builder** | `/mission/new` | Guided mission creation |
| **Keyboard Shortcuts** | `/shortcuts` | Shortcut viewer & editor |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Command Palette |
| `⌘,` | Settings |
| `⌘1` | Command Center |
| `⌘2` | Code Editor |
| `⌘3` | Memory |
| `⌘4` | Observability |
| `⌘⇧F` | Global Search |
| `⌘G` | Toggle RPG World |
| `Esc` | Close palette/modal |

---

## 🚀 Getting Started

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.ai/) (for local models)

### Install & Run

```bash
# Clone
git clone https://github.com/sid7985/Naxus.git
cd Naxus/nexus-app

# Install dependencies
npm install

# Development (frontend only)
npm run dev

# Development (full Tauri app)
npm run tauri dev

# Build for production
npm run tauri build
```

### Configure LLM Providers

1. Launch the app → complete setup wizard
2. Go to **Settings** (`⌘,`) → **AI Providers**
3. For local: ensure Ollama is running (`ollama serve`)
4. For cloud: add API keys for OpenAI, Anthropic, Gemini, etc.
5. Assign models to agents in **Settings** → **Model Assignments**

---

## 🏗️ Architecture Highlights

- **Code Splitting** — All 26 pages lazy-loaded via `React.lazy()`
- **State Persistence** — `agentStore` + `memoryStore` + `settingsStore` use `zustand/persist`
- **Event Bus** — Type-safe pub-sub with 12 event categories for decoupled communication
- **Debate Protocol** — Destructive tool calls require Tester agent consensus
- **Memory Stack** — Local (Zustand) + Semantic (Mem0) + RAG (knowledge base)
- **MCP Integration** — Dynamic tool discovery from Model Context Protocol servers
- **Multi-Provider LLM** — Unified streaming interface across 10 providers with tool calling

---

## 📝 License

MIT © [Siddharth Jaiswal](https://github.com/sid7985)
