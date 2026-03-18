#!/usr/bin/env bash

echo "Running PyInstaller to compile Python sidecar..."

source venv/bin/activate
pip install pyinstaller

# Tauri sidecar binaries must be named <name>-<target-triple>. 
# For MacOS Apple Silicon its typically: aarch64-apple-darwin
TARGET_TRIPLE="aarch64-apple-darwin"

pyinstaller --noconfirm \
  --onedir \
  --name nexus-python-${TARGET_TRIPLE} \
  --hidden-import "uvicorn.logging" \
  --hidden-import "uvicorn.loops" \
  --hidden-import "uvicorn.loops.auto" \
  --hidden-import "uvicorn.protocols" \
  --hidden-import "uvicorn.protocols.http" \
  --hidden-import "uvicorn.protocols.http.auto" \
  --hidden-import "uvicorn.protocols.websockets" \
  --hidden-import "uvicorn.protocols.websockets.auto" \
  --hidden-import "uvicorn.lifespan" \
  --hidden-import "uvicorn.lifespan.on" \
  --hidden-import "uvicorn.lifespan.off" \
  --hidden-import "sqlite3" \
  --hidden-import "chromadb" \
  --hidden-import "llama_index" \
  --hidden-import "chromadb.telemetry.product.posthog" \
  --hidden-import "pydantic.deprecated.decorator" \
  main.py

echo "✅ Build complete. Binary exists at dist/nexus-python-${TARGET_TRIPLE}/nexus-python-${TARGET_TRIPLE}"
echo "Once complete, you can copy the binary folder to src-tauri/bin/ to be used by the Rust backend."
