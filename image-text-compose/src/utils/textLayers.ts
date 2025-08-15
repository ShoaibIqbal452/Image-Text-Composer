import { nanoid } from 'nanoid';
import { TextLayerProperties } from '@/types/canvas';
import { fabric } from 'fabric';

// Default properties for new text layers
export const DEFAULT_TEXT_PROPERTIES: TextLayerProperties = {
  id: '',
  text: 'New Text',
  fontFamily: 'Arial',
  fontSize: 24,
  fontWeight: 'normal',
  color: '#000000',
  opacity: 1,
  textAlign: 'left',
  x: 0,
  y: 0,
  width: 200,
  height: 50,
  angle: 0,
  lineHeight: 1.16,
  charSpacing: 0,
  locked: false,
};

/**
 * Create a new text layer with default properties
 * @param overrides - Optional properties to override defaults
 * @returns A new text layer object
 */
export const createTextLayer = (
  overrides: Partial<TextLayerProperties> = {}
): TextLayerProperties => {
  return {
    ...DEFAULT_TEXT_PROPERTIES,
    id: nanoid(),
    ...overrides,
  };
};

/**
 * Create a Fabric.js IText object from text layer properties
 * @param props - Text layer properties
 * @returns Fabric.js IText object
 */
export const createFabricTextFromProps = (
  props: TextLayerProperties
): fabric.IText => {
  const text = new fabric.IText(props.text, {
    left: props.x,
    top: props.y,
    width: props.width,
    fontSize: props.fontSize,
    fontFamily: props.fontFamily,
    fontWeight: props.fontWeight as any,
    fill: props.color,
    opacity: props.opacity,
    textAlign: props.textAlign as any,
    angle: props.angle,
    lineHeight: props.lineHeight,
    charSpacing: props.charSpacing,
    lockMovementX: props.locked,
    lockMovementY: props.locked,
    lockRotation: props.locked,
    lockScalingX: props.locked,
    lockScalingY: props.locked,
    selectable: !props.locked,
    editable: !props.locked,
  });

  // Store the layer ID in the fabric object for reference
  text.data = { id: props.id };

  return text;
};

/**
 * Update a Fabric.js IText object with text layer properties
 * @param fabricText - Fabric.js IText object to update
 * @param props - Text layer properties
 */
export const updateFabricTextFromProps = (
  fabricText: fabric.IText,
  props: Partial<TextLayerProperties>
): void => {
  if (props.text !== undefined) {
    fabricText.set('text', props.text);
  }
  
  if (props.x !== undefined) {
    fabricText.set('left', props.x);
  }
  
  if (props.y !== undefined) {
    fabricText.set('top', props.y);
  }
  
  if (props.width !== undefined) {
    fabricText.set('width', props.width);
  }
  
  if (props.fontSize !== undefined) {
    fabricText.set('fontSize', props.fontSize);
  }
  
  if (props.fontFamily !== undefined) {
    fabricText.set('fontFamily', props.fontFamily);
  }
  
  if (props.fontWeight !== undefined) {
    fabricText.set('fontWeight', props.fontWeight as any);
  }
  
  if (props.color !== undefined) {
    fabricText.set('fill', props.color);
  }
  
  if (props.opacity !== undefined) {
    fabricText.set('opacity', props.opacity);
  }
  
  if (props.textAlign !== undefined) {
    fabricText.set('textAlign', props.textAlign as any);
  }
  
  if (props.angle !== undefined) {
    fabricText.set('angle', props.angle);
  }
  
  if (props.lineHeight !== undefined) {
    fabricText.set('lineHeight', props.lineHeight);
  }
  
  if (props.charSpacing !== undefined) {
    fabricText.set('charSpacing', props.charSpacing);
  }
  
  if (props.locked !== undefined) {
    fabricText.set({
      lockMovementX: props.locked,
      lockMovementY: props.locked,
      lockRotation: props.locked,
      lockScalingX: props.locked,
      lockScalingY: props.locked,
      selectable: !props.locked,
      editable: !props.locked,
    });
  }
  
  fabricText.setCoords();
};

/**
 * Extract text layer properties from a Fabric.js IText object
 * @param fabricText - Fabric.js IText object
 * @param id - Optional layer ID (uses fabricText.data.id if not provided)
 * @returns Text layer properties
 */
export const extractPropsFromFabricText = (
  fabricText: fabric.IText,
  id?: string
): TextLayerProperties => {
  return {
    id: id || (fabricText.data?.id as string) || nanoid(),
    text: fabricText.text || '',
    fontFamily: fabricText.fontFamily || DEFAULT_TEXT_PROPERTIES.fontFamily,
    fontSize: fabricText.fontSize || DEFAULT_TEXT_PROPERTIES.fontSize,
    fontWeight: (fabricText.fontWeight as string) || DEFAULT_TEXT_PROPERTIES.fontWeight,
    color: fabricText.fill as string || DEFAULT_TEXT_PROPERTIES.color,
    opacity: fabricText.opacity || DEFAULT_TEXT_PROPERTIES.opacity,
    textAlign: (fabricText.textAlign as 'left' | 'center' | 'right') || DEFAULT_TEXT_PROPERTIES.textAlign,
    x: fabricText.left || 0,
    y: fabricText.top || 0,
    width: fabricText.width || DEFAULT_TEXT_PROPERTIES.width,
    height: fabricText.height || DEFAULT_TEXT_PROPERTIES.height,
    angle: fabricText.angle || 0,
    lineHeight: fabricText.lineHeight || DEFAULT_TEXT_PROPERTIES.lineHeight,
    charSpacing: fabricText.charSpacing || DEFAULT_TEXT_PROPERTIES.charSpacing,
    locked: fabricText.lockMovementX || false,
  };
};
