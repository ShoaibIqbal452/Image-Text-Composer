export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface BackgroundImage {
  url: string;
  file: File | null;
  dimensions: ImageDimensions;
}

export interface TextLayerProperties {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  color: string;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
  top: number;
  left: number;
  width: number;
  height: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  lineHeight?: number;
  charSpacing?: number;
  shadow?: TextShadow | null;
  locked?: boolean;
}

export interface TextShadow {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface CanvasState {
  backgroundImage: BackgroundImage | null;
  textLayers: TextLayerProperties[];
  selectedLayerIds: string[];
  canvasDimensions: {
    width: number;
    height: number;
  };
}
