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
      (canvasRef as any).current = fabricCanvas;
    }

    // Add event listeners to sync object positions back to store
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
          (textObj as any).layerId = layer.id;
          fabricCanvas.add(textObj as any);
        });
        
        fabricCanvas.renderAll();

      });
    }

    return () => {
      fabricCanvas.dispose();
    };
  }, [canvasDimensions, backgroundImage]);

  // Sync text layers with Fabric.js canvas
  useEffect(() => {
    if (!canvasRef?.current) {

      return;
    }

    const fabricCanvas = canvasRef.current;

    
    // Get existing text objects
    const existingTextObjects = fabricCanvas.getObjects().filter(obj => 
      obj.type === 'textbox' && (obj as any).layerId
    );

    // Remove text objects that no longer exist in store
    existingTextObjects.forEach(obj => {
      const layerId = (obj as any).layerId;
      if (!textLayers.find(layer => layer.id === layerId)) {
        fabricCanvas.remove(obj);
      }
    });

    // Add or update text objects for each layer
    textLayers.forEach(layer => {
      const existingObj = existingTextObjects.find(obj => 
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
        (textObj as any).layerId = layer.id;
        
        fabricCanvas.add(textObj as any);
        fabricCanvas.renderAll(); // Force render after adding

      } else {
        // Update existing object properties (preserve position unless explicitly changed)
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
        const oldLeft = existingObj.left || 0;
        const oldTop = existingObj.top || 0;
        
        (existingObj as any).set({
          left: layer.left,
          top: layer.top,
        });
        
        // Verify the position was actually set
        const newLeft = existingObj.left || 0;
        const newTop = existingObj.top || 0;
        

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
      const layerId = (obj as any).layerId;
      return layerId && selectedLayerIds.includes(layerId);
    });

    if (objectsToSelect.length === 1) {
      // Single selection
      fabricCanvas.setActiveObject(objectsToSelect[0] as any);
    } else if (objectsToSelect.length > 1) {
      // Multiple selection
      const selection = new fabric.ActiveSelection(objectsToSelect as any, {
        canvas: fabricCanvas as any,
      });
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
