import { useEffect, useRef } from 'react';
import { CanvasState } from '../types/canvas';
import { useEditorStore } from '../store/editorSlice';
import { useLocalStorage } from './useLocalStorage';

const AUTOSAVE_KEY = 'image-text-compose-autosave';
const AUTOSAVE_INTERVAL = 2000; // 2 seconds

/**
 * A hook that automatically saves the editor state to localStorage
 * and provides functions to restore and reset the saved state
 */
export function useAutosave() {
  const editorState = useEditorStore();
  const [savedState, setSavedState] = useLocalStorage<CanvasState | null>(
    AUTOSAVE_KEY,
    null
  );
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to save the current state to localStorage
  const saveState = () => {
    const stateToSave: CanvasState = {
      backgroundImage: editorState.backgroundImage,
      textLayers: editorState.textLayers,
      selectedLayerIds: [], // Don't save selection state
      canvasDimensions: editorState.canvasDimensions,
    };
    setSavedState(stateToSave);
  };

  // Function to restore the saved state from localStorage
  const restoreState = () => {
    if (savedState) {
      editorState.importState(savedState);
      return true;
    }
    return false;
  };

  // Function to reset the editor and clear saved state
  const resetEditor = () => {
    editorState.resetEditor();
    setSavedState(null);
  };

  // Set up autosave with debouncing
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set a new timer to save state after delay
    timerRef.current = setTimeout(() => {
      saveState();
    }, AUTOSAVE_INTERVAL);

    // Cleanup timer on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [editorState.textLayers, editorState.backgroundImage, editorState.canvasDimensions]);

  // Check for saved state on initial load
  useEffect(() => {
    const hasSavedState = savedState !== null;
    return () => {
      // This is just to return the value for use in the component
    };
  }, [savedState]);

  return {
    hasSavedState: savedState !== null,
    saveState,
    restoreState,
    resetEditor,
  };
}
