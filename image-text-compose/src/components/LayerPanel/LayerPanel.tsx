import React from 'react';
import { useEditorStore } from '@/store/editorSlice';
import { useHistoryStore } from '@/store/historySlice';
import LayerItem from './LayerItem';

const LayerPanel: React.FC = () => {
  const { 
    textLayers, 
    selectedLayerIds, 
    addTextLayer, 
    deleteTextLayer,
    moveLayerUp,
    moveLayerDown,
    moveLayerToTop,
    moveLayerToBottom,
    toggleLayerLock
  } = useEditorStore();
  
  const { pushHistory } = useHistoryStore();
  
  const handleAddLayer = () => {
    addTextLayer({
      text: 'New Text',
      left: 100,
      top: 100,
    });
    
    pushHistory(
      'Added text layer',
      useEditorStore.getState()
    );
  };
  
  const handleDeleteLayer = (id: string) => {
    deleteTextLayer(id);
    
    pushHistory(
      'Deleted text layer',
      useEditorStore.getState()
    );
  };
  
  const handleMoveLayer = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    switch (direction) {
      case 'up':
        moveLayerUp(id);
        break;
      case 'down':
        moveLayerDown(id);
        break;
      case 'top':
        moveLayerToTop(id);
        break;
      case 'bottom':
        moveLayerToBottom(id);
        break;
    }
    
    pushHistory(
      `Moved layer ${direction}`,
      useEditorStore.getState()
    );
  };
  
  const handleDuplicateLayer = (id: string) => {
    const layerToDuplicate = textLayers.find(layer => layer.id === id);
    if (!layerToDuplicate) return;
    
    // Create a duplicate with slightly offset position
    const { id: originalId, ...layerWithoutId } = layerToDuplicate;
    
    addTextLayer({
      ...layerWithoutId,
      left: layerToDuplicate.left + 20,
      top: layerToDuplicate.top + 20,
    });
    
    pushHistory(
      'Duplicated text layer',
      useEditorStore.getState()
    );
  };
  
  const handleToggleLock = (id: string) => {
    toggleLayerLock(id);
    
    // Get the current state of the layer to determine the action description
    const layer = useEditorStore.getState().textLayers.find(l => l.id === id);
    const actionDescription = layer?.locked ? 'Locked text layer' : 'Unlocked text layer';
    
    pushHistory(
      actionDescription,
      useEditorStore.getState()
    );
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-100 p-3 flex justify-between items-center">
        <h3 className="font-medium">Layers</h3>
        <button
          onClick={handleAddLayer}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Text
        </button>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {textLayers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No text layers yet
          </div>
        ) : (
          <ul>
            {/* Render layers in reverse order so top layers appear first */}
            {[...textLayers].reverse().map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerIds.includes(layer.id)}
                onDelete={() => handleDeleteLayer(layer.id)}
                onMoveUp={() => handleMoveLayer(layer.id, 'up')}
                onMoveDown={() => handleMoveLayer(layer.id, 'down')}
                onMoveToTop={() => handleMoveLayer(layer.id, 'top')}
                onMoveToBottom={() => handleMoveLayer(layer.id, 'bottom')}
                onDuplicate={() => handleDuplicateLayer(layer.id)}
                onToggleLock={() => handleToggleLock(layer.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LayerPanel;
