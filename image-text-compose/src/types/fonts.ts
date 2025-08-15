export interface CustomFont {
  id: string;
  name: string;
  family: string;
  file: File;
  url: string;
  format: 'truetype' | 'opentype' | 'woff' | 'woff2';
  uploadedAt: number;
  isLoaded: boolean;
}

export interface FontLoadResult {
  success: boolean;
  font?: CustomFont;
  error?: string;
}

export type FontSource = 'google' | 'custom';

export interface FontOption {
  family: string;
  source: FontSource;
  variants?: string[];
  customFont?: CustomFont;
}
