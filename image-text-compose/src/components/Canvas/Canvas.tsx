import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '../../store/editorSlice';
import { useHistoryStore } from '../../store/historySlice';
import type { Canvas as FabricCanvas } from 'fabric/fabric-impl';

interface CanvasProps {
  canvasRef: React.RefObject<FabricCanvas | null>;
}

const Canvas: React.FC<CanvasProps> = ({ canvasRef }) => {
  const { canvasDimensions, backgroundImage, textLayers, selectedLayerIds, updateTextLayer } = useEditorStore();
  const { pushHistory } = useHistoryStore();
  const canvasElementRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasElementRef.current) return;

    // Create Fabric.js canvas
    const fabricCanvas = new fabric.Canvas(canvasElementRef.current, {
      width: canvasDimensions.width,
      height: canvasDimensions.height,
    });

    // Store reference
    if (canvasRef) {
      // TODO: Create proper CanvasRef interface - Fabric.js integration challenge
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (canvasRef as any).current = fabricCanvas;
    }

    // Add event listeners to sync object positions back to store
    // TODO: Create FabricObjectEvent interface for proper event typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fabricCanvas as any).on('object:moved', (e: any) => {
      const obj = e.target;
      const layerId = obj.layerId;
      if (layerId) {
        updateTextLayer(layerId, {
          left: obj.left,
          top: obj.top,
        });
        pushHistory('Moved text layer', useEditorStore.getState());

      }
    });

    // TODO: Create FabricObjectEvent interface for proper event typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fabricCanvas as any).on('object:modified', (e: any) => {
      const obj = e.target;
      const layerId = obj.layerId;
      if (layerId) {
        updateTextLayer(layerId, {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
        });
        pushHistory('Modified text layer', useEditorStore.getState());

      }
    });

    // Handle text content changes
    // TODO: Create FabricTextEvent interface for proper event typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fabricCanvas as any).on('text:changed', (e: any) => {
      const obj = e.target;
      const layerId = obj.layerId;
      if (layerId && obj.text !== undefined) {
        updateTextLayer(layerId, {
          text: obj.text,
        });

      }
    });

    // Handle text editing exit to ensure final sync
    // TODO: Create FabricTextEvent interface for proper event typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fabricCanvas as any).on('text:editing:exited', (e: any) => {
      const obj = e.target;
      const layerId = obj.layerId;
      if (layerId && obj.text !== undefined) {
        updateTextLayer(layerId, {
          text: obj.text,
        });
        pushHistory('Edited text content', useEditorStore.getState());

      }
    });

    // Load background image if exists
    if (backgroundImage) {
      fabric.Image.fromURL(backgroundImage.url, {
        crossOrigin: 'anonymous'
      }).then((img: fabric.Image) => {
        const scaleX = canvasDimensions.width / (img.width || 1);
        const scaleY = canvasDimensions.height / (img.height || 1);
        
        img.set({
          scaleX,
          scaleY,
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });

        // Clear canvas and add background image first
        fabricCanvas.clear();
        fabricCanvas.add(img);
        
        // Re-add all text layers on top of background
        textLayers.forEach(layer => {
          const textObj = new fabric.Textbox(layer.text, {
            left: layer.left,
            top: layer.top,
            fontSize: layer.fontSize || 24,
            fill: layer.color || '#000000',
            fontFamily: layer.fontFamily || 'Arial',
            width: layer.width || 200,
            opacity: layer.opacity || 1,
            visible: true,
            selectable: !layer.locked,
            evented: !layer.locked,
          });
          // TODO: Use module augmentation to extend fabric.Object with layerId property
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (textObj as any).layerId = layer.id;
          // TODO: Create typed wrapper for canvas.add method
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fabricCanvas.add(textObj as any);
        });
        
        fabricCanvas.renderAll();

      });
    }

    return () => {
      fabricCanvas.dispose();
    };
  }, [canvasDimensions, backgroundImage, canvasRef, pushHistory, textLayers, updateTextLayer]);

  // Sync text layers with Fabric.js canvas
  useEffect(() => {
    if (!canvasRef?.current) {

      return;
    }

    const fabricCanvas = canvasRef.current;

    
    // Get existing text objects
    const existingTextObjects = fabricCanvas.getObjects().filter(obj => 
      // TODO: Use module augmentation to extend fabric.Object with layerId property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      obj.type === 'textbox' && (obj as any).layerId
    );

    // Remove text objects that no longer exist in store
    existingTextObjects.forEach(obj => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layerId = (obj as any).layerId;
      if (!textLayers.find(layer => layer.id === layerId)) {
        fabricCanvas.remove(obj);
      }
    });

    // Add or update text objects for each layer
    textLayers.forEach(layer => {
      const existingObj = existingTextObjects.find(obj => 
        // TODO: Use module augmentation to extend fabric.Object with layerId property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (obj as any).layerId === layer.id
      );

      if (!existingObj) {
        // Create new text object
        const textObj = new fabric.Textbox(layer.text, {
          left: layer.left,
          top: layer.top,
          fontSize: layer.fontSize || 24,
          fill: layer.color || '#000000',
          fontFamily: layer.fontFamily || 'Arial',
          width: layer.width || 200,
          opacity: layer.opacity || 1,
          lineHeight: layer.lineHeight || 1.2,
          charSpacing: layer.charSpacing || 0,
          visible: true, // Ensure always visible
          // Lock enforcement
          selectable: !layer.locked,
          evented: !layer.locked,
        });

        // Store layer ID for tracking
        // TODO: Use module augmentation to extend fabric.Object with layerId property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (textObj as any).layerId = layer.id;
        
        // TODO: Create typed wrapper for canvas.add method
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fabricCanvas.add(textObj as any);
        fabricCanvas.renderAll(); // Force render after adding

      } else {
        // Update existing object properties (preserve position unless explicitly changed)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (existingObj as any).set({
          text: layer.text,
          fontSize: layer.fontSize || 24,
          fill: layer.color || '#000000',
          fontFamily: layer.fontFamily || 'Arial',
          opacity: layer.opacity || 1,
          lineHeight: layer.lineHeight || 1.2,
          charSpacing: layer.charSpacing || 0,
          visible: true, // Ensure always visible
          // Lock enforcement
          selectable: !layer.locked,
          evented: !layer.locked,
        });
        
        // Always update position to match store (store is the source of truth)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (existingObj as any).set({
          left: layer.left,
          top: layer.top,
        });
      }
    });

    fabricCanvas.renderAll();
  }, [textLayers, canvasRef]);

  // Sync selection between sidebar and canvas
  useEffect(() => {
    if (!canvasRef?.current) return;

    const fabricCanvas = canvasRef.current;
    
    if (selectedLayerIds.length === 0) {
      // Clear selection if no layers selected (but keep objects visible)
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();

      return;
    }

    // Find text objects that match selected layer IDs
    const objectsToSelect = fabricCanvas.getObjects().filter(obj => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const layerId = (obj as any).layerId;
      return layerId && selectedLayerIds.includes(layerId);
    });

    if (objectsToSelect.length === 1) {
      // Single selection
      // TODO: Create typed wrapper for canvas.setActiveObject method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fabricCanvas.setActiveObject(objectsToSelect[0] as any);
    } else if (objectsToSelect.length > 1) {
      // Multiple selection
      // TODO: Create proper ActiveSelection type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selection = new fabric.ActiveSelection(objectsToSelect as any, {
        // TODO: Create proper Canvas type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas: fabricCanvas as any,
      });
      // TODO: Create typed wrapper for canvas.setActiveObject method
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fabricCanvas.setActiveObject(selection as any);
    }

    fabricCanvas.renderAll();

  }, [selectedLayerIds, canvasRef]);

  return (
    <canvas
      ref={canvasElementRef}
      style={{
        border: '2px solid #000',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    />
  );
};

export default Canvas;
