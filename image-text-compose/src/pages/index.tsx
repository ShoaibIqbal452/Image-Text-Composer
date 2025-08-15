import { useState, useEffect, useRef } from 'react';
import { Geist, Geist_Mono } from "next/font/google";
import Canvas from '../components/Canvas/Canvas';
import { useEditorStore } from '../store/editorSlice';
import { useHistoryStore } from '../store/historySlice';
import TextProperties from '@/components/TextControls/TextProperties';
import LayerPanel from '@/components/LayerPanel/LayerPanel';
import ImageUploader from '../components/Editor/ImageUploader';
import HistoryPanel from '@/components/History/HistoryPanel';
import { useAutosave } from '../hooks/useAutosave';
import ExportButton from '@/components/Editor/ExportButton';
import FontManagementPanel from '@/components/Fonts/FontManagementPanel';
import type { Canvas as FabricCanvas } from 'fabric/fabric-impl';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { backgroundImage, selectedLayerIds, updateTextLayer, textLayers } = useEditorStore();
  const { canUndo, canRedo, undo, redo, pushHistory } = useHistoryStore();
  const [showHistory, setShowHistory] = useState(false);
  const { hasSavedState, restoreState, resetEditor } = useAutosave();
  const canvasRef = useRef<FabricCanvas | null>(null);
  
  // Restore saved state on initial load
  useEffect(() => {
    if (hasSavedState) {
      restoreState();
    }
  }, []);
  
  // Check if we have a selected layer
  const hasSelectedLayer = selectedLayerIds.length > 0;
  
  // Smart spacing function
  const applySmartSpacing = () => {
    if (selectedLayerIds.length < 2) return;
    
    const selectedLayers = textLayers.filter(layer => selectedLayerIds.includes(layer.id));
    selectedLayers.sort((a, b) => a.left - b.left); // Sort by horizontal position
    
    if (selectedLayers.length < 2) return;
    

    
    // Use a minimum spacing of 100px to ensure reasonable distribution
    const leftmostPos = selectedLayers[0].left;
    const rightmostPos = selectedLayers[selectedLayers.length - 1].left;
    const currentSpread = rightmostPos - leftmostPos;
    
    // Use at least 100px total spread, or current spread if larger
    const minSpread = Math.max(100, currentSpread);
    const spacing = minSpread / (selectedLayers.length - 1);
    

    
    selectedLayers.forEach((layer, index) => {
      const newLeft = leftmostPos + (spacing * index);

      updateTextLayer(layer.id, { left: newLeft });
    });
    
    // Add a small delay before pushing history to allow Canvas sync to complete
    setTimeout(() => {
      pushHistory('Applied smart spacing', useEditorStore.getState());

    }, 100);
  };
  
  // Nudging function
  const nudgeSelectedLayers = (direction: string, distance: number) => {

    
    selectedLayerIds.forEach(layerId => {
      const layer = textLayers.find(l => l.id === layerId);
      if (!layer) {

        return;
      }
      
      let newLeft = layer.left;
      let newTop = layer.top;
      
      switch (direction) {
        case 'ArrowLeft':
          newLeft -= distance;
          break;
        case 'ArrowRight':
          newLeft += distance;
          break;
        case 'ArrowUp':
          newTop -= distance;
          break;
        case 'ArrowDown':
          newTop += distance;
          break;
      }
      
      // Safeguard: Ensure reasonable movement (prevent dramatic jumps)
      const deltaX = Math.abs(newLeft - layer.left);
      const deltaY = Math.abs(newTop - layer.top);
      
      if (deltaX > distance * 2 || deltaY > distance * 2) {

        // Reset to expected movement
        newLeft = layer.left + (direction === 'ArrowLeft' ? -distance : direction === 'ArrowRight' ? distance : 0);
        newTop = layer.top + (direction === 'ArrowUp' ? -distance : direction === 'ArrowDown' ? distance : 0);
      }
      
      updateTextLayer(layerId, { left: newLeft, top: newTop });
    });
    
    pushHistory(`Nudged ${selectedLayerIds.length} layer(s)`, useEditorStore.getState());
  };
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) undo();
      }
      
      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y or Cmd+Y
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        if (canRedo()) redo();
      }
      
      // Toggle history panel: Ctrl+H or Cmd+H
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHistory(prev => !prev);
      }
      
      // Smart spacing: Ctrl+Shift+S or Cmd+Shift+S (S for Spacing)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's' && selectedLayerIds.length > 1) {
        e.preventDefault();

        applySmartSpacing();
      }
      
      // Nudging with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedLayerIds.length > 0) {

        // Only if not typing in an input field
        if (e.target instanceof HTMLElement && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
          e.preventDefault();

          const distance = e.shiftKey ? 10 : 1; // Shift for larger steps
          nudgeSelectedLayers(e.key, distance);
        } else {

        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);
  
  return (
    <div className={`${geistSans.className} ${geistMono.className} font-sans min-h-screen bg-gray-50`}>
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Image Text Composer</h1>
        <div className="flex space-x-2">
          <ExportButton canvas={canvasRef.current} />
          {selectedLayerIds.length > 1 && (
            <button 
              onClick={applySmartSpacing}
              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded flex items-center space-x-1"
              title="Smart Spacing (Cmd+Shift+S)"
            >
              <span>📐</span>
              <span>Space</span>
            </button>
          )}
          {selectedLayerIds.length > 0 && (
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => nudgeSelectedLayers('ArrowUp', 5)}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                title="Nudge Up"
              >
                ↑
              </button>
              <button 
                onClick={() => nudgeSelectedLayers('ArrowDown', 5)}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                title="Nudge Down"
              >
                ↓
              </button>
              <button 
                onClick={() => nudgeSelectedLayers('ArrowLeft', 5)}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                title="Nudge Left"
              >
                ←
              </button>
              <button 
                onClick={() => nudgeSelectedLayers('ArrowRight', 5)}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                title="Nudge Right"
              >
                →
              </button>
            </div>
          )}
          <button 
            onClick={resetEditor}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center space-x-1"
            title="Reset Editor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
            <span>Reset</span>
          </button>
          <button 
            onClick={() => setShowHistory(prev => !prev)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center space-x-1"
            title="Toggle History Panel (Ctrl+H)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
            </svg>
            <span>History</span>
          </button>
          <button 
            onClick={undo}
            disabled={!canUndo()}
            className={`px-3 py-1 rounded flex items-center ${canUndo() ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
            title="Undo (Ctrl+Z)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
            </svg>
          </button>
          <button 
            onClick={redo}
            disabled={!canRedo()}
            className={`px-3 py-1 rounded flex items-center ${canRedo() ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
            title="Redo (Ctrl+Shift+Z)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966a.25.25 0 0 1 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        {/* Left sidebar - Layer panel and Font management */}
        <div className="w-full md:w-64 bg-white shadow-sm p-4 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-4">Layers</h2>
            {backgroundImage ? (
              <LayerPanel />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Upload an image to get started
              </div>
            )}
          </div>
          
          <FontManagementPanel />
        </div>
        
        {/* Main canvas area */}
        <div className="flex-grow flex flex-col">
          <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
            <Canvas canvasRef={canvasRef} />
            {!backgroundImage && (
              <div className="absolute max-w-md w-full">
                <ImageUploader />
              </div>
            )}
          </div>
        </div>
        
        {/* Right sidebar - Properties and History */}
        <div className="w-full md:w-72 bg-white shadow-sm p-4 overflow-y-auto flex flex-col">
          {/* Text properties */}
          {hasSelectedLayer && !showHistory && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Text Properties</h2>
              <TextProperties />
            </div>
          )}
          
          {/* History panel (conditionally shown) */}
          {showHistory && (
            <div className="flex-1">
              <h2 className="text-lg font-medium mb-4">History</h2>
              <HistoryPanel />
            </div>
          )}
          
          {/* Show both when History is open but also show Text Properties in compact form */}
          {showHistory && hasSelectedLayer && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-md font-medium mb-2">Text Properties</h3>
              <div className="max-h-48 overflow-y-auto">
                <TextProperties />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
