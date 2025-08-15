import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CanvasState } from '../types/canvas';
import { HistoryAction, HistoryState } from '../types/history';
import { useEditorStore } from './editorSlice';

interface HistoryStore extends HistoryState {
  // History actions
  pushHistory: (description: string, state: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 20;

const initialState: HistoryState = {
  past: [],
  present: null,
  future: [],
  maxHistorySize: MAX_HISTORY_SIZE,
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      ...initialState,
  
  pushHistory: (description, state) => set((historyState) => {
    const newAction: HistoryAction = {
      timestamp: Date.now(),
      description,
      state: JSON.parse(JSON.stringify(state)), // Deep clone to prevent reference issues
    };
    
    // If we have a present state, add it to the past
    const newPast = historyState.present 
      ? [...historyState.past, historyState.present].slice(-historyState.maxHistorySize + 1)
      : historyState.past;
    
    return {
      past: newPast,
      present: newAction,
      future: [], // Clear future when a new action is pushed
    };
  }),
  
  undo: () => {
    const { past, present, future } = get();
    
    if (past.length === 0 || !present) return;
    
    // Get the last action from the past
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    // Apply the previous state to the editor
    useEditorStore.getState().importState(previous.state);
    
    set({
      past: newPast,
      present: previous,
      future: [present, ...future],
    });
  },
  
  redo: () => {
    const { past, present, future } = get();
    
    if (future.length === 0) return;
    
    // Get the first action from the future
    const next = future[0];
    const newFuture = future.slice(1);
    
    // Apply the next state to the editor
    useEditorStore.getState().importState(next.state);
    
    set({
      past: present ? [...past, present] : past,
      present: next,
      future: newFuture,
    });
  },
  
  canUndo: () => get().past.length > 0,
  
  canRedo: () => get().future.length > 0,
  
  clearHistory: () => set(initialState),
    }),
    {
      name: 'image-text-composer-history',
      version: 1,
    }
  )
);
