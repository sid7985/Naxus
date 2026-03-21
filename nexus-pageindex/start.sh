#!/bin/bash
set -e

cd "$(dirname "$0")"

# Ensure venv exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Running setup.sh..."
    ./setup.sh
fi

echo "Starting NEXUS PageIndex Backend..."
source venv/bin/activate

# Use local Ollama instance for the vision/reasoning models
export OPENAI_API_BASE=${OLLAMA_BASE_URL:-"http://127.0.0.1:11434/v1"}
export OPENAI_API_KEY="ollama"
export OPENAI_MODEL_NAME=${OPENAI_MODEL_NAME:-"llama3"} 

# Start FastAPI using uvicorn
python main.py
