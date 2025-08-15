import React from 'react';
import { useEditorStore } from '@/store/editorSlice';
import { TextLayerProperties } from '@/types/canvas';

interface LayerItemProps {
  layer: TextLayerProperties;
  isSelected: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isSelected,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
  onDuplicate,
  onToggleLock,
}) => {
  const { selectLayer, selectMultipleLayers, selectedLayerIds } = useEditorStore();
  
  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+click- Toggle this layer in the selection
      if (selectedLayerIds.includes(layer.id)) {
        // Remove from selection
        const newSelection = selectedLayerIds.filter(id => id !== layer.id);
        selectMultipleLayers(newSelection);
      } else {
        // Add to selection
        selectMultipleLayers([...selectedLayerIds, layer.id]);
      }
    } else if (e.shiftKey && selectedLayerIds.length > 0) {
      // Shift+click- Select range from last selected to this layer
      const { textLayers } = useEditorStore.getState();
      const lastSelectedId = selectedLayerIds[selectedLayerIds.length - 1];
      const lastSelectedIndex = textLayers.findIndex(l => l.id === lastSelectedId);
      const currentIndex = textLayers.findIndex(l => l.id === layer.id);
      
      const startIndex = Math.min(lastSelectedIndex, currentIndex);
      const endIndex = Math.max(lastSelectedIndex, currentIndex);
      
      const rangeIds = textLayers.slice(startIndex, endIndex + 1).map(l => l.id);
      selectMultipleLayers(rangeIds);
    } else {
      // Normal click: Select only this layer
      selectLayer(layer.id);
    }
  };
  
  const displayText = layer.text || 'Empty Text';
  const isTextTruncated = layer.text && layer.text.length > 25;
  
  return (
    <li
      className={`border-b p-3 flex items-center cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex-1 min-w-0"> {/* min-w-0 allows text truncation */}
        <div 
          className="font-medium truncate pr-2" 
          title={isTextTruncated ? layer.text : undefined}
        >
          {displayText}
        </div>
        <div className="text-xs text-gray-500 truncate pr-2">
          {layer.fontFamily}, {layer.fontSize}px
          {layer.locked && ' (Locked)'}
        </div>
      </div>
      
      <div className="flex space-x-1">
        {/* Layer ordering buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToTop();
          }}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Move to Top"
        >
          ⤒
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Move Up"
        >
          ↑
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Move Down"
        >
          ↓
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToBottom();
          }}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Move to Bottom"
        >
          ⤓
        </button>
        
        {/* Lock/Unlock button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className={`p-1 ${layer.locked ? 'text-blue-500 hover:text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          title={layer.locked ? "Unlock Layer" : "Lock Layer"}
        >
          {layer.locked ? '🔒' : '🔓'}
        </button>
        
        {/* Duplicate button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 text-gray-500 hover:text-gray-700"
          title="Duplicate"
        >
          ⎘
        </button>
        
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-red-500 hover:text-red-700"
          title="Delete"
        >
          ×
        </button>
      </div>
    </li>
  );
};

export default LayerItem;
