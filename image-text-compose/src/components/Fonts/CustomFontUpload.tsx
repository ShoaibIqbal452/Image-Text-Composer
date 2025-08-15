import React, { useRef, useState } from 'react';
import { useFontStore } from '@/store/fontSlice';
import { useToast } from '@/components/Toast/ToastContainer';
import { 
  validateFontFile, 
  createCustomFontFromFile, 
  loadCustomFont 
} from '@/utils/fontUtils';

const CustomFontUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addCustomFont, setFontLoading, updateFontLoadStatus } = useFontStore();
  const { showSuccess, showError, showWarning } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(processFile);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(processFile);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const processFile = async (file: File) => {
    try {
      setIsUploading(true);

      // Validate the font file
      const validation = validateFontFile(file);
      if (!validation.isValid) {
        showError('Invalid font file', validation.error || 'Unknown validation error');
        return;
      }

      // Create custom font object
      const customFont = await createCustomFontFromFile(file);
      
      // Check if font with same family already exists
      const { getFontByFamily } = useFontStore.getState();
      const existingFont = getFontByFamily(customFont.family);
      
      if (existingFont) {
        showWarning(
          'Font replaced',
          `A font named "${customFont.family}" already exists and has been replaced.`
        );
      }

      // Add to store (this will replace existing if same family)
      addCustomFont(customFont);
      setFontLoading(customFont.id, true);

      // Load the font
      const loadResult = await loadCustomFont(customFont);
      
      if (loadResult.success && loadResult.font) {
        updateFontLoadStatus(customFont.id, true);
        showSuccess(
          'Font uploaded successfully',
          `"${customFont.family}" is now available for use.`
        );
      } else {
        showError(
          'Failed to load font',
          loadResult.error || 'The font file could not be loaded.'
        );
        // Remove the font from store if loading failed
        const { removeCustomFont } = useFontStore.getState();
        removeCustomFont(customFont.id);
      }
    } catch (error) {
      console.error('Error processing font file:', error);
      showError(
        'Font upload failed',
        'An unexpected error occurred while uploading the font. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <div
        className={`border-2 border-dashed p-4 text-center transition-colors rounded-lg ${
          isUploading 
            ? 'border-blue-500 bg-blue-50 cursor-wait' 
            : isDragging 
            ? 'border-blue-500 bg-blue-50 cursor-pointer' 
            : 'border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={!isUploading ? handleDragOver : undefined}
        onDragLeave={!isUploading ? handleDragLeave : undefined}
        onDrop={!isUploading ? handleDrop : undefined}
        onClick={!isUploading ? handleClick : undefined}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-blue-600 font-medium text-sm">Loading font...</p>
            <p className="text-xs text-gray-500 mt-1">Please wait while we process your font</p>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium text-sm">
              Upload custom fonts
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Drag & drop or click to select TTF, OTF, WOFF files (max 5MB)
            </p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
          className="hidden"
          multiple
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default CustomFontUpload;
