Here is the full PRD and UI/UX specification for your app. I'm naming it
**NEXUS** — your local AI company on your machine.

📄 **PRD:** **NEXUS** **—** **Your** **Local** **AI** **Company**

**Version:** 1.0 \| **Platform:** Desktop (Windows/macOS/Linux) \|
**AI** **Runtime:** Ollama (fully local)

**1.** **Product** **Vision**

NEXUS is a **fully** **local,** **privacy-first** **AI** **operating**
**system** that simulates an entire software company on your desktop.
You are the founder. Your agents — Manager, Coder, Designer, Marketer,
Researcher, and Tester — work autonomously or collaboratively to build,
test, and ship ideas with zero cloud dependency. It sees your screen,
controls your desktop, remembers everything, and only reaches the
internet when you say so.

**2.** **Target** **Personas**

> **Persona**
>
> **Solo** **Developer** (like Sid)
>
> **Student** **/** **Learner**
>
> **Startup** **Founder**
>
> **Freelancer**
>
> **Privacy-first**
>
> **Enterprise**
>
> **Description**

Builds multiple products simultaneously

Learning to build apps

Non-technical, product-minded

Juggles multiple clients

Cannot use cloud AI

> **Primary** **Use**

Delegates coding, testing, marketing tasks to agents

Pair-programs with Coder Agent, gets UI reviews from Designer Agent

Describes idea in natural language; agents produce MVP

Marketing + Coder agents handle deliverables in parallel

Runs NEXUS on internal servers for

secure AI workflows

**3.** **Core** **Design** **System**

**Visual** **Identity**

Inspired by deep-space dashboards and Raycast's command palette —
premium dark-first, glassmorphic panels, ambient glow per agent
role.atvoid+1

> ● **Background:** \#0A0A0F deep void black with very subtle animated
> particle nebula
>
> ● **Glass** **panels:** backdrop-filter: blur(20px) +
> rgba(255,255,255,0.04) surface + 1px rgba(255,255,255,0.1)
> border<u>\[[uxpilot](https://uxpilot.ai/blogs/glassmorphism-ui)</u>\]
>
> ● **Agent** **accent** **colors:**
>
> ○ 🟣 Manager — Violet \#7C3AED ○ 🔵 Coder — Cyan \#06B6D4
>
> ○ 🟡 Designer — Amber \#F59E0B ○ 🟢 Marketer — Emerald \#10B981 ○ 🔴
> Tester — Rose \#F43F5E
>
> ○ 🔍 Researcher — Indigo \#6366F1
>
> ● **Typography:** Inter for UI, JetBrains Mono for code/logs
>
> ● **Motion:** Framer-style spring physics for panel transitions;
> agents "pulse" their accent color when
> thinking<u>\[[sparkco](https://sparkco.ai/blog/ai-agent-ux-design-patterns-key-trends-for-2025)\]</u>

**4.** **Screen-by-Screen** **UI/UX**

🖥 **Screen** **1** **—** **Launcher** **(First** **Open)**

A full-screen animated onboarding with 3 steps:

> 1\. **"Meet** **Your** **Team"** — each agent card animates in one by
> one with name, role icon, and a one-line description
>
> 2\. **"Set** **Up** **Your** **Workspace"** — choose workspace folder,
> give NEXUS a project name
>
> 3\. **"Choose** **Your** **Models"** — dropdown for each agent role
> (auto-detects installed Ollama models); vision model picker for
> screen-aware agents

🖥 **Screen** **2** **—** **Main** **Workspace** **(Command** **Center)**

**Layout:** **3-column** **split**

text

┌──────────────┬──────────────────────────────┬─────────────────┐

│ │

│ AGENT TEAM │ MISSION FEED (center) │ sidebar │

│ │

│ │ │ CONTEXT PANEL │ │ (right rail) │

│ │

└──────────────┴──────────────────────────────┴─────────────────┘
\[BOTTOM COMMAND BAR — natural language input\]

**Left** **Sidebar** **—** **Agent** **Team** **Panel:**

> ● Each agent shown as a glowing avatar card with their accent color
>
> ● Live status badge: 💤 Idle / ⚡ Thinking / 🔧 Acting / ✅ Done ●
> Click any agent to open direct chat with just that agent
>
> ● Team leader (Manager) is always at top, slightly larger card

**Center** **—** **Mission** **Feed:**

> ● Timeline/feed of all agent actions in real-time — like a "company
> Slack" but automated ● Each message bubble has agent avatar, role tag,
> timestamp
>
> ● Shows agent-to-agent communication: *"Manager* *→* *Coder:* *Build*
> *login* *screen* *with* *Jetpack* *Compose"*
>
> ● Expandable code blocks, image previews, file links inline
>
> ● "Approve / Reject / Edit" buttons appear when an agent asks for
> permission\[<u>[procreator](https://procreator.design/blog/ai-patterns-for-designing-smarter-ai-agents/)\]</u>

**Right** **Rail** **—** **Context** **Panel:**

> ● Tabbed: 📁 Files \| 🧠 Memory \| 🌐 Web \| 📊 Metrics ● **Files**
> **tab:** live file tree of workspace, click to open in editor
>
> ● **Memory** **tab:** Mem0 memory cards — shows what NEXUS remembers
> about you, your projects, your preferences; editable
>
> ● **Web** **tab:** Researcher Agent's live browser view (only visible
> when internet is ON) ● **Metrics** **tab:** token usage, model load,
> RAM/VRAM usage, tasks completed

**Bottom** **Command** **Bar:**

> ● Full-width, pill-shaped input like macOS Spotlight but wider
>
> ● Natural language: *"Build* *me* *a* *login* *screen,* *get* *the*
> *Coder* *and* *Designer* *to* *work* *together"*
>
> ● Voice input button (local Whisper)
>
> ● Quick action chips above bar: 🔁 Resume Last Task \| 📸 Analyze
> Screen \| 🌐 Toggle Internet

🖥 **Screen** **3** **—** **Agent** **Profile** **(Click** **any**
**agent)**

Full-screen agent "office" view:

> ● **Header:** Agent name, role, model powering it (e.g.
> llama3.2:latest), uptime ● **Chat** **interface** — direct 1:1
> conversation with that specific agent
>
> ● **Skills** **panel** — list of tools this agent can use (e.g. Coder:
> run_terminal, write_file, read_file, search_code)
>
> ● **Task** **history** — everything this agent has ever done,
> searchable
>
> ● **Memory** **override** — manually inject context this agent should
> always remember ● **Personality** **slider** — tone from Professional
> → Casual; response detail from
>
> Concise → Verbose

🖥 **Screen** **4** **—** **Mission** **Builder** **(New** **Project)**

*Inspired* *by* *Google* *Antigravity's* *project*
*scaffolding*\[[<u>technijian</u>](https://technijian.com/google-ai/gemini/google-antigravity-the-revolutionary-agentic-development-platform-transforming-software-creation/)\]

> ● Large text field: *"Describe* *what* *you* *want* *to* *build"*
>
> ● NEXUS auto-generates a **Mission** **Brief** — goal, expected
> deliverables, agent assignments, estimated steps
>
> ● User can edit/approve the brief before agents start
>
> ● Visual **task** **dependency** **graph** — nodes for each subtask,
> edges showing dependencies, color-coded by agent
>
> ● **Timeline** **slider** — set urgency: Explore → Normal → Sprint

🖥 **Screen** **5** **—** **Screen** **Vision** **Panel**

> ● Floating **"Eye"** **button** on the right edge of screen — click to
> activate screen awareness ● When active: subtle glowing border around
> your screen + small agent avatar in corner
>
> showing it's watching
>
> ● **Vision** **feed** — thumbnail strip of recent screenshots in the
> right rail
>
> ● **Decision** **log** — "I saw a login error on line 42. Sending to
> Coder Agent."
>
> ● **Manual** **trigger:** Cmd+Shift+V — takes instant screenshot and
> asks *"What* *do* *you* *want* *me* *to* *do* *with* *this?"*
>
> ● Annotation mode — agent draws boxes on screen over elements it
> detects\[[<u>o-mega</u>](https://o-mega.ai/articles/top-10-computer-use-agents-ai-navigating-your-devices-full-review-2025)\]

🖥 **Screen** **6** **—** **Tester** **Agent** **Console**

*Full* *desktop* *control* *center*techcommunity.microsoft+1

> ● **Live** **screen** **mirror** — shows a small preview of current
> screen state ● **Test** **Plan** **view** — Planner sub-agent's
> generated test cases as cards
>
> (pass/fail/pending)
>
> ● **Execution** **log** — step-by-step log of every mouse click,
> keypress, assertion made
>
> ● **Safety** **toggle** — 🟢 Auto \| 🟡 Ask me \| 🔴 Locked — controls
> how much the Tester can do autonomously
>
> ● **Bug** **report** **panel** — auto-generated bug cards with
> screenshot evidence, severity tag, sent to Coder Agent automatically
>
> ● **Replay** **button** — watch the Tester re-run any past test
> session

🖥 **Screen** **7** **—** **Memory** **&** **Knowledge** **Base**

> ● Powered by **Mem0** **+**
> **ChromaDB**<u>\[[arxiv](https://arxiv.org/abs/2504.19413)</u>\] ●
> **3** **memory** **types** **shown** **as** **cards:**
>
> ○ 🟣 *Core* *Memories* — things you've explicitly told NEXUS about
> yourself and your preferences
>
> ○ 🔵 *Project* *Memories* — knowledge learned from working on your
> projects
>
> ○ 🟡 *Episodic* *Memories* — "On March 12 you built a login screen; it
> failed testing twice before passing"
>
> ● Search bar to find any memory
>
> ● Memory graph view — visual node graph of how concepts link together
> ● **Forget** **button** per memory card — full privacy control

🖥 **Screen** **8** **—** **Settings** **&** **Model** **Manager**

> ● **Ollama** **model** **hub** — shows all downloaded models, VRAM
> usage, pull new models inline
>
> ● **Agent** **assignment** — drag-drop to assign different models to
> different agents ● **Context** **window** **config** — set max tokens
> per agent
>
> ● **Internet** **settings** — whitelist domains when internet is ON;
> set search engine (SearXNG / DuckDuckGo)
>
> ● **RAG** **settings** — which folders to index, chunking strategy,
> embedding model ● **Keyboard** **shortcuts** manager
>
> ● **Theme** **picker** — Dark (default), OLED Black, Soft Light, High
> Contrast

**5.** **Full** **Feature** **List**

🤖 **Agent** **System**

> ● 6 built-in specialist agents (Manager, Coder, Designer, Marketer,
> Researcher, Tester) ● Custom agent creator — define name, role, tools,
> personality, model
>
> ● Agent-to-agent direct messaging with full audit log
>
> ● Manager agent auto-delegates tasks based on workload and agent skill
> match ● Parallel task execution — multiple agents work
> simultaneously<u>\[[appinventiv](https://appinventiv.com/blog/ai-ui-replacing-apps-and-buttons/)\]</u>
>
> ● Agent memory isolation — each agent has its own memory namespace

🖥 **Screen** **Vision** **&** **Desktop** **Control**

> ● Real-time screen capture with configurable interval (1s–60s)
>
> ● Llama 3.2 Vision for multimodal screen
> understanding\[[<u>youtube</u>](https://www.youtube.com/watch?v=-WqHY3uE_K0)\]
> ● OCR via Tesseract for text extraction from any screen
>
> ● Full mouse/keyboard control via PyAutoGUI for Tester
> Agent\[<u>[techcommunity.microsoft](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/autonomous-visual-studio-code-desktop-automation-using-computer-use-agent--pyaut/4434788)\]</u>
> ● Screen annotation overlay — agents highlight elements they detect
>
> ● Hotkey to trigger instant screen analysis (Cmd+Shift+V) ● Screen
> session recording and replay

🧠 **Memory** **System**

> ● Mem0 graph memory with vector + key-value + graph
> layers\[<u>[arxiv](https://arxiv.org/abs/2504.19413)\]</u>
>
> ● Per-agent memory namespaces + shared global workspace memory ●
> Manual memory injection — tell NEXUS things to always remember
>
> ● Memory decay settings — forget old low-value memories automatically
> ● Full memory export/import (JSON)
>
> ● Privacy wipe — one-click delete all memories

📚 **RAG** **&** **Knowledge**

> ● Index any local folder as a knowledge base
>
> ● Supports: PDF, DOCX, Markdown, code files, images, audio transcripts
> ● LlamaIndex + ChromaDB
> pipeline\[[<u>getmaxim</u>](https://www.getmaxim.ai/articles/top-5-ai-agent-frameworks-in-2025-a-practical-guide-for-ai-builders/)\]
>
> ● Real-time re-indexing when files change
>
> ● Source citations in every agent response — "I found this in
> /project/spec.pdf page 4"
>
> ● Web scrape to knowledge base — paste URL, it indexes the page
> locally

🌐 **Internet** **Toggle**

> ● Global ON/OFF toggle with visual indicator ● Per-session internet
> access grants
>
> ● Domain whitelist — only allow specific sites ● All web actions
> logged and reviewable
>
> ● SearXNG self-hosted search (fully private)
>
> ● Researcher agent browsing history with full replay

🧪 **Testing**

> ● Planner, Generator, Healer sub-agent
> architecture<u>\[[youtube](https://www.youtube.com/watch?v=Ok4QiO1iWMY)</u>\]
> ● Auto-generates test cases from code or UI screenshots
>
> ● Runs tests in loop — catch-fix-retest automatically
>
> ● Bug report auto-generation with screenshot evidence ● Regression
> test library — saved test suites per project
>
> ● Web testing (Playwright) + native app testing
> (PyAutoGUI)<u>\[[youtube](https://www.youtube.com/watch?v=0x0vjDxiSA4)</u>\]

💻 **Code** **&** **Dev** **Tools**

> ● Built-in code editor with syntax highlighting (Monaco editor) ●
> Coder agent can read/write/run files and terminal commands
>
> ● Git integration — auto-commit with AI-generated commit messages ●
> Multi-language support: Python, Kotlin, JS, Bash, Dart
>
> ● Code review mode — paste code, get line-by-line review
>
> ● Snippet library — Coder agent saves reusable code patterns

🎨 **Design** **Tools**

> ● UI/UX agent generates component descriptions, layout specs, color
> palettes ● Wireframe-to-code: describe a screen, get Jetpack Compose /
> React code ● Design system builder — define your app's tokens (colors,
> fonts, spacing)
>
> ● Accessibility checker — agent reviews UI for contrast, tap targets,
> readability

📣 **Marketing** **Tools**

> ● Marketing agent writes app store descriptions, social posts, blog
> articles ● SEO keyword suggestion (works offline with local knowledge)
>
> ● Competitor analysis (requires internet toggle) ● Email campaign
> writer
>
> ● Tagline and naming brainstorm mode

⚙ **Workflow** **Automation**

> ● n8n-compatible workflow triggers — connect NEXUS to your existing
> automations ● Cron-style scheduled tasks — "Every morning, summarize
> my project progress"
>
> ● Event triggers — "When Tester finds a critical bug, alert me
> immediately" ● Multi-step mission templates — save and reuse complex
> agent workflows ● Export workflows as shareable .nexus files

**6.** **Release** **Phases**

> **Phas** **Scope** **e**
>
> **Alpha** Manager + Coder + basic Ollama chat, screen capture, Mem0
> memory
>
> **Beta** All 6 agents, desktop control (Tester), RAG system, internet
> toggle
>
> **v1.0** Full UI polish, custom agents, n8n integration, mobile
> companion app
>
> **v1.5** Voice control (Whisper), multi-workspace, team sync (local
> LAN)
>
> **Timeline** **Goal**

Month 1–2

Month 3–4

Month 5–6

Month 7–8

**7.** **KPIs** **to** **Track**

> ● **Task** **completion** **rate** — % of agent tasks completed
> without human intervention ● **Memory** **recall** **accuracy** — % of
> times agent correctly uses past context
>
> ● **Test** **pass** **rate** **over** **time** — measures if Healer
> Agent improves code quality ● **Time-to-first-output** — latency from
> user command to first agent response ● **Daily** **active**
> **missions** — how many projects user runs per day
>
> ● **Privacy** **score** — % of sessions completed with internet fully
> OFF

**8.** **App** **Name** **Options**

> **Name** **Vibe**
>
> **NEXUS** Central hub, professional, powerful
>
> **CRUX** Core of everything, sharp, devs love it
>
> **FORGE** Building things, craftsmanship
>
> **ORBIT** Agents revolving around you
>
> **HIVE** Team of agents, collaborative, organic

NEXUS or FORGE suit your brand best given your existing product naming
style (HAQP, ChargeLink).

Here is how **Perplexity** **Computer** and **Claude** **Computer**
**Use** (which I believe "Zero Claw" refers to — Anthropic's
Claude-powered computer control, often nicknamed "Claw") get integrated
into NEXUS as dedicated feature modules.

🖥 **Feature** **Add-On** **1** **—** **NEXUS** **Computer** **Mode**

*Inspired* *directly* *by* *Perplexity*
*Computer*<u>\[[perplexity](https://www.perplexity.ai/help-center/en/articles/13837784-what-is-computer)</u>\]

Perplexity Computer's core philosophy: **"Perplexity** **answers**
**your** **questions.** **Computer** **does** **your** **work."** Your
NEXUS version builds the same but 100%
locally.\[<u>[perplexity](https://www.perplexity.ai/help-center/en/articles/13837784-what-is-computer)\]</u>

**What** **It** **Does**

NEXUS Computer Mode turns a single natural language prompt into a
**full** **chained** **workflow** — no separate agent-switching, no
manual
steps:<u>\[[perplexity](https://www.perplexity.ai/help-center/en/articles/13837784-what-is-computer)</u>\]

> *"Research* *my* *3* *competitors,* *write* *a* *comparison* *doc,*
> *generate* *a* *pitch* *deck,* *and* *save* *it* *to*
> */projects/pitch"*

