export interface AnalysisResult {
  matchScore: number;
  atsScore: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendedActions: string[];
}

export enum FileType {
  PDF = 'application/pdf',
  TEXT = 'text/plain',
  IMAGE_PNG = 'image/png',
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_WEBP = 'image/webp',
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // Base64 string
}
