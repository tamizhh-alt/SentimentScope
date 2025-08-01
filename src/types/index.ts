export interface AnalysisResult {
  id: string;
  timestamp: Date;
  type: 'text' | 'file';
  data: any;
  results: {
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: {
      joy: number;
      anger: number;
      sadness: number;
      fear: number;
      surprise: number;
      disgust: number;
    };
  };
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