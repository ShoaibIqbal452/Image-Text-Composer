import { CustomFont, FontLoadResult } from '@/types/fonts';

/**
 * Validate if a file is a supported font format
 */
export const validateFontFile = (file: File): { isValid: boolean; error?: string } => {
  const validTypes = [
    'font/ttf',
    'font/truetype',
    'font/otf',
    'font/opentype',
    'font/woff',
    'font/woff2',
    'application/font-woff',
    'application/font-woff2',
    'application/x-font-ttf',
    'application/x-font-truetype',
    'application/x-font-opentype',
  ];

  const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
  
  // Check MIME type
  const hasValidMimeType = validTypes.includes(file.type);
  
  // Check file extension as fallback
  const hasValidExtension = validExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );

  if (!hasValidMimeType && !hasValidExtension) {
    return {
      isValid: false,
      error: 'Invalid font format. Please upload TTF, OTF, WOFF, or WOFF2 files.'
    };
  }

  // Check file size (max 5MB for fonts)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Font file is too large. Please use fonts smaller than 5MB.'
    };
  }

  return { isValid: true };
};

/**
 * Determine font format from file
 */
export const getFontFormat = (file: File): CustomFont['format'] => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.woff2')) return 'woff2';
  if (fileName.endsWith('.woff')) return 'woff';
  if (fileName.endsWith('.otf')) return 'opentype';
  if (fileName.endsWith('.ttf')) return 'truetype';
  
  // Fallback based on MIME type
  if (file.type.includes('woff2')) return 'woff2';
  if (file.type.includes('woff')) return 'woff';
  if (file.type.includes('opentype') || file.type.includes('otf')) return 'opentype';
  
  return 'truetype'; // Default fallback
};

/**
 * Extract font family name from filename
 */
export const extractFontFamilyName = (fileName: string): string => {
  // Remove extension
  const nameWithoutExt = fileName.replace(/\.(ttf|otf|woff2?|eot)$/i, '');
  
  // Replace common separators with spaces and clean up
  const cleaned = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Handle camelCase
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Load a custom font into the browser
 */
export const loadCustomFont = async (font: CustomFont): Promise<FontLoadResult> => {
  try {
    // Create CSS font-face rule
    const fontFace = new FontFace(font.family, `url(${font.url})`, {
      style: 'normal',
      weight: 'normal',
    });

    // Load the font
    const loadedFont = await fontFace.load();
    
    // Add to document fonts
    document.fonts.add(loadedFont);
    
    // Also add CSS style for broader compatibility
    const styleId = `custom-font-${font.id}`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      @font-face {
        font-family: '${font.family}';
        src: url('${font.url}') format('${font.format}');
        font-style: normal;
        font-weight: normal;
        font-display: swap;
      }
    `;


    
    return {
      success: true,
      font: { ...font, isLoaded: true }
    };
  } catch (error) {
    console.error('Failed to load custom font:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load font'
    };
  }
};

/**
 * Create a custom font object from a file
 */
export const createCustomFontFromFile = async (file: File): Promise<CustomFont> => {
  const url = URL.createObjectURL(file);
  const format = getFontFormat(file);
  const name = extractFontFamilyName(file.name);
  
  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    family: name,
    file,
    url,
    format,
    uploadedAt: Date.now(),
    isLoaded: false,
  };
};

/**
 * Check if a font family is available in the browser
 */
export const isFontAvailable = (fontFamily: string): boolean => {
  // Create a test element
  const testElement = document.createElement('div');
  testElement.style.fontFamily = fontFamily;
  testElement.style.fontSize = '16px';
  testElement.textContent = 'Test';
  testElement.style.position = 'absolute';
  testElement.style.visibility = 'hidden';
  testElement.style.whiteSpace = 'nowrap';
  
  document.body.appendChild(testElement);
  
  // Measure with fallback font
  testElement.style.fontFamily = 'monospace';
  const fallbackWidth = testElement.offsetWidth;
  
  // Measure with target font
  testElement.style.fontFamily = `"${fontFamily}", monospace`;
  const targetWidth = testElement.offsetWidth;
  
  document.body.removeChild(testElement);
  
  // If widths are different, the font is available
  return targetWidth !== fallbackWidth;
};
