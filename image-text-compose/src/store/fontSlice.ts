import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomFont } from '@/types/fonts';

interface FontState {
  customFonts: CustomFont[];
  loadingFonts: Set<string>;
  
  // Actions
  addCustomFont: (font: CustomFont) => void;
  removeCustomFont: (fontId: string) => void;
  updateFontLoadStatus: (fontId: string, isLoaded: boolean) => void;
  setFontLoading: (fontId: string, isLoading: boolean) => void;
  clearAllCustomFonts: () => void;
  getFontById: (fontId: string) => CustomFont | undefined;
  getFontByFamily: (family: string) => CustomFont | undefined;
}

export const useFontStore = create<FontState>()(
  persist(
    (set, get) => ({
      customFonts: [],
      loadingFonts: new Set(),

      addCustomFont: (font: CustomFont) => {
        set((state) => {
          // Check if font with same family already exists
          const existingIndex = state.customFonts.findIndex(
            (f) => f.family === font.family
          );
          
          if (existingIndex >= 0) {
            // Replace existing font
            const newFonts = [...state.customFonts];
            newFonts[existingIndex] = font;
            return { customFonts: newFonts };
          } else {
            // Add new font
            return { customFonts: [...state.customFonts, font] };
          }
        });
      },

      removeCustomFont: (fontId: string) => {
        set((state) => {
          const font = state.customFonts.find(f => f.id === fontId);
          if (font) {
            // Revoke the object URL to free memory
            URL.revokeObjectURL(font.url);
            
            // Remove font from CSS
            const styleId = `custom-font-${fontId}`;
            const existingStyle = document.getElementById(styleId);
            if (existingStyle) {
              existingStyle.remove();
            }
          }
          
          return {
            customFonts: state.customFonts.filter(f => f.id !== fontId),
            loadingFonts: new Set([...state.loadingFonts].filter(id => id !== fontId))
          };
        });
      },

      updateFontLoadStatus: (fontId: string, isLoaded: boolean) => {
        set((state) => ({
          customFonts: state.customFonts.map(font =>
            font.id === fontId ? { ...font, isLoaded } : font
          ),
          loadingFonts: new Set([...state.loadingFonts].filter(id => id !== fontId))
        }));
      },

      setFontLoading: (fontId: string, isLoading: boolean) => {
        set((state) => {
          const newLoadingFonts = new Set(state.loadingFonts);
          if (isLoading) {
            newLoadingFonts.add(fontId);
          } else {
            newLoadingFonts.delete(fontId);
          }
          return { loadingFonts: newLoadingFonts };
        });
      },

      clearAllCustomFonts: () => {
        const { customFonts } = get();
        
        // Revoke all object URLs
        customFonts.forEach(font => {
          URL.revokeObjectURL(font.url);
          
          // Remove font from CSS
          const styleId = `custom-font-${font.id}`;
          const existingStyle = document.getElementById(styleId);
          if (existingStyle) {
            existingStyle.remove();
          }
        });
        
        set({ customFonts: [], loadingFonts: new Set() });
      },

      getFontById: (fontId: string) => {
        return get().customFonts.find(font => font.id === fontId);
      },

      getFontByFamily: (family: string) => {
        return get().customFonts.find(font => font.family === family);
      },
    }),
    {
      name: 'custom-fonts-storage',
      // Don't persist the actual File objects or URLs, only metadata
      partialize: (state) => ({
        customFonts: state.customFonts.map(font => ({
          ...font,
          file: undefined,
          url: '',
          isLoaded: false,
        })),
      }),
    }
  )
);
