import React from 'react';
import { useFontStore } from '@/store/fontSlice';
import { useToast } from '@/components/Toast/ToastContainer';

const CustomFontList: React.FC = () => {
  const { customFonts, removeCustomFont, clearAllCustomFonts, loadingFonts } = useFontStore();
  const { showSuccess, showWarning } = useToast();

  const handleRemoveFont = (fontId: string, fontFamily: string) => {
    removeCustomFont(fontId);
    showSuccess('Font removed', `"${fontFamily}" has been removed from your custom fonts.`);
  };

  const handleClearAll = () => {
    if (customFonts.length === 0) return;
    
    if (window.confirm(`Are you sure you want to remove all ${customFonts.length} custom fonts?`)) {
      clearAllCustomFonts();
      showWarning('All fonts cleared', 'All custom fonts have been removed.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatUploadDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (customFonts.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No custom fonts uploaded yet</p>
        <p className="text-xs text-gray-400 mt-1">Upload TTF, OTF, or WOFF files to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Custom Fonts ({customFonts.length})
        </h4>
        {customFonts.length > 1 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
            title="Remove all custom fonts"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {customFonts.map((font) => {
          const isLoading = loadingFonts.has(font.id);
          
          return (
            <div
              key={font.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p 
                    className="text-sm font-medium text-gray-900 truncate"
                    style={{ fontFamily: font.isLoaded ? `"${font.family}", sans-serif` : 'inherit' }}
                    title={font.family}
                  >
                    {font.family}
                  </p>
                  
                  {isLoading && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                  )}
                  
                  {font.isLoaded && !isLoading && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Loaded
                    </span>
                  )}
                  
                  {!font.isLoaded && !isLoading && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Failed
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-xs text-gray-500">
                    {font.format.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(font.file?.size || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatUploadDate(font.uploadedAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRemoveFont(font.id, font.family)}
                className="ml-3 text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                title="Remove font"
                disabled={isLoading}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomFontList;
