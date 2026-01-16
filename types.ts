export interface Option {
  label: string;
  text: string;
}

export interface Question {
  originalNumber?: string;
  text: string;
  options: Option[];
  topic: string;
  difficulty: number;
}

export interface ExtractionResult {
  questions: Question[];
}

export type ProcessingStatus = 'idle' | 'analyzing' | 'success' | 'error';
