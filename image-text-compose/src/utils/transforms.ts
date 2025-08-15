import * as fabric from 'fabric';

/**
 * Snap value to grid
 * @param value - Value to snap
 * @param gridSize - Grid size
 * @returns Snapped value
 */
export const snapToGrid = (value: number, gridSize: number = 10): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Snap object to center of canvas
 * @param object - Fabric.js object
 * @param canvas - Fabric.js canvas
 * @param threshold - Snap threshold in pixels
 */
export const snapToCenter = (
  object: fabric.Object,
  canvas: fabric.Canvas,
  threshold: number = 10
): void => {
  const canvasCenter = {
    x: canvas.width! / 2,
    y: canvas.height! / 2,
  };
  
  const objectCenter = {
    x: object.left! + object.width! * object.scaleX! / 2,
    y: object.top! + object.height! * object.scaleY! / 2,
  };
  
  // Snap to horizontal center
  if (Math.abs(objectCenter.x - canvasCenter.x) < threshold) {
    const offsetX = canvasCenter.x - objectCenter.x;
    object.left! += offsetX;
    
    // Show center guide
    showCenterGuide(canvas, 'horizontal');
  } else {
    hideCenterGuide(canvas, 'horizontal');
  }
  
  // Snap to vertical center
  if (Math.abs(objectCenter.y - canvasCenter.y) < threshold) {
    const offsetY = canvasCenter.y - objectCenter.y;
    object.top! += offsetY;
    
    // Show center guide
    showCenterGuide(canvas, 'vertical');
  } else {
    hideCenterGuide(canvas, 'vertical');
  }
  
  object.setCoords();
};

/**
 * Show center guide line
 * @param canvas - Fabric.js canvas
 * @param orientation - Guide orientation ('horizontal' or 'vertical')
 */
export const showCenterGuide = (
  canvas: fabric.Canvas,
  orientation: 'horizontal' | 'vertical'
): void => {
  // Remove existing guide if any
  hideCenterGuide(canvas, orientation);
  
  const guideId = `center-guide-${orientation}`;
  const canvasWidth = canvas.width!;
  const canvasHeight = canvas.height!;
  
  let guide: fabric.Line;
  
  if (orientation === 'horizontal') {
    guide = new fabric.Line(
      [0, canvasHeight / 2, canvasWidth, canvasHeight / 2],
      {
        stroke: '#0d6efd',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        id: guideId,
      }
    );
  } else {
    guide = new fabric.Line(
      [canvasWidth / 2, 0, canvasWidth / 2, canvasHeight],
      {
        stroke: '#0d6efd',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        id: guideId,
      }
    );
  }
  
  // Add the guide to the canvas
  canvas.add(guide);
  
  // Instead of using bringToFront which may not be available,
  // we'll ensure the guide is on top by moving it to the end of the objects array
  try {
    // Try the standard method first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (guide as any).bringToFront === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (guide as any).bringToFront();
    } else {
      // Manual approach: move to end of objects array
      const objects = canvas.getObjects();
      const index = objects.indexOf(guide);
      
      if (index !== -1 && index < objects.length - 1) {
        // Remove and re-add to put at the end of the array
        canvas.remove(guide);
        canvas.add(guide);
      }
    }
  } catch (error) {
    console.warn('Could not bring guide to front:', error);
  }
  
  // Ensure the canvas is rendered
  canvas.renderAll();
  
  // Automatically remove guide after 1 second
  setTimeout(() => {
    hideCenterGuide(canvas, orientation);
  }, 1000);
};

/**
 * Hide center guide line
 * @param canvas - Fabric.js canvas
 * @param orientation - Guide orientation ('horizontal' or 'vertical')
 */
export const hideCenterGuide = (
  canvas: fabric.Canvas,
  orientation: 'horizontal' | 'vertical'
): void => {
  const guideId = `center-guide-${orientation}`;
  const objects = canvas.getObjects();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guide = objects.find((obj) => (obj as any).id === guideId);
  if (guide) {
    canvas.remove(guide);
  }
};

/**
 * Group objects
 * @param canvas - Fabric.js canvas
 * @param objects - Array of Fabric.js objects
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const groupObjects = (canvas: fabric.Canvas, objects: fabric.Object[]): void => {
  // Group objects logic here
};

/**
 * Calculate smart spacing between objects
 * @param objects - Array of Fabric.js objects
 * @returns Average spacing between objects
 */
