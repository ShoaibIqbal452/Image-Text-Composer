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
 * Create a Fabric.js Textbox object from text layer properties
 * @param layer - Text layer properties
 * @returns Fabric.js Textbox object
 */
export const createTextObjectFromLayer = (layer: TextLayer): fabric.Textbox => {
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
    visible: true,
    selectable: !layer.locked,
    evented: !layer.locked,
  });

  // Store layer ID for tracking
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (textObj as any).layerId = layer.id;
  return textObj;
};

/**
 * Update a Fabric.js Textbox object with text layer properties
 * @param textObj - Fabric.js Textbox object to update
 * @param layer - Text layer properties
 */
export const updateTextObjectFromLayer = (textObj: fabric.Textbox, layer: TextLayer): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (textObj as any).set({
    text: layer.text,
    left: layer.left,
    top: layer.top,
    fontSize: layer.fontSize,
    fill: layer.color,
    fontFamily: layer.fontFamily,
    width: layer.width,
    opacity: layer.opacity,
    lineHeight: layer.lineHeight,
    charSpacing: layer.charSpacing,
    selectable: !layer.locked,
    evented: !layer.locked,
  });
  textObj.setCoords();
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
