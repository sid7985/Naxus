import { useCallback, useEffect, useRef, useState } from 'react';
import { startGameLoop } from '../engine/gameLoop.js';
import { OfficeState } from '../engine/officeState.js';
import { renderFrame } from '../engine/renderer.js';
import { setFloorSprites } from '../floorTiles.js';
import { buildDynamicCatalog } from '../layout/furnitureCatalog.js';
import { setCharacterTemplates } from '../sprites/spriteData.js';
import { setWallSprites } from '../wallTiles.js';
import { useRpgStore } from '../../../stores/rpgStore.js';
import { migrateLayoutColors } from '../layout/layoutSerializer.js';

interface NexusAgentOSProps {
  isFocused?: boolean;
}

export function NexusAgentOS({  }: NexusAgentOSProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const osRef = useRef<OfficeState>(new OfficeState());
  const panRef = useRef({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Sync Redux/Zustand agents into Canvas
  const rpgAgents = useRpgStore((state) => state.agents);

  
  // Load assets
  useEffect(() => {
    async function loadAssets() {
      try {
        const [chars, floors, walls, furnCatalog, furnSprites, layoutJson] = await Promise.all([
          fetch('/pixel-office-assets/decoded/characters.json').then(r => r.json()),
          fetch('/pixel-office-assets/decoded/floors.json').then(r => r.json()),
          fetch('/pixel-office-assets/decoded/walls.json').then(r => r.json()),
          fetch('/pixel-office-assets/furniture-catalog.json').then(r => r.json()),
          fetch('/pixel-office-assets/decoded/furniture.json').then(r => r.json()),
          fetch('/pixel-office-assets/default-layout-1.json').then(r => r.json())
        ]);

        setCharacterTemplates(chars);
        setFloorSprites(floors);
        setWallSprites(walls);
        buildDynamicCatalog({ catalog: furnCatalog, sprites: furnSprites });

        osRef.current.rebuildFromLayout(migrateLayoutColors(layoutJson));
        
        setLoaded(true);
      } catch (err: any) {
        console.error('[AgentOS] ERROR LOADING ASSETS:', err);
      }
    }
    loadAssets();
  }, []);

  // Map agents
  useEffect(() => {
    if (!loaded) return;
    const os = osRef.current;
    
    // Add agents that exist in store but not in Canvas
    for (const idStr of Object.keys(rpgAgents)) {
      const id = parseInt(idStr, 10);
      if (!os.characters.has(id)) {
        // Preferred palette matches their ID offset roughly
        const palette = id % 6; 
        os.addAgent(id, palette, 0, undefined, true);
        os.setAgentActive(id, true); // Keep them active to use auto-desks and avoid immediate sleep
      }
    }
    
    // Remove characters that no longer exist in store
    const existingIds = Object.keys(rpgAgents).map(k => parseInt(k, 10));
    for (const [id, _char] of os.characters.entries()) {
      if (!existingIds.includes(id)) {
        os.removeAgent(id);
      }
    }
  }, [rpgAgents, loaded]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();
    const observer = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) observer.observe(containerRef.current);

    // Initial zoom value
    const zoom = 4; // High 4x zoom for Stardew-feel!

    const stop = startGameLoop(canvas, {
      update: (dt) => {
        osRef.current.update(dt);
      },
      render: (ctx) => {
        const os = osRef.current;
        const w = canvas.width;
        const h = canvas.height;


        renderFrame(
          ctx,
          w,
          h,
          os.tileMap,
          os.furniture,
          os.getCharacters(),
          zoom,
          panRef.current.x,
          panRef.current.y,
          // Selection Render State
          {
            selectedAgentId: os.selectedAgentId,
            hoveredAgentId: os.hoveredAgentId,
            hoveredTile: os.hoveredTile,
            seats: os.seats,
            characters: os.characters,
          },
          undefined, // no editor state
          os.getLayout().tileColors,
          os.getLayout().cols,
          os.getLayout().rows
        );
      },
    });

    return () => {
      stop();
      observer.disconnect();
    };
  }, [loaded, resizeCanvas]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0D0E15' 
      }}>
      {!loaded && (
        <span style={{ color: 'var(--text-secondary)', position: 'absolute' }}>Booting AgentOS Engine...</span>
      )}

      <canvas ref={canvasRef} style={{ display: loaded ? 'block' : 'none', imageRendering: 'pixelated' }} />
    </div>
  );
}
