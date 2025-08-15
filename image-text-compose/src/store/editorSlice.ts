import { create } from 'zustand';
import { BackgroundImage, CanvasState, TextLayerProperties } from '../types/canvas';
import { nanoid } from 'nanoid';

interface EditorStore extends CanvasState {
  // Background image actions
  setBackgroundImage: (image: BackgroundImage) => void;
  clearBackgroundImage: () => void;
  
  // Text layer actions
  addTextLayer: (layer: Partial<TextLayerProperties>) => string;
  updateTextLayer: (id: string, properties: Partial<TextLayerProperties>) => void;
  deleteTextLayer: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  
  // Layer selection
  selectLayer: (id: string) => void;
  selectMultipleLayers: (ids: string[]) => void;
  deselectAllLayers: () => void;
  
  // Layer ordering
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  moveLayerToTop: (id: string) => void;
  moveLayerToBottom: (id: string) => void;
  
  // Canvas dimensions
  setCanvasDimensions: (width: number, height: number) => void;
  
  // Reset
  resetEditor: () => void;
  
  // Import state (for undo/redo and localStorage)
  importState: (state: CanvasState) => void;
}

const initialState: CanvasState = {
  backgroundImage: null,
  textLayers: [],
  selectedLayerIds: [],
  canvasDimensions: {
    width: 800,
    height: 600,
  },
};

export const useEditorStore = create<EditorStore>((set) => ({
  ...initialState,
  
  // Background image actions
  setBackgroundImage: (image) => set({ backgroundImage: image }),
  clearBackgroundImage: () => set({ backgroundImage: null }),
  
  // Text layer actions
  addTextLayer: (layer) => {
    const id = nanoid();
    set((state) => ({
      textLayers: [
        ...state.textLayers,
        {
          id,
          text: 'New Text',
          fontFamily: 'Arial',
          fontSize: 24,
          fontWeight: 'normal',
          color: '#000000',
          opacity: 1,
          textAlign: 'left',
          top: 100,
          left: 100,
          width: 200,
          height: 50,
          angle: 0,
          scaleX: 1,
          scaleY: 1,
          lineHeight: 1.2,
          charSpacing: 0,
          ...layer,
        },
      ],
      selectedLayerIds: [id],
    }));
    return id;
  },
  
  updateTextLayer: (id, properties) => set((state) => ({
    textLayers: state.textLayers.map((layer) =>
      layer.id === id ? { ...layer, ...properties } : layer
    ),
  })),
  
  deleteTextLayer: (id) => set((state) => ({
    textLayers: state.textLayers.filter((layer) => layer.id !== id),
    selectedLayerIds: state.selectedLayerIds.filter((layerId) => layerId !== id),
  })),
  
  toggleLayerLock: (id) => set((state) => ({
    textLayers: state.textLayers.map((layer) =>
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    ),
  })),
  
  // Layer selection
  selectLayer: (id) => set({ selectedLayerIds: [id] }),
  selectMultipleLayers: (ids) => set({ selectedLayerIds: ids }),
  deselectAllLayers: () => set({ selectedLayerIds: [] }),
  
  // Layer ordering
  moveLayerUp: (id) => set((state) => {
    const index = state.textLayers.findIndex((layer) => layer.id === id);
    if (index === -1 || index === state.textLayers.length - 1) return state;
    
    const newLayers = [...state.textLayers];
    [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
    
    return { textLayers: newLayers };
  }),
  
  moveLayerDown: (id) => set((state) => {
    const index = state.textLayers.findIndex((layer) => layer.id === id);
    if (index <= 0) return state;
    
    const newLayers = [...state.textLayers];
    [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
    
    return { textLayers: newLayers };
  }),
  
  moveLayerToTop: (id) => set((state) => {
    const index = state.textLayers.findIndex((layer) => layer.id === id);
    if (index === -1 || index === state.textLayers.length - 1) return state;
    
    const layer = state.textLayers[index];
    const newLayers = [
      ...state.textLayers.slice(0, index),
      ...state.textLayers.slice(index + 1),
      layer,
    ];
    
    return { textLayers: newLayers };
  }),
  
  moveLayerToBottom: (id) => set((state) => {
    const index = state.textLayers.findIndex((layer) => layer.id === id);
    if (index <= 0) return state;
    
    const layer = state.textLayers[index];
    const newLayers = [
      layer,
      ...state.textLayers.slice(0, index),
      ...state.textLayers.slice(index + 1),
    ];
    
    return { textLayers: newLayers };
  }),
  
  // Canvas dimensions
  setCanvasDimensions: (width, height) => set({
    canvasDimensions: { width, height },
  }),
  
  // Reset
  resetEditor: () => set(initialState),
  
  // Import state
  importState: (state) => set(state),
}));
