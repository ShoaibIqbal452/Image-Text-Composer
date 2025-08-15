import type { Canvas as FabricCanvas } from 'fabric/fabric-impl';
import { BackgroundImage } from '../types/canvas';

/**
 * Export the canvas to a PNG with the original image dimensions
 * @param canvas The Fabric.js canvas instance
 * @param backgroundImage The background image information
 * @returns A Promise that resolves with the data URL of the exported PNG
 */
export const exportToPng = (
  canvas: FabricCanvas,
  backgroundImage: BackgroundImage
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      if (!canvas) {
        throw new Error('Canvas is required for export');
      }
      
      if (!backgroundImage || !backgroundImage.dimensions) {
        throw new Error('Background image with dimensions is required for export');
      }

      // Get the original image dimensions for scaling
      const imgWidth = backgroundImage.dimensions.width;
      const imgHeight = backgroundImage.dimensions.height;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      // Validate dimensions
      if (!imgWidth || !imgHeight || imgWidth <= 0 || imgHeight <= 0) {
        throw new Error('Invalid background image dimensions');
      }
      
      if (!canvasWidth || !canvasHeight || canvasWidth <= 0 || canvasHeight <= 0) {
        throw new Error('Invalid canvas dimensions');
      }
      
      // Calculate multiplier to export at original image resolution
      const multiplier = Math.max(imgWidth / canvasWidth, imgHeight / canvasHeight);
      
      // Validate multiplier
      if (!isFinite(multiplier) || multiplier <= 0) {
        throw new Error('Invalid export multiplier calculated');
      }
      
      // Warn about very large exports
      const exportWidth = canvasWidth * multiplier;
      const exportHeight = canvasHeight * multiplier;
      const maxDimension = 8000; // Reasonable limit
      
      if (exportWidth > maxDimension || exportHeight > maxDimension) {
        console.warn(`Large export detected: ${exportWidth}x${exportHeight}. This may take a while or fail.`);
      }
      
      // Export the canvas directly at higher resolution
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: multiplier,
        left: 0,
        top: 0,
        width: canvasWidth,
        height: canvasHeight,
      });
      
      // Validate the export result
      if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
        throw new Error('Failed to generate valid PNG data URL');
      }
      

      
      resolve(dataUrl);
    } catch (error) {
      console.error('Export failed:', error);
      
      // Create a more descriptive error message
      let errorMessage = 'Failed to export image';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      reject(new Error(errorMessage));
    }
  });
};

/**
 * Trigger a download of the exported PNG
 * @param dataUrl The data URL of the PNG image
 * @param filename The filename to use for the download
 */
export const downloadPng = (dataUrl: string, filename: string = 'image-text-compose-export.png'): void => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
