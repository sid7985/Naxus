// ===== NEXUS Agent Tools Definition =====
// JSON Schema definitions for tools available to NEXUS agents

export const CODER_TOOLS = [
  // --- File Operations ---
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the contents of a file at the given absolute or relative path.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The path to the file to read' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write content to a file, creating it and parent directories if they do not exist. OVERWRITES existing content.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The path to write to' },
          content: { type: 'string', description: 'The complete file content to write' }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_file',
      description: 'Delete a file at the given literal path. DESTRUCTIVE ACTION.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The path of the file to delete' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_directory',
      description: 'List the contents of a directory.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The directory path to list' },
          max_depth: { type: 'number', description: 'Maximum depth to traverse (default 1)' }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_files',
      description: 'Search for a string across all text files in a directory tree.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The text string to search for natively' },
          path: { type: 'string', description: 'The root directory to search in' }
        },
        required: ['query', 'path']
      }
    }
  },
  // --- Terminal / System ---
  {
    type: 'function',
    function: {
      name: 'execute_command',
      description: 'Execute a shell command in the terminal. Returns stdout, stderr, and exit code.',
      parameters: {
        type: 'object',
        properties: {
          cmd: { type: 'string', description: 'The shell command to execute' },
          cwd: { type: 'string', description: 'Optional working directory to run the command in' }
        },
        required: ['cmd']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_system_info',
      description: 'Get information about the current OS, architecture, and system resources.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  // --- Git Operations ---
  {
    type: 'function',
    function: {
      name: 'git_status',
      description: 'Get the current git status of a repository (branch, staged, modified, untracked).',
      parameters: {
        type: 'object',
        properties: {
          repo_path: { type: 'string', description: 'The path to the git repository' }
        },
        required: ['repo_path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'git_commit',
      description: 'Stage all changes and create a new git commit.',
      parameters: {
        type: 'object',
        properties: {
          repo_path: { type: 'string', description: 'The path to the git repository' },
          message: { type: 'string', description: 'The commit message' }
        },
        required: ['repo_path', 'message']
      }
    }
  }
];

export const RESEARCHER_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'web_search_proxy',
      description: 'Search the internet via a proxy. Provide a specific search query. Works for duckduckgo or searxng endpoints.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_scrape_playwright',
      description: 'Navigate to a URL and extract its full content as clean Markdown using a headless browser.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The absolute URL to scrape.' },
        },
        required: ['url'],
      },
    },
  }
];

export const DESIGNER_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_theme_tokens',
      description: 'Get the current design system CSS tokens.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
];