export const calculateSmartSpacing = (canvas: fabric.Canvas, objects: fabric.Object[]): number => {
  if (objects.length < 2) return 0;
  
  // Sort objects by their left position
  const sortedObjects = [...objects].sort((a, b) => a.left! - b.left!);
  
  // Calculate spacing between adjacent objects
  let totalSpacing = 0;
  let spacingCount = 0;
  
  for (let i = 0; i < sortedObjects.length - 1; i++) {
    const obj1 = sortedObjects[i];
    const obj2 = sortedObjects[i + 1];
    
    const obj1Right = obj1.left! + obj1.width! * obj1.scaleX!;
    const obj2Left = obj2.left!;
    
    const spacing = obj2Left - obj1Right;
    if (spacing > 0) {
      totalSpacing += spacing;
      spacingCount++;
    }
  }
  
  return spacingCount > 0 ? totalSpacing / spacingCount : 0;
};

/**
 * Duplicate objects
 * @param canvas - Fabric.js canvas
 * @param objects - Array of Fabric.js objects
 * @returns Promise of duplicated objects
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const duplicateObjects = (canvas: fabric.Canvas, objects: fabric.Object[]): Promise<fabric.Object[]> => {
  // Duplicate objects logic here
  return Promise.resolve([]);
};

/**
 * Apply smart spacing to objects
 * @param canvas - Fabric.js canvas
 * @param selectedObjects - Array of Fabric.js objects
 * @param spacing - Spacing to apply
 */
export const applySmartSpacing = (canvas: fabric.Canvas, selectedObjects: fabric.Object[], spacing: number): void => {
  if (selectedObjects.length < 2) return;
  
  // Sort objects by their left position
  const sortedObjects = [...selectedObjects].sort((a, b) => a.left! - b.left!);
  
  // Keep the first object in place and adjust others
  let currentLeft = sortedObjects[0].left! + sortedObjects[0].width! * sortedObjects[0].scaleX!;
  
  for (let i = 1; i < sortedObjects.length; i++) {
    const obj = sortedObjects[i];
    
    // Set new left position
    obj.set('left', currentLeft + spacing);
    obj.setCoords();
    
    // Update current left for next object
    currentLeft = obj.left! + obj.width! * obj.scaleX!;
  }
  
  // Show spacing guides
  showSpacingGuides(sortedObjects, spacing, canvas);
  
  canvas.renderAll();
};

/**
 * Show spacing guides between objects
 * @param objects - Array of Fabric.js objects
 * @param spacing - Spacing between objects
 * @param canvas - Fabric.js canvas
 */
export const showSpacingGuides = (
  objects: fabric.Object[],
  spacing: number,
  canvas: fabric.Canvas
): void => {
  if (objects.length < 2) return;
  
  // Remove any existing guides
  const existingGuides = canvas.getObjects().filter((obj) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (obj as any).id?.startsWith('spacing-guide-');
  });
  
  existingGuides.forEach(guide => canvas.remove(guide));
  
  // Create new guides
  for (let i = 0; i < objects.length - 1; i++) {
    const obj1 = objects[i];
    const obj2 = objects[i + 1];
    
    const obj1Right = obj1.left! + obj1.width! * obj1.scaleX!;
    const obj2Left = obj2.left!;
    
    // Calculate center point between objects
    const centerX = obj1Right + (obj2Left - obj1Right) / 2;
    const centerY = Math.min(obj1.top!, obj2.top!) + 
      Math.abs(obj1.top! - obj2.top!) / 2;
    
    // Create spacing indicator
    const guide = new fabric.Line(
      [obj1Right, centerY, obj2Left, centerY],
      {
        stroke: '#0d6efd',
        strokeWidth: 1,
        strokeDashArray: [3, 3],
        selectable: false,
        evented: false,
        id: `spacing-guide-${i}`,
      }
    );
    
    // Add spacing value text
    const text = new fabric.Text(
      `${Math.round(spacing)}px`,
      {
        left: centerX,
        top: centerY - 15,
        fontSize: 12,
        fill: '#0d6efd',
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
        id: `spacing-guide-text-${i}`,
      }
    );
    
    canvas.add(guide, text);
  }
  
  // Automatically remove guides after 2 seconds
  setTimeout(() => {
    const guides = canvas.getObjects().filter((obj) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (obj as any).id?.startsWith('spacing-guide-');
    });
    
    guides.forEach(guide => canvas.remove(guide));
    canvas.renderAll();
  }, 2000);
};
