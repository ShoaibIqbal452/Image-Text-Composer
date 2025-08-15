import React, { useEffect, useState } from 'react';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { useFontStore } from '@/store/fontSlice';

interface FontSelectorProps {
  value: string;
  onChange: (fontFamily: string) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({ value, onChange }) => {
  const { fonts, loading, error, loadFont } = useGoogleFonts();
  const { customFonts } = useFontStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFonts, setFilteredFonts] = useState<{ family: string; category: string }[]>([]);
  const [filteredCustomFonts, setFilteredCustomFonts] = useState<typeof customFonts>([]);
  
  // Default system fonts
  const systemFonts = [
    { family: 'Arial', category: 'sans-serif' },
    { family: 'Helvetica', category: 'sans-serif' },
    { family: 'Times New Roman', category: 'serif' },
    { family: 'Courier New', category: 'monospace' },
    { family: 'Georgia', category: 'serif' },
    { family: 'Verdana', category: 'sans-serif' },
  ];
  
  // Filter fonts based on search term
  useEffect(() => {
    if (loading) return;
    
    const allFonts = [...systemFonts, ...fonts];
    
    if (!searchTerm) {
      setFilteredFonts(allFonts);
      setFilteredCustomFonts(customFonts.filter(font => font.isLoaded));
      return;
    }
    
    const filtered = allFonts.filter((font) =>
      font.family.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredCustom = customFonts.filter((font) =>
      font.isLoaded && font.family.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredFonts(filtered);
    setFilteredCustomFonts(filteredCustom);
  }, [fonts, customFonts, searchTerm, loading]);
  
  // Load the currently selected font
  useEffect(() => {
    if (value && !systemFonts.some(font => font.family === value)) {
      loadFont(value);
    }
  }, [value, loadFont]);
  
  // Handle font selection
  const handleFontChange = (fontFamily: string) => {
    // Load the font if it's not a system font
    if (!systemFonts.some(font => font.family === fontFamily)) {
      loadFont(fontFamily);
    }
    
    onChange(fontFamily);
  };
  
  if (loading) {
    return <div className="p-4 text-center">Loading fonts...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading fonts. Using system fonts only.
      </div>
    );
  }
  
  return (
    <div className="font-selector">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search fonts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="relative">
        <select
          value={value}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full p-2 border rounded appearance-none"
          style={{ fontFamily: value }}
        >
          <option value="" disabled>
            Select a font
          </option>
          
          {/* System Fonts Group */}
          <optgroup label="System Fonts">
            {systemFonts.map((font) => (
              <option
                key={font.family}
                value={font.family}
                style={{ fontFamily: font.family }}
              >
                {font.family}
              </option>
            ))}
          </optgroup>
          
          {/* Custom Fonts Group */}
          {filteredCustomFonts.length > 0 && (
            <optgroup label="Custom Fonts">
              {filteredCustomFonts.map((font) => (
                <option
                  key={font.id}
                  value={font.family}
                  style={{ fontFamily: `"${font.family}", sans-serif` }}
                >
                  {font.family} ✨
                </option>
              ))}
            </optgroup>
          )}

          {/* Google Fonts Group */}
          <optgroup label="Google Fonts">
            {filteredFonts
              .filter(font => !systemFonts.some(sf => sf.family === font.family))
              .map((font) => (
                <option
                  key={font.family}
                  value={font.family}
                  style={{ fontFamily: font.family }}
                >
                  {font.family}
                </option>
              ))}
          </optgroup>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
              fillRule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
      
      {/* Font preview */}
      <div
        className="mt-2 p-3 border rounded text-center"
        style={{ fontFamily: value }}
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
  );
};

export default FontSelector;
