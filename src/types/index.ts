export interface AnalysisResult {
  id: string;
  timestamp: string; // ISO string; parse only for display
  type: 'text' | 'file';
  text?: string;
  file?: { name: string; size: number };
  sentiment: {
    label: 'positive' | 'negative' | 'neutral';
    confidence: number; // 0..1
    scores?: Record<string, number>;
  };
  emotions: Record<string, number>; // 0..1 normalized
  keywords?: Array<{ word: string; frequency: number; relevance: number }>; 
  summary?: string | null;
  language?: {
    detected: string;
    requested?: string;
    translatedFrom?: string | null;
  } | null;
  processingTime?: number;
  // Raw server response if needed for details
  raw?: any;
}

export interface FileUploadData {
  files: File[];
  settings: {
    batchSize: number;
    includeMetadata: boolean;
    filterDuplicates: boolean;
  };
}

export interface TextInputData {
  text: string;
  language: string;
}