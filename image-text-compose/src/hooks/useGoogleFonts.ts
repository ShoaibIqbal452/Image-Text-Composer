import { useState, useEffect } from 'react';
// Import dynamically to prevent SSR issues
let WebFont: any = null;
const API_KEY = process.env.GOOGLE_FONTS_API_KEY || 'AIzaSyAOES8EmKhuJEnsn9kS1XKBpxxp-TgN8Jc';

interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
}

export const useGoogleFonts = () => {
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Check if we're running in the browser
  useEffect(() => {
    setIsClient(true);
    // Dynamically import WebFont only on the client side
    import('webfontloader').then((module) => {
      WebFont = module.default;
    });
  }, []);

  // Fetch the list of available Google Fonts
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch Google Fonts');
        }
        
        const data = await response.json();
        setFonts(data.items.slice(0, 100)); // Limit to top 100 fonts for performance
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };
    
    fetchFonts();
  }, []);

  // Load a specific font
  const loadFont = (fontFamily: string) => {
    // Check if we're in the browser and WebFont is loaded
    if (!isClient || !WebFont) return;
    
    if (loadedFonts.includes(fontFamily)) {
      return; // Font already loaded
    }
    
    WebFont.load({
      google: {
        families: [`${fontFamily}:100,200,300,400,500,600,700,800,900`]
      },
      active: () => {
        setLoadedFonts((prev) => [...prev, fontFamily]);
      },
      inactive: () => {
        console.error(`Failed to load font: ${fontFamily}`);
      }
    });
  };

  // Load multiple fonts at once
  const loadFonts = (fontFamilies: string[]) => {
    // Check if we're in the browser and WebFont is loaded
    if (!isClient || !WebFont) return;
    
    const fontsToLoad = fontFamilies.filter(
      (font) => !loadedFonts.includes(font)
    );
    
    if (fontsToLoad.length === 0) {
      return; // All fonts already loaded
    }
    
    WebFont.load({
      google: {
        families: fontsToLoad.map(
          (font) => `${font}:100,200,300,400,500,600,700,800,900`
        )
      },
      active: () => {
        setLoadedFonts((prev) => [...prev, ...fontsToLoad]);
      },
      inactive: () => {
        console.error(`Failed to load some fonts`);
      }
    });
  };

  return {
    fonts,
    loading,
    error,
    loadedFonts,
    loadFont,
    loadFonts
  };
};