NEXUS Computer would:

> 1\. Researcher Agent → parallel web searches (if internet ON) 2.
> Manager Agent → synthesizes findings
>
> 3\. Marketer Agent → writes comparison copy
>
> 4\. Designer Agent → generates slide layout spec 5. Coder Agent →
> builds the PPTX/MD file
>
> 6\. Saves to disk automatically — **zero** **human** **steps** **in**
> **between**

**Async** **Background** **Execution**

Inspired by Perplexity Computer's **asynchronous** **execution** and
Comet's **Background** **Assistants**:perplexity+1

> ● NEXUS runs missions in the background while you work on something
> else ● **Condition-based** **triggers:** *"When* *my* *build* *fails,*
> *auto-run* *Tester* *Agent"*
>
> ● **Scheduled** **jobs:** *"Every* *morning* *at* *9AM,* *summarize*
> *yesterday's* *code* *commits"*
>
> ● **Event** **watchers:** Monitor a folder, a file, clipboard, or open
> app — fire an agent when something changes
>
> ● Background task tray icon pulses when agents are working; click to
> expand live feed

**Capability** **Chaining** **(Skills** **System)**

Modeled after Perplexity Computer's **Skills**:perplexity+1

> ● Pre-built chains called **Skills** — reusable multi-step workflows
>
> ● Example Skills: Build & Test Loop, Write → Review → Commit, Research
> → Blog Post, UI Mockup → Code
>
> ● Save your own custom Skills from any completed mission ● Share
> Skills as .nexus skill files with other users

