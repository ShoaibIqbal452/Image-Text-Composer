import React, { useState } from 'react';
import { useEditorStore } from '../../store/editorSlice';
import { exportToPng, downloadPng } from '../../utils/export';
import { useToast } from '../Toast/ToastContainer';
import type { Canvas as FabricCanvas } from 'fabric/fabric-impl';

interface ExportButtonProps {
  canvas: FabricCanvas | null;
}

const ExportButton: React.FC<ExportButtonProps> = ({ canvas }) => {
  const { backgroundImage } = useEditorStore();
  const [isExporting, setIsExporting] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();

  const handleExport = async () => {
    if (!canvas || !backgroundImage) {
      showError(
        'Cannot export',
        'Please upload a background image and add some text layers before exporting.'
      );
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Show info about the export process
      showWarning(
        'Export started',
        'Generating high-resolution PNG... This may take a moment for large images.'
      );
      
      // Export the canvas to PNG
      const dataUrl = await exportToPng(canvas, backgroundImage);
      
      // Download the PNG
      downloadPng(dataUrl, `image-text-composition-${Date.now()}.png`);
      
      showSuccess(
        'Export successful',
        'Your image has been downloaded successfully!'
      );
    } catch (error) {
      console.error('Error exporting canvas:', error);
      
      let errorMessage = 'An unexpected error occurred during export.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showError(
        'Export failed',
        errorMessage + ' Please try again or try with a smaller image.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!canvas || !backgroundImage || isExporting}
      className={`px-3 py-1 rounded flex items-center space-x-1 ${
        canvas && backgroundImage && !isExporting
          ? 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
      title="Export as PNG"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
      </svg>
      <span>{isExporting ? 'Exporting...' : 'Export PNG'}</span>
    </button>
  );
};

export default ExportButton;
