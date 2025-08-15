import React, { useState } from 'react';
import { useEditorStore } from '@/store/editorSlice';
import { useHistoryStore } from '@/store/historySlice';
import { TextLayerProperties, TextShadow } from '@/types/canvas';
import FontSelector from './FontSelector';
import { debounce } from 'lodash';

const TextProperties: React.FC = () => {
  const { textLayers, selectedLayerIds, updateTextLayer } = useEditorStore();
  const { pushHistory } = useHistoryStore();
  
  // State for shadow panel visibility
  const [showShadowPanel, setShowShadowPanel] = useState(false);
  
  // Create debounced version of handleChange to avoid too many history entries
  const debouncedPushHistory = debounce((message: string) => {
    pushHistory(message, useEditorStore.getState());
  }, 500);
  
  // Get the selected layer (for now, just support single selection)
  const selectedLayer = textLayers.find(layer => 
    selectedLayerIds.length > 0 && layer.id === selectedLayerIds[0]
  );
  
  if (!selectedLayer) {
    return (
      <div className="p-4 text-center text-gray-500">
        No text layer selected
      </div>
    );
  }
  
  const handleChange = (property: keyof TextLayerProperties, value: any) => {
    updateTextLayer(selectedLayer.id, { [property]: value });
    debouncedPushHistory(`Updated ${property}`);
  };
  
  // Handle shadow property changes
  const handleShadowChange = (shadowProperty: keyof TextShadow, value: any) => {
    const currentShadow = selectedLayer.shadow || {
      color: 'rgba(0,0,0,0.5)',
      blur: 5,
      offsetX: 3,
      offsetY: 3
    };
    
    const updatedShadow = {
      ...currentShadow,
      [shadowProperty]: value
    };
    
    updateTextLayer(selectedLayer.id, { shadow: updatedShadow });
    debouncedPushHistory(`Updated shadow ${shadowProperty}`);
  };
  
  // Toggle shadow on/off
  const toggleShadow = () => {
    if (selectedLayer.shadow) {
      updateTextLayer(selectedLayer.id, { shadow: null });
    } else {
      updateTextLayer(selectedLayer.id, {
        shadow: {
          color: 'rgba(0,0,0,0.5)',
          blur: 5,
          offsetX: 3,
          offsetY: 3
        }
      });
    }
    debouncedPushHistory('Toggled text shadow');
  };
  
  const fontWeightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: '100', label: 'Thin (100)' },
    { value: '200', label: 'Extra Light (200)' },
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Regular (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '800', label: 'Extra Bold (800)' },
    { value: '900', label: 'Black (900)' },
  ];
  
  const alignmentOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];
  
  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-4">Text Properties</h3>
      
      {/* Text Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Text</label>
        <textarea
          value={selectedLayer.text}
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>
      
      {/* Font Family */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Font Family</label>
        <FontSelector
          value={selectedLayer.fontFamily}
          onChange={(fontFamily) => handleChange('fontFamily', fontFamily)}
        />
      </div>
      
      {/* Font Size */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Font Size: {selectedLayer.fontSize}px
        </label>
        <input
          type="range"
          min="8"
          max="120"
          value={selectedLayer.fontSize}
          onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      {/* Font Weight */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Font Weight</label>
        <select
          value={selectedLayer.fontWeight.toString()}
          onChange={(e) => handleChange('fontWeight', e.target.value)}
          className="w-full p-2 border rounded"
        >
          {fontWeightOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Color */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Color</label>
        <div className="flex items-center">
          <input
            type="color"
            value={selectedLayer.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-10 h-10 border rounded mr-2"
          />
          <input
            type="text"
            value={selectedLayer.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="flex-1 p-2 border rounded"
          />
        </div>
      </div>
      
      {/* Opacity */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Opacity: {Math.round(selectedLayer.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={selectedLayer.opacity}
          onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
      {/* Text Alignment */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Alignment</label>
        <div className="flex border rounded overflow-hidden">
          {alignmentOptions.map((option) => (
            <button
              key={option.value}
              className={`flex-1 py-2 ${
                selectedLayer.textAlign === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white'
              }`}
              onClick={() => handleChange('textAlign', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Line Height */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Line Height: {(selectedLayer.lineHeight || 1.2).toFixed(2)}
        </label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.01"
          value={selectedLayer.lineHeight || 1.2}
          onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
      
      {/* Letter Spacing */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Letter Spacing: {selectedLayer.charSpacing || 0}px
        </label>
        <input
          type="range"
          min="-50"
          max="100"
          value={selectedLayer.charSpacing || 0}
          onChange={(e) => handleChange('charSpacing', parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      {/* Text Shadow */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!selectedLayer.shadow}
              onChange={toggleShadow}
              className="mr-2"
            />
            <span>Text Shadow</span>
          </label>
          {selectedLayer.shadow && (
            <button
              onClick={() => setShowShadowPanel(!showShadowPanel)}
              className="text-blue-500 text-sm"
            >
              {showShadowPanel ? 'Hide Settings' : 'Show Settings'}
            </button>
          )}
        </div>
        
        {selectedLayer.shadow && showShadowPanel && (
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            {/* Shadow Color */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Shadow Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedLayer.shadow.color.startsWith('rgba') ? '#000000' : selectedLayer.shadow.color}
                  onChange={(e) => handleShadowChange('color', e.target.value)}
                  className="w-10 h-10 border rounded flex-shrink-0"
                />
                <input
                  type="text"
                  value={selectedLayer.shadow.color}
                  onChange={(e) => handleShadowChange('color', e.target.value)}
                  className="min-w-0 flex-1 p-2 border rounded text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            {/* Shadow Blur */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Blur: {selectedLayer.shadow.blur}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={selectedLayer.shadow.blur}
                onChange={(e) => handleShadowChange('blur', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Shadow Offset X */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Offset X: {selectedLayer.shadow.offsetX}px
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                value={selectedLayer.shadow.offsetX}
                onChange={(e) => handleShadowChange('offsetX', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Shadow Offset Y */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Offset Y: {selectedLayer.shadow.offsetY}px
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                value={selectedLayer.shadow.offsetY}
                onChange={(e) => handleShadowChange('offsetY', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Lock Layer */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedLayer.locked || false}
            onChange={(e) => handleChange('locked', e.target.checked)}
            className="mr-2"
          />
          <span>Lock Layer</span>
        </label>
      </div>
    </div>
  );
};

export default TextProperties;