**App** **Connectors** **(Local** **Version)**

Perplexity Computer connects to Gmail, GitHub, Linear, Slack, Notion.
NEXUS does it **locally** **via** **MCP** **servers**:perplexity+1

> **Cloud** **(Perplexity)**
>
> Gmail integration
>
> GitHub connector
>
> Linear tickets
>
> Notion documents
>
> Slack messages
>
> **NEXUS** **Local** **Equivalent**

Local email client via IMAP

Local Git via CLI tools

Local Jira/Plane self-hosted

Obsidian vault / local MD files

Local Matrix/Rocket.Chat

All connectors toggle ON/OFF individually. Zero data leaves your
machine.

**Credit-Free** **Task** **Meter**

Perplexity Computer uses credits. NEXUS replaces this with a
**Resource** **Meter** — shows real-time RAM, VRAM, CPU load per task.
If hardware is stressed, Manager Agent queues tasks automatically rather
than running in
parallel.<u>\[[perplexity](https://www.perplexity.ai/help-center/en/articles/13837784-what-is-computer)</u>\]

🦾 **Feature** **Add-On** **2** **—** **NEXUS** **Zero** **Claw**
**(Computer** **Use** **Engine)**

*Inspired* *by* *Anthropic* *Claude's* *Computer* *Use* *—* *full* *GUI*
*control* *via* *vision* *+* *action*

Claude Computer Use (nicknamed "Claw" in the dev community) lets an AI
see your entire screen via screenshots and take real GUI actions —
clicks, typing, scrolling — on **any** **app,** **any** **OS**, not just
a browser. This is deeper than the Tester Agent — it's a **universal**
**GUI** **brain**.techcommunity.microsoft+1

**How** **Zero** **Claw** **Works** **in** **NEXUS** text

User command: "Open Figma, duplicate the login frame, change the button
color to \#7C3AED"

> ↓

Zero Claw takes screenshot → sends to llama3.2-vision ↓

Vision model identifies: app open, frame location, button element ↓

PyAutoGUI executes: click, shortcut, color picker interaction ↓

Screenshot again → verify result → next step ↓

Repeats until task complete or asks user for help

**Zero** **Claw** **Capabilities**

> ● **Any** **app** **control** — Android Studio, Figma, VS Code,
> Chrome, Terminal, File Explorer, Settings — if it's on screen, Zero
> Claw can interact with
> it<u>\[[reddit](https://www.reddit.com/r/Python/comments/1p80ijy/ai_desktop_agent_that_controls_your_os_opensource/)\]</u>
>
> ● **Visual** **element** **detection** — uses OCR + vision to find
> buttons, text fields, dropdowns by what they look like, not hardcoded
> selectors
>
> ● **Self-correcting** **loops** — if an action fails (element moved,
> dialog appeared), Zero Claw re-analyzes screen and retries with new
> strategy
>
> ● **Natural** **language** **GUI** **commands** — *"Close* *all*
> *unused* *tabs* *in* *Chrome"*, *"In* *Android* *Studio,* *run* *the*
> *app* *on* *emulator* *3"*
>
> ● **Drag** **and** **drop** **support** — file organization, UI
> builder interactions, canvas tools ● **Multi-monitor** **awareness** —
> knows which screen to look at; can work across 2+
>
> displays

**Transparency** **Layer** **(Comet-Inspired)**

Perplexity Comet shows you exactly what it's clicking. Zero Claw does
the
same:\[<u>[perplexity](https://www.perplexity.ai/hub/blog/comet-assistant-puts-you-in-control)\]</u>

> ● **Live** **overlay** — semi-transparent highlight box drawn around
> every element before clicking it
>
> ● **Step** **narration** — *"I* *see* *a* *'Run'* *button* *in* *the*
> *top* *toolbar.* *Clicking* *it* *now."* shown in feed ● **Pause**
> **anytime** — one-click or hotkey stops Zero Claw mid-task, no
> questions
>
> asked<u>\[[perplexity](https://www.perplexity.ai/hub/blog/comet-assistant-puts-you-in-control)</u>\]
>
> ● **Undo** **last** **action** — keyboard shortcut attempts to reverse
> the last GUI interaction ● **Permission** **tiers** — exactly 3
> levels, same as Comet's control
> model:\[[<u>perplexity</u>](https://www.perplexity.ai/hub/blog/comet-assistant-puts-you-in-control)\]
>
> **Level**
>
> 🟢 **Auto**
>
> 🟡 **Ask** **once**
>
> 🔴 **Always**
>
> **confirm**
>
> **What** **Zero** **Claw** **can** **do**

Read screen, move mouse, scroll, open apps

Click buttons, type text, open files

Delete, send, submit, system settings, payment

screens

**Zero** **Claw** **+** **Agent** **Integration**

Zero Claw is available to **all** **agents**, not just Tester:

> ● **Coder** **Agent** uses Zero Claw to run apps, check UI output, fix
> build errors in Android Studio visually
>
> ● **Designer** **Agent** uses Zero Claw to open Figma, inspect
> elements, export assets ● **Tester** **Agent** uses Zero Claw as its
> primary execution engine for all native app
>
> testing<u>\[[techcommunity.microsoft](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/autonomous-visual-studio-code-desktop-automation-using-computer-use-agent--pyaut/4434788)</u>\]
>
> ● **Manager** **Agent** can trigger Zero Claw for any task it can't
> complete via API/file alone ● **User** can invoke Zero Claw directly:
> press Cmd+Shift+Z → draw a box on screen →
>
> type what you want done

**Updated** **NEXUS** **Feature** **Summary**

Adding these two modules to your PRD, the complete **NEXUS** **feature**
**tiers** now look like:

> **Module**
>
> **Module**
>
> Agent Team
>
> Screen Vision
>
> NEXUS Computer Mode
>
> Zero Claw Engine
>
> Background Assistants
>
> Memory
>
> RAG
>
> Internet Toggle
>
> Tester Agent
>
> **Core** **Inspiration**
>
> **Core** **Inspiration**

MetaGPT / CrewAI

Screenpipe + llama3.2-vision

Perplexity Computer
\[<u>[perplexity](https://www.perplexity.ai/help-center/en/articles/13837784-what-is-computer)\]</u>

Claude Computer Use

Comet Background Assistants
<u>\[[perplexity](https://www.perplexity.ai/hub/blog/comet-is-now-available-to-everyone-worldwide)</u>\]

Mem0 graph memory

LlamaIndex + ChromaDB

Comet permission model
<u>\[[perplexity](https://www.perplexity.ai/hub/blog/comet-assistant-puts-you-in-control)</u>\]

Playwright Agents + Computer

Use

> **Local** **Implementation**
>
> **Local** **Implementation**

6 specialist agents + custom agents

OCR + multimodal screenshots

Async tasks, skill chains, app connectors

PyAutoGUI + vision loop, any-app control

Cron triggers, event watchers, file monitors

Persistent cross-session agent memory

Local document intelligence

SearXNG, domain whitelist, audit log

Planner/Generator/Healer

sub-agents

NEXUS is now a **complete** **local** **alternative** to Perplexity
Computer + Comet + Claude Computer Use — all running on your own
hardware, zero subscriptions, zero data leaving your machine. 🔥

This is the most complete spec I can build for NEXUS. Every feature,
every screen, every system — documented in full.

🧠 **NEXUS** **—** **Complete** **Software** **Specification**

***The*** ***World's*** ***Most*** ***Advanced*** ***Local*** ***AI***
***Company*** ***on*** ***Your*** ***Desktop***

**Version** **2.0** **FULL** **SPEC** \| Desktop (Tauri/Electron) \|
Local-First \| Ollama Powered

**PART** **1** **—** **PRODUCT** **PHILOSOPHY**

NEXUS is not an AI assistant. It is a **fully** **autonomous** **AI**
**organization** that lives on your machine. Six specialist agents form
your company. You are the founder. Every feature is built on three laws:

> **Law** **1** **—** **Privacy** **Absolute:** No data leaves your
> machine unless you flip the internet switch.
>
> **Law** **2** **—** **You** **Stay** **in** **Control:** Every
> autonomous action can be paused, reversed, or redirected at any
> moment.
>
> **Law** **3** **—** **It** **Remembers** **Everything:** Nothing is
> ever forgotten unless you say so.

**PART** **2** **—** **COMPLETE** **SYSTEM** **ARCHITECTURE** text

╔══════════════════════════════════════════════════════════════╗ ║ NEXUS
CORE ENGINE ║ ║ ║ ║ ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐
║

║ │ AGENT TEAM │ │ ZERO CLAW │ │ NEXUS COMPUTER │ ║

║ │ CrewAI / │

║ │ MetaGPT │

│ Desktop

│ Control

│ │ Async Mission │ ║

│ │ Engine │ ║

║ └──────┬──────┘

║ │

└──────┬──────┘

> │

└────────┬─────────┘ ║

> │ ║

║ ┌──────▼─────────────────▼────────────────────▼─────────┐ ║ ║ │
ORCHESTRATION LAYER (LangGraph) │ ║ ║
└──────────────────────────┬─────────────────────────────┘ ║ ║ │ ║

║ ┌──────────────────────────▼─────────────────────────────┐ ║ ║ │
MEMORY NEXUS │ ║

║ │ Mem0 Graph │ ChromaDB RAG │ Episodic Log │ Core Facts │ ║ ║
└──────────────────────────┬─────────────────────────────┘ ║ ║ │ ║

║ ┌──────────────────────────▼─────────────────────────────┐ ║ ║ │
OLLAMA RUNTIME LAYER │ ║ ║ │ llama3.2 │ llama3.2-vision │ Whisper │
nomic-embed │ ║ ║
└──────────────────────────┬─────────────────────────────┘ ║ ║ │ ║

║ ┌──────────────────────────▼─────────────────────────────┐ ║ ║ │ TOOL
& MCP LAYER │ ║ ║ │ Screen │ Files │ Terminal │ Git │ Browser │ n8n │
More │ ║ ║ └─────────────────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════╝

**PART** **3** **—** **AGENT** **TEAM** **(FULL** **SPEC)**

🟣 **Agent** **1** **—** **NEXUS** **Manager** **(The** **Founder's**
**Right** **Hand)**

**Model:** llama3.2:latest (70B recommended, 8B minimum)

**Personality:** Calm, decisive, structured. Communicates like a senior
engineering lead.

**Full** **Capability** **List:**

> ● Receives any natural language goal and produces a full Mission Brief
> with subtasks, agent assignments, estimated steps, dependencies, and
> success criteria
>
> ● Monitors all active agent tasks in real-time; re-delegates if an
> agent is stuck for more than N seconds
>
> ● Arbitrates conflicts between agents (e.g., Coder and Designer
> disagree on implementation)
>
> ● Generates daily standup summaries: what each agent did, what's
> blocked, what's next ● Sends progress notifications to user at
> configurable intervals
>
> ● Can spawn **temporary** **micro-agents** for one-off tasks (e.g., a
> single file conversion) ● Tracks project health score (0–100) based on
> test pass rate, code quality, deadline
>
> proximity
>
> ● Creates and manages project roadmaps with milestones
>
> ● Escalation protocol — flags critical issues to user immediately with
> context and options
>
> ● Post-mission retrospective report — what worked, what failed,
> lessons learned stored to
> Mem0\[<u>[monday](https://monday.com/blog/rnd/best-ai-coding-agents-for-software-developers/)\]</u>

🔵 **Agent** **2** **—** **NEXUS** **Coder** **(Your** **Senior**
**Engineer)**

**Model:** deepseek-coder-v2 or codellama:34b via Ollama

**Personality:** Precise, no-nonsense, focused. Explains decisions
briefly when asked.

**Full** **Capability** **List:**

> ● Write, read, edit, delete any file in the workspace
>
> ● Execute terminal commands (bash/zsh/PowerShell) with output capture
> ● Run code in Python, Kotlin, JavaScript, Bash, Dart, C, Java
>
> ● Multi-file simultaneous editing with full codebase
> context<u>\[[monday](https://monday.com/blog/rnd/best-ai-coding-agents-for-software-developers/)</u>\]
>
> ● Autonomous debugging loop — run → detect error → analyze stack trace
> → fix → rerun (up to 10 iterations)
>
> ● Git operations: commit, branch, merge, push, pull, diff, stash — all
> with AI-generated
> messages\[<u>[playcode](https://playcode.io/blog/best-ai-coding-agents-2026)\]</u>
>
> ● Dependency management: auto-install npm/pip/gradle packages when
> needed
>
> ● Code review mode — line-by-line analysis with severity tags
> (critical / warning / suggestion)
>
> ● Refactoring engine — rename variables, extract functions, split
> files based on best practices
>
> ● Architecture advisor — suggests design patterns (MVVM, Clean
> Architecture, Repository Pattern) based on your
> stack\[[<u>blogs.emorphis</u>](https://blogs.emorphis.com/ai-coding-tools-comparison-guide/)\]
>
> ● Snippet memory — saves reusable code blocks to RAG for future use
>
> ● Reads documentation (local PDF/MD) and implements features from spec
>
> ● Android/Kotlin specialist mode — Jetpack Compose, Room, Retrofit,
> Coroutines, Hilt ● Generates unit tests automatically for every
> function it writes
>
> ● Performance profiler mode — identifies slow queries, memory leaks,
> O(n²) loops
>
> ● Security scanner — flags hardcoded credentials, SQL injection risks,
> insecure HTTP calls

🟡 **Agent** **3** **—** **NEXUS** **Designer** **(Your** **UI/UX**
**Lead)**

**Model:** llama3.2-vision (for screen analysis) + llama3.2 (for text
specs) **Personality:** Opinionated, aesthetic-first, user-empathy
driven.

**Full** **Capability** **List:**

> ● Generates complete UI specifications from natural language
> descriptions
>
> ● Produces Jetpack Compose code, React JSX, Flutter widgets from
> design descriptions ● Screen analysis via vision model — looks at your
> current UI and gives critique
>
> ● Accessibility audit — contrast ratios, touch target sizes, screen
> reader
> labels\[[<u>sparkco</u>](https://sparkco.ai/blog/ai-agent-ux-design-patterns-key-trends-for-2025)\]
>
> ● Design token system — maintains your app's color palette,
> typography, spacing as a live spec file
>
> ● Component library builder — documents every UI component with
> variants, states, props ● Figma-style annotation generator — produces
> spec sheets with measurements and
>
> notes
>
> ● Responsive layout advisor — suggests breakpoints and adaptive
> layouts
>
> ● Animation spec writer — describes Lottie animations, transition
> timing, spring physics
>
> ● Brand consistency checker — scans all screens for inconsistent
> fonts, colors, icon styles ● Wireframe-to-code: describe layout in
> words → get complete component code
>
> ● Dark/light mode designer — auto-generates both theme variants
>
> ● Onboarding flow designer — produces step-by-step new user experience
> flows ● Icon set manager — curates and organizes icon usage across the
> project
>
> ● User journey mapper — visualizes how a user navigates through your
> app

🟢 **Agent** **4** **—** **NEXUS** **Marketer** **(Your** **Growth**
**Lead)**

**Model:** llama3.2:latest

**Personality:** Energetic, persuasive, data-aware. Writes like a great
copywriter.

**Full** **Capability** **List:**

> ● App Store Optimization (ASO) — writes Play Store/App Store titles,
> descriptions, keywords
>
> ● Social media content calendar — generates 30 days of posts for
> Twitter/X, LinkedIn, Instagram
>
> ● Blog article writer — full SEO-optimized articles from a topic
> prompt
>
> ● Press release generator — formal launch announcements for product
> updates
>
> ● Email campaign writer — welcome sequences, feature announcements,
> re-engagement flows
>
> ● Cold outreach templates — personalized emails for partnerships, B2B
> sales
>
> ● Tagline and product naming brainstormer — generates 20+ options with
> rationale
>
> ● Competitor analysis writer (when internet ON) — summarizes
> competitor positioning ● Landing page copy generator — headline,
> subheadline, features, CTA, FAQ,
>
> testimonials
>
> ● Pitch deck content — slide-by-slide talking points and content for
> investor decks ● Product Hunt launch kit — tagline, description, first
> comment, maker story
>
> ● User persona creator — develops detailed customer profiles from your
> app description ● Ad copy generator — Google Ads, Meta Ads, banner
> text with A/B variants
>
> ● Changelog writer — converts git commits into user-friendly release
> notes
>
> ● Community post generator — Reddit, HackerNews-style launch posts in
> authentic tone

🔍 **Agent** **5** **—** **NEXUS** **Researcher** **(Your**
**Intelligence** **Lead)**

**Model:** llama3.2:latest + SearXNG (when internet ON) **Personality:**
Thorough, skeptical, citation-obsessed.

**Full** **Capability** **List:**

> ● Web search via SearXNG (self-hosted, fully private) when internet is
> ON\[[<u>segmentstream</u>](https://segmentstream.com/blog/articles/best-mcp-servers-for-marketers)\]
>
> ● Deep research mode — runs 10–20 searches, synthesizes into a
> structured report ● Local document research — semantic search across
> all indexed files in workspace ● Technology comparison reports —
> evaluates 3–5 options for any tech decision
>
> ● Stack Overflow / GitHub issue search (internet ON) for specific
> error messages ● Library/API documentation summarizer — finds and
> explains usage patterns
>
> ● Patent landscape research — searches for prior art (internet ON)
>
> ● Market size estimation — combines public data into TAM/SAM/SOM
> estimates ● Academic paper summarizer — reads PDFs and extracts key
> findings
>
> ● Dependency vulnerability checker — cross-references CVE databases
>
> ● Best practices aggregator — "How do top apps handle X?" style
> research
>
> ● Source verification — cross-checks facts across multiple sources,
> flags contradictions ● Research history — every search, every result,
> every summary stored and searchable ● Cites every claim with source
> URL and snippet in every
> output<u>\[[sparkco\]](https://sparkco.ai/blog/ai-agent-ux-design-patterns-key-trends-for-2025)</u>
>
> ● Offline research mode — uses only locally indexed knowledge base
> when internet OFF

🔴 **Agent** **6** **—** **NEXUS** **Tester** **(Your** **QA** **Lead)**

**Model:** llama3.2-vision (screen analysis) + llama3.2 (test logic)
**Personality:** Adversarial, methodical, relentless. Tries to break
everything.

**Full** **Capability** **List:**

**Sub-Agent** **1** **—** **Planner:**

> ● Explores app by navigating every screen via Zero Claw desktop
> control ● Identifies all interactive elements, input fields,
> navigation paths
>
> ● Generates structured test plan: smoke tests, regression tests, edge
> cases, stress
> tests<u>\[[youtube](https://www.youtube.com/watch?v=Ok4QiO1iWMY)</u>\]
>
> ● Produces test coverage map — visual graph of what's tested vs
> untested

**Sub-Agent** **2** **—** **Generator:**

> ● Auto-writes test scripts (Python + PyAutoGUI for native, Playwright
> for
> web)\[[<u>youtube</u>](https://www.youtube.com/watch?v=Ok4QiO1iWMY)\]
> ● Generates unit tests, integration tests, end-to-end tests
>
> ● Creates test data fixtures — sample users, edge case inputs,
> boundary values ● Writes accessibility test scripts (contrast,
> navigation, screen reader simulation) ● Performance benchmarks —
> measures load time, frame rate, memory footprint

**Sub-Agent** **3** **—** **Healer:**

> ● When UI changes break a test (element moved, renamed), re-inspects
> screen via vision model
>
> ● Auto-updates test locators without human
> input<u>\[[youtube](https://www.youtube.com/watch?v=Ok4QiO1iWMY)</u>\]
>
> ● Learns from past failures — stores fix patterns in Mem0 to avoid
> repeating mistakes ● Sends fixed test + explanation back to Coder
> Agent for code alignment

**Core** **Testing** **Capabilities:**

> ● Full desktop control via PyAutoGUI — clicks, typing, scrolling,
> dragging,
> hotkeys\[<u>[techcommunity.microsoft](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/autonomous-visual-studio-code-desktop-automation-using-computer-use-agent--pyaut/4434788)\]</u>
>
> ● Playwright browser automation for all web/Electron
> UI\[[<u>testmuai</u>](https://www.testmuai.com/blog/desktop-automation-tools/)\]
>
> ● Screenshot-based visual regression — pixel diff between expected and
> actual UI ● Video recording of every test run for bug evidence
>
> ● Parallel test execution — run multiple test suites simultaneously
>
> ● Auto-generated bug reports with severity, screenshot, reproduction
> steps, sent directly to Coder Agent
>
> ● Regression library — saved test suites per project that run
> automatically on each code change
>
> ● Fuzz testing mode — sends random/unexpected inputs to find crashes ●
> Network condition simulation — tests app behavior on slow/no internet
> ● Load testing — simulates multiple simultaneous users
>
> ● Keyboard-only navigation testing (accessibility)

**PART** **4** **—** **ZERO** **CLAW** **ENGINE** **(Full** **Spec)**

Zero Claw is NEXUS's universal desktop control brain, available to all
agents.o-mega+1

**Vision-Action** **Loop** text

1\. Take screenshot (configurable: full screen / active window / region)

2\. Send to llama3.2-vision → identify elements, text, state 3. OCR pass
via Tesseract → extract all text

4\. Agent decides: what to do next

5\. PyAutoGUI executes: click / type / scroll / drag / hotkey /
right-click

6\. Wait N ms (human-like delay to avoid detection) \[web:49\] 7. Take
new screenshot → verify action succeeded

8\. If failed → retry with alternative strategy (max 3 retries) 9. Log
action + result to session record

10\. Repeat until task complete

**Full** **Action** **Library**

> **Category**
>
> **Mouse**
>
> **Keyboard**
>
> **Window**
>
> **Screen**
>
> **Clipboard**
>
> **File** **dialogs**
>
> **System**
>
> **Scroll/Zoo**
>
> **m**
>
> **Actions**

Left click, right click, double click, middle click, click-and-hold,
drag-and-drop, hover, scroll up/down/left/right

Type text, press key, hold modifier (Ctrl/Cmd/Shift/Alt), key combo,
hotkey sequences

Focus window, minimize, maximize, resize, move, close, switch between
apps

Full screenshot, region screenshot, screen record start/stop, get pixel
color at coords

Copy, paste, get clipboard content, clear clipboard

Navigate file picker, select file, type path, confirm dialog

Open app by name, close app, set volume, adjust brightness, lock screen

Page down, smooth scroll, pinch zoom simulation

**Safety** **System** **(3** **Tiers)**

> ● 🟢 **Ghost** **Mode** — reads/observes only; no clicks or keypresses
>
> ● 🟡 **Guided** **Mode** — executes actions but pauses for confirm on
> all destructive operations
>
> ● 🔴 **Locked** **Mode** — all Zero Claw activity suspended; agents
> work in text/file only ● **Never-execute** **list** — user-defined
> blacklist of apps Zero Claw can never touch
>
> ● **Safe** **zone** — user draws a screen region; Zero Claw only
> operates inside it
>
> ● **Emergency** **stop** — Ctrl+Shift+Esc triple press kills all Zero
> Claw activity
> instantly<u>\[[reddit](https://www.reddit.com/r/SaaS/comments/1redy39/from_pikachu_to_zyron_we_built_a_fully_local_ai/)\]</u>

**Annotation** **Overlay**

> ● Semi-transparent box drawn around every element before
> interaction<u>\[[o-mega](https://o-mega.ai/articles/top-10-computer-use-agents-ai-navigating-your-devices-full-review-2025)\]</u>
> ● Color coded: 🟢 safe action, 🟡 needs approval, 🔴 destructive
>
> ● Step counter shown in corner: "Step 3 of 11 — clicking Submit
> button" ● Undo last action — Cmd+Z attempts to reverse previous Zero
> Claw step

**PART** **5** **—** **NEXUS** **COMPUTER** **MODE** **(Full** **Spec)**

Inspired by Perplexity Computer's async multi-step
execution:\[<u>[perplexity](https://www.perplexity.ai/help-center/en/articles/13837784-what-is-computer)\]</u>

**Mission** **Engine**

> ● **Single-prompt** **missions:** one natural language command → full
> chained agent workflow → complete deliverable
>
> ● **Async** **background** **execution** — missions run while you do
> other things; tray icon shows live
> status<u>\[[perplexity](https://www.perplexity.ai/hub/blog/comet-is-now-available-to-everyone-worldwide)</u>\]
>
> ● **Condition** **triggers:** "When my build succeeds, run the full
> test suite"
>
> ● **Scheduled** **missions:** cron-style scheduling with natural
> language ("every weekday at 9am")
>
> ● **File** **watchers:** monitor folders, trigger agent when files
> change or are created
>
> ● **Clipboard** **watcher:** detect when you copy a URL/code/error —
> offer instant agent action
>
> ● **Mission** **queue** — line up multiple missions; Manager Agent
> executes in optimal
> order\[<u>[perplexity](https://www.perplexity.ai/help-center/en/articles/13837784-what-is-computer)\]</u>
>
> ● **Mission** **templates** **(Skills):** save any completed workflow
> as a reusable .nexus skill file
>
> ● **Mission** **branching:** if X then do Y else do Z — conditional
> logic in mission flows

**App** **Connectors** **(Local** **MCP** **Servers)onereach+1**

> **Connector** **What** **It** **Does**
>
> **Git/GitHub** **local**
>
> **Obsidian** **vault**
>
> **VS** **Code**
>
> **Android** **Studio**
>
> **Local** **email** **(IMAP)**
>
> **Figma** **(API)**
>
> **n8n** **local**
>
> **Notion** **(local** **export)**
>
> **SQLite/PostgreSQL** **local**
>
> **Slack** **(local** **relay)**

Commit, branch, PR descriptions, issue summaries

Read/write markdown notes, search knowledge base

Open files, run extensions, read problems panel

Run emulator, read Logcat, trigger builds

Read/send emails, summarize inbox

Read design tokens, export assets

Trigger workflows, receive webhook events

Parse and search exported notion archives

Query databases, generate reports

Post messages, read channel history via local relay

**Resource** **Meter** **(Replaces** **Credits)**

> ● Real-time RAM, VRAM, CPU, disk usage per active mission
>
> ● Thermal throttle detection — automatically queues tasks if CPU temp
> is too high ● Model swap suggestion — "You're running 3 agents, switch
> to 8B model to free
>
> VRAM"\[[<u>reddit</u>](https://www.reddit.com/r/SaaS/comments/1redy39/from_pikachu_to_zyron_we_built_a_fully_local_ai/)\]
>
> ● Battery-aware mode — reduces model size and parallel tasks when on
> battery

**PART** **6** **—** **MEMORY** **SYSTEM** **(Full** **Spec)**

**Memory** **Architecture** **(5** **Layers)** text

Layer 1 — CORE FACTS (permanent)

> → Your name, preferences, tech stack, project names, hard rules →
> Never auto-deleted; editable only by user

Layer 2 — PROJECT MEMORY (semi-permanent)

→ Per-project knowledge: architecture decisions, APIs used, design
choices

> → Lives as long as project exists

Layer 3 — AGENT MEMORY (role-scoped)

→ Each agent's learned patterns, preferred approaches, past decisions

> → Isolated per agent but Manager can read all

Layer 4 — EPISODIC MEMORY (time-stamped events)

> → "On March 13, Coder fixed a crash in LoginViewModel" → Powered by
> Screenpipe session logs + Mem0 \[web:36\]

Layer 5 — SEMANTIC MEMORY (RAG)

> → All indexed files, documents, code — searchable by meaning →
> LlamaIndex + ChromaDB + nomic-embed-text model

**Memory** **Features**

> ● **Memory** **graph** **view** — interactive node graph showing how
> concepts connect\[<u>[arxiv](https://arxiv.org/abs/2504.19413)\]</u> ●
> **Memory** **timeline** — scroll through what NEXUS knew on any past
> date
>
> ● **Memory** **search** — semantic search across all 5 layers
> simultaneously
>
> ● **Memory** **injection** — manually add any fact: *"Always* *use*
> *MVVM* *pattern* *in* *my* *projects"* ● **Memory** **cards** — each
> memory shown as an editable card with source, date,
>
> confidence score
>
> ● **Auto-consolidation** — Mem0 automatically merges duplicate
> memories and resolves
> contradictions\[[<u>arxiv</u>](https://arxiv.org/html/2504.19413v1)\]
>
> ● **Forget** **mode** — delete individual memories, full project
> memory wipe, or total reset ● **Memory** **export** — full JSON export
> of all memories (for backup or transfer)
>
> ● **Privacy** **audit** — shows exactly what NEXUS knows about you at
> any time ● **Memory** **decay** — optional: reduce weight of memories
> older than N days
>
> ● **Cross-project** **learning** — Coder Agent remembers a bug fix
> pattern from Project A and applies it in Project B

**RAG** **(Knowledge** **Base)** **Features**

> ● Index any local folder — recursive, auto-updates on file change
>
> ● Supported file types: .pdf, .md, .txt, .docx, .py, .kt, .js, .html,
> .csv, .json, .png (OCR), .mp3 (Whisper transcript), .mp4 (transcript)
>
> ● Source citations in every agent response — "From /docs/spec.pdf page
> 12" ● Chunking strategy selector: sentence, paragraph, semantic,
> fixed-size
>
> ● Re-ranking — after initial retrieval, rerank chunks by relevance
> before sending to model ● Hybrid search — vector similarity + keyword
> BM25 combined
>
> ● Web-to-knowledge: paste URL → agent scrapes and indexes the page
> locally
>
> ● Knowledge base viewer — browse all indexed content, see chunk
> preview, manually remove bad chunks
>
> ● Multiple knowledge bases — one per project + one global shared
> across all projects

**PART** **7** **—** **VOICE** **CONTROL** **(Full** **Spec)**

Fully local voice system using **Whisper** (STT) + **Kokoro/Piper**
(TTS):<u>\[[gocodeo](https://www.gocodeo.com/post/creating-voice-based-ai-agents-with-openai-whisper-and-elevenlabs)</u>\]

**Wake** **Word** **System**

> ● Custom wake word: default "Hey NEXUS" — changeable to
> anything<u>\[[picovoice](https://picovoice.ai/blog/complete-guide-to-wake-word/)\]</u>
> ● Powered by **Picovoice** **Porcupine** (on-device, \<1ms latency)
>
> ● Works even when NEXUS window is minimized or hidden
>
> ● Sensitivity slider — how easily it triggers (low = precise, high =
> sensitive) ● Visual indicator glows on taskbar icon when listening

**Voice** **Input** **Features**

> ● Continuous conversation mode — no need to say wake word every
> message ● **Dictation** **mode** — speak code descriptions, it types
> them
>
> ● **Command** **mode** — voice-trigger any NEXUS function:
>
> ○ *"Hey* *NEXUS,* *show* *me* *what* *the* *Tester* *agent* *found"* ○
> *"Hey* *NEXUS,* *pause* *all* *agents"*
>
> ○ *"Hey* *NEXUS,* *commit* *my* *changes* *with* *a* *good* *message"*
> ○ *"Hey* *NEXUS,* *analyze* *my* *screen"*
>
> ○ *"Hey* *NEXUS,* *toggle* *internet"*
>
> ● Multi-language support (Whisper supports 99 languages including
> Hindi)<u>\[[gocodeo](https://www.gocodeo.com/post/creating-voice-based-ai-agents-with-openai-whisper-and-elevenlabs)\]</u>
> ● Accent-aware — trained on diverse speech; works well with Indian
> English
>
> ● Ambient noise filtering — works in noisy environments

**Voice** **Output** **Features**

> ● Agent voice responses via **Piper** **TTS** (local, no cloud)
>
> ● Each agent has a distinct voice persona — Manager is deep/calm,
> Tester is fast/clipped
>
> ● Speed control: 0.5x–2x playback speed
>
> ● Voice narration mode — Zero Claw narrates every action it takes
> aloud\[<u>[youtube](https://www.youtube.com/watch?v=mTJO1X0fYo0)\]</u>
> ● Mute individual agents while keeping others on
>
> ● Read-aloud mode — any text in the app can be read aloud on command

**PART** **8** **—** **SCREEN** **VISION** **SYSTEM** **(Full**
**Spec)**

**Capture** **Modes**

> ● **Passive** **watch** — screenshot every N seconds (configurable
> 1s–300s), analyzed quietly ● **Active** **analysis** — instant
> screenshot on hotkey Cmd+Shift+V
>
> ● **Event-triggered** — capture when: window changes, dialog appears,
> error message detected, specific app opens
>
> ● **Region** **lock** — watch only a specific area of screen (e.g.,
> just the terminal output) ● **Multi-monitor** — select which
> display(s) to watch

**Vision** **Processing** **Pipeline**

> 1\. Screenshot captured (PNG, configurable quality)
>
> 2\. Tesseract OCR pass → all text extracted with coordinates
>
> 3\. llama3.2-vision analysis → scene description, element
> identification, state detection 4. Diff detection — compare to
> previous screenshot, identify what changed
>
> 5\. Semantic tagging — "error dialog", "build success", "login form",
> "code editor"
>
> 6\. Route to relevant agent based on tag ("error" → Coder, "new UI
> element" → Designer) 7. Store in Screenpipe episodic log with
> timestamp<u>\[[reddit](https://www.reddit.com/r/ollama/comments/1i65qzs/built_a_local_ai_that_watches_your_screen_mic/)\]</u>

**Vision** **Intelligence** **Features**

> ● **Error** **detector** — auto-detects crash dialogs, error messages,
> red underlines in IDE ● **UI** **change** **monitor** — alerts when a
> running app's UI unexpectedly changes
>
> ● **Progress** **tracker** — reads progress bars and percentages;
> reports to Manager Agent ● **Notification** **interceptor** — reads
> system notifications, routes to relevant agent
>
> ● **Code** **reader** — can read code on screen and understand it
> without you pasting it ● **Form** **filler** — identifies form fields
> on screen; Coder Agent provides values
>
> ● **Browser** **awareness** — knows which tab is active, what URL is
> open, page title ● **Sensitive** **data** **masking** — automatically
> blurs passwords, API keys, credit card
>
> numbers in screenshots before processing

**PART** **9** **—** **INTERNET** **TOGGLE** **SYSTEM** **(Full**
**Spec)**

**Modes**

> ● 🔴 **Full** **Offline** — all agents work with local models and
> local knowledge only
>
> ● 🟡 **Supervised** **Online** — every web request shown to user
> before execution; requires approval
>
> ● 🟢 **Researcher-Only** **Online** — only Researcher Agent can access
> internet; all others offline
>
> ● 🔵 **Full** **Online** — all agents can browse; all traffic logged
> locally

**Privacy** **Controls**

> ● Domain whitelist — only pre-approved domains accessible (e.g.,
> github.com, stackoverflow.com)
>
> ● Domain blacklist — block specific sites always (e.g., social media,
> telemetry endpoints) ● Request audit log — every URL fetched, every
> search query, every byte downloaded
>
> logged
>
> ● No account logins — Zero Claw will never log into any account
> without explicit user command
>
> ● CAPTCHA detection — auto-pauses and asks user to solve
> manually<u>\[[youtube](https://www.youtube.com/watch?v=mTJO1X0fYo0)</u>\]
> ● Local proxy routing — all traffic routes through SearXNG self-hosted
> instance

**Researcher** **Agent** **Web** **Capabilities** **(Internet** **ON)**

> ● Multi-query parallel search (up to 5 searches simultaneously) ● Full
> page scraping via Playwright headless browser
>
> ● Academic paper fetching (arXiv, Semantic Scholar)
>
> ● GitHub repository analysis — reads README, issues, code structure ●
> YouTube transcript fetching (without watching video)
>
> ● RSS feed reader — monitor blogs, news sources, changelogs ● Wayback
> Machine fallback — fetch archived versions of pages ● PDF download +
> index to local knowledge base

**PART** **10** **—** **OBSERVABILITY** **DASHBOARD** **(Full**
**Spec)**

*Every* *action* *every* *agent* *takes* *is* *traced,* *measured,*
*and* *visualized*:getmaxim+1

**Live** **Metrics** **Panel**

> ● **Token** **usage** — per agent, per session, cumulative (helps
> estimate VRAM needs) ● **Task** **completion** **rate** — % tasks
> finished without human intervention
>
> ● **Agent** **response** **latency** — time from request to first
> token, time to full response ● **Memory** **recall** **accuracy** —
> how often Mem0 retrieves relevant context on first try ● **Test**
> **pass** **rate** **over** **time** — graph showing code quality trend
> across sessions
>
> ● **Error** **rate** **per** **agent** — how often each agent fails a
> task
>
> ● **Zero** **Claw** **action** **success** **rate** — % of GUI
> interactions that succeeded first try ● **RAG** **hit** **rate** — %
> of queries answered from local knowledge vs fresh generation

**Agent** **Decision**
**Trace[<u>\[arize</u>](https://arize.com/blog/best-ai-observability-tools-for-autonomous-agents-in-2026/)\]**

> ● Full execution tree for every task — see every LLM call, every tool
> invocation, every decision
>
> ● Branching visualization — see when Manager Agent considered multiple
> approaches ● Token breakdown — which step consumed the most tokens and
> why
>
> ● Retry analysis — where agents got stuck and how they recovered
>
> ● Session replay — rewind and replay any past agent session step by
> step

**Alerts** **&** **Notifications**

> ● Critical bug found by Tester → push notification with screenshot ●
> Agent stuck for more than 60s → alert user
>
> ● VRAM \> 90% → warn before OOM crash ● Mission completed → summary
> notification
>
> ● Internet accidentally toggled ON → always notify
>
> ● New model available in Ollama library → optional notification

**PART** **11** **—** **PLUGIN** **&** **MCP** **SYSTEM** **(Full**
**Spec)**

NEXUS has a fully open plugin architecture using **Model** **Context**
**Protocol** **(MCP)**:getmaxim+1

**Built-in** **MCP** **Servers** **(Installed** **by** **default)**

> **Server**
>
> nexus-fs
>
> **Capabilities**

Read/write/search any local file with metadata

> nexus-termin al
>
> nexus-git
>
> nexus-browse r
>
> nexus-screen
>
> nexus-memory
>
> nexus-calend ar
>
> nexus-sqlite
>
> nexus-image
>
> nexus-audio

Execute shell commands, capture stdout/stderr

Full git operations with AI context

Playwright headless browser for web automation

Screenshot, OCR, element detection tools

Read/write to all 5 memory layers

Read local calendar files (.ics)

Query any SQLite database in workspace

Generate images via local Stable Diffusion

Whisper transcription, Piper TTS, audio playback

**Plugin** **Marketplace** **(Local)**

> ● NEXUS Plugin Registry — community-maintained list of MCP servers ●
> Install plugins from GitHub URL with one click
>
> ● Plugin sandbox — each plugin runs in isolated process, no access to
> other plugins ● Plugin permissions system — user explicitly grants
> each plugin what it can access
>
> ● Plugin store UI inside NEXUS — browse, install, rate, review
> community
> plugins\[<u>[builder](https://www.builder.io/blog/best-mcp-servers-2026)\]</u>

**Custom** **Plugin** **Builder**

> ● Wizard to create your own MCP server in Python or Node.js ● Define
> tools: name, description, parameters, return type
>
> ● NEXUS auto-generates the boilerplate; you add the logic ● Test tool
> calls directly from NEXUS UI
>
> ● Publish to community registry with one click

**PART** **12** **—** **WORKFLOW** **AUTOMATION** **(Full** **Spec)**

**n8n**
**Integration[<u>\[testmuai</u>](https://www.testmuai.com/blog/ai-testing-tools/)\]**

> ● NEXUS embeds a local n8n instance (or connects to existing one) ●
> Any agent can trigger n8n workflows as a tool
>
> ● n8n workflows can trigger NEXUS missions via webhook
>
> ● Pre-built workflow templates: "On GitHub push → run tests → post
> result to Slack relay" ● Visual workflow editor accessible from NEXUS
> sidebar

**NEXUS** **Skills** **(Reusable** **Workflows)**

> ● Save any completed mission as a reusable **Skill**
>
> ● Skills are .nexus files — portable, shareable, version-controllable
> ● Built-in Skills Library:
>
> ○ Build & Test Loop — code → test → fix → repeat until passing
>
> ○ Research → Blog Post — topic → research → draft → SEO-optimize →
> save
>
> ○ Screenshot → Bug Report — capture screen → analyze → create ticket
>
> ○ Voice Note → Task — speak an idea → Researcher researches it → Coder
> scopes it → Manager schedules it
>
> ○ Daily Standup — every morning: summarize yesterday, plan today,
> check for blockers
>
> ○ Code Review — select files → Coder reviews → Designer checks UI →
> Tester writes tests
>
> ○ Launch Prep — Marketer writes copy + Coder finalizes + Tester does
> final QA + Designer checks
>
> ○ Dependency Audit — scan all packages → check vulnerabilities →
> suggest upgrades

**PART** **13** **—** **FULL** **UI** **SCREEN** **LIST**

> **\#** **Screen**
>
> 1 Launcher / Onboarding
>
> 2 Command Center
>
> 3 Agent Profile
>
> **Purpose**

First-run setup, model detection, workspace init

Main 3-column workspace with agent team, mission feed, context rail

Per-agent chat, history, skills, memory override, personality

config

> 4 Mission Builder
>
> 5 Screen Vision Panel
>
> 6 Tester Console
>
> 7 Zero Claw Controller
>
> 8 Memory & Knowledge
>
> 9 Code Editor
>
> 10 NEXUS Computer
>
> 11 Observability
>
> 12 Internet Control
>
> 13 Voice Control
>
> 14 Plugin Manager
>
> 15 Workflow Automation
>
> 16 Project Manager
>
> 17 Settings
>
> 18 Agent Creator

Natural language → mission brief → task graph → launch

Eye feed, vision log, annotation overlay, capture settings

Desktop control mirror, test plan, execution log, bug reports

Manual desktop automation interface, action library, safety controls

5-layer memory viewer, graph view, RAG file browser, search

Monaco editor with AI inline suggestions, terminal, file tree

Async mission queue, skill library, connector config, scheduler

Live metrics, agent traces, decision trees, session replay

Toggle, domain lists, request log, Researcher browser view

Wake word config, voice feed, TTS settings, command history

Installed plugins, marketplace, custom plugin builder

n8n embed, NEXUS Skills library, trigger editor

All projects, timelines, health scores, archive

Models, themes, shortcuts, privacy, notifications, updates

Build custom agents — role, tools, personality, model, memory

scope

**PART** **14** **—** **KEYBOARD** **SHORTCUTS** **(FULL** **MAP)**

> **Shortcut**
>
> Cmd+Space
>
> Cmd+Shift+V
>
> Cmd+Shift+Z
>
> Cmd+Shift+T
>
> Cmd+Shift+M
>
> **Action**

Open NEXUS command bar from anywhere

Instant screen analysis — take screenshot now

Zero Claw — draw region + give natural language command

Activate Tester Agent on current screen

Open Memory panel

> Cmd+Shift+I
>
> Cmd+Shift+A
>
> Cmd+Shift+P
>
> Cmd+Shift+R
>
> Ctrl+Shift+Esc (×3)
>
> Cmd+Shift+L
>
> Cmd+Shift+E
>
> Cmd+.
>
> Cmd+/

Toggle internet ON/OFF

New Mission — open Mission Builder

Pause all active agents

Resume all paused agents

Emergency stop — kill all Zero Claw activity instantly

Open Observability / live agent trace

Open Code Editor

Quick agent switch (cycle through all agents)

Toggle voice listening mode

**PART** **15** **—** **TECHNICAL** **STACK** **(COMPLETE)**

text Frontend:

AI Runtime:

Tauri (Rust backend + React/TypeScript frontend) Monaco Editor (VS
Code's editor engine)

Framer Motion (animations)

TailwindCSS + shadcn/ui (UI components)

Ollama (llama3.2, llama3.2-vision, deepseek-coder-v2) Whisper (local STT
via faster-whisper)

Piper / Kokoro (local TTS)

nomic-embed-text (local embeddings)

Agent Framework:CrewAI (multi-agent orchestration) LangGraph (stateful
agent workflows) Open Interpreter (code execution agent)

Memory: Mem0 (graph memory, long-term retention) ChromaDB (vector store
for RAG) LlamaIndex (document indexing pipeline) SQLite (episodic log
storage)

Desktop Control:PyAutoGUI (mouse/keyboard) Screenpipe (screen
recording + OCR) Playwright (browser automation) Tesseract (OCR)

> Picovoice Porcupine (wake word)

Automation:

Observability:

Internet:

n8n (local workflow automation)

MCP Protocol (plugin/tool standard)

OpenTelemetry (tracing)

AgentOps SDK (agent-specific monitoring) SQLite (metrics storage)

SearXNG (self-hosted private search)

Playwright headless (web scraping)

**PART** **16** **—** **RELEASE** **PHASES**

> **Phase**
>
> **Phase**
>
> **Alpha** **0.1**
>
> **Alpha** **0.5**
>
> **Beta** **0.8**
>
> **Beta** **0.9**
>
> **v1.0**
>
> **v1.5**
>
> **v2.0**
>
> **Deliverable** **Target**
>
> **Deliverable** **Target**

Manager + Coder + basic chat + Mem0 + Ollama Week 3

All 6 agents + Mission Builder + file RAG Week 6

Zero Claw + Tester Agent + Screen Vision + voice Week 10

NEXUS Computer (async missions) + MCP plugins + n8n Week 14

Full UI polish + Observability + Plugin Marketplace + all shortcuts Week
18

Mobile companion app (Android) + LAN multi-device sync Week 24

Custom agent builder + public Skill Store + enterprise multi-user Month
9

This is the most complete version of NEXUS that can be envisioned today,
Sid — every feature grounded in what's already buildable with tools
available right now. The architecture is designed so you can start with
Alpha 0.1 (just Coder + Manager + Ollama) and incrementally add every
layer without ever rewriting the core. 🚀playcode+3
