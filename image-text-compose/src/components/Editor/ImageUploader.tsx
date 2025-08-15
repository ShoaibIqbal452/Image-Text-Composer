import React, { useRef, useState } from 'react';
import { useEditorStore } from '@/store/editorSlice';
import { useHistoryStore } from '@/store/historySlice';
import { BackgroundImage, ImageDimensions } from '@/types/canvas';
import { useToast } from '@/components/Toast/ToastContainer';

const ImageUploader: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { setBackgroundImage, setCanvasDimensions } = useEditorStore();
  const { pushHistory } = useHistoryStore();
  const { showSuccess, showError, showWarning } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
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
      processFile(files[0]);
    }
  };
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const processFile = async (file: File) => {
    try {
      setIsUploading(true);

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showError(
          'Invalid file type',
          'Please upload a PNG, JPEG, or WebP image file.'
        );
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        showError(
          'File too large',
          'Please upload an image smaller than 10MB.'
        );
        return;
      }

      // Create FileReader with error handling
      const reader = new FileReader();
      
      reader.onerror = () => {
        showError(
          'Failed to read file',
          'There was an error reading the uploaded file. Please try again.'
        );
        setIsUploading(false);
      };
      
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          if (!result) {
            throw new Error('Failed to read file data');
          }

          const img = new Image();
          
          img.onerror = () => {
            showError(
              'Invalid image file',
              'The uploaded file appears to be corrupted or is not a valid image.'
            );
            setIsUploading(false);
          };
          
          img.onload = () => {
            try {
              // Validate image dimensions
              if (img.width < 50 || img.height < 50) {
                showWarning(
                  'Image too small',
                  'For best results, use images at least 50x50 pixels.'
                );
              }

              if (img.width > 4000 || img.height > 4000) {
                showWarning(
                  'Large image detected',
                  'Very large images may affect performance. Consider resizing for better experience.'
                );
              }

              const dimensions: ImageDimensions = {
                width: img.width,
                height: img.height,
                aspectRatio: img.width / img.height,
              };
              
              const backgroundImage: BackgroundImage = {
                url: img.src,
                file,
                dimensions,
              };
              
              // Update canvas dimensions to match image
              setCanvasDimensions(img.width, img.height);
              
              // Set background image
              setBackgroundImage(backgroundImage);
              
              // Push to history
              pushHistory(
                'Uploaded background image',
                useEditorStore.getState()
              );

              showSuccess(
                'Image uploaded successfully',
                `${file.name} (${img.width}x${img.height})`
              );
              
              setIsUploading(false);
            } catch (error) {
              console.error('Error processing image:', error);
              showError(
                'Failed to process image',
                'There was an error processing the uploaded image. Please try again.'
              );
              setIsUploading(false);
            }
          };
          
          img.src = result;
        } catch (error) {
          console.error('Error in FileReader onload:', error);
          showError(
            'Failed to load image',
            'There was an error loading the uploaded image. Please try again.'
          );
          setIsUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in processFile:', error);
      showError(
        'Upload failed',
        'An unexpected error occurred while uploading the image. Please try again.'
      );
      setIsUploading(false);
    }
  };
  
  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed p-8 text-center transition-colors ${
          isUploading 
            ? 'border-blue-500 bg-blue-50 cursor-wait' 
            : isDragging 
            ? 'border-blue-500 bg-blue-50 cursor-pointer' 
            : 'border-gray-300 cursor-pointer hover:border-gray-400'
        }`}
        onDragOver={!isUploading ? handleDragOver : undefined}
        onDragLeave={!isUploading ? handleDragLeave : undefined}
        onDrop={!isUploading ? handleDrop : undefined}
        onClick={!isUploading ? handleClick : undefined}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-blue-600 font-medium">Uploading image...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we process your image</p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports PNG files (max 10MB)
            </p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png"
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

export default ImageUploader;
