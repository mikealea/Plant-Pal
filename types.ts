
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent: string;
  };
}

export interface PlantAnalysisResult {
  text: string;
  groundingMetadata?: GroundingMetadata;
  videoUri?: string; // Added for Veo results
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AnalysisError {
  message: string;
}

export type ScanMode = 'identify' | 'diagnose' | 'animate';

export type UserRole = 'user' | 'admin';

export type SubscriptionPlan = 'free' | 'monthly' | 'lifetime';

export interface User {
  id: string; // Added ID for reliable updates
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string; // For mock auth
  joinedDate?: string;
  plan: SubscriptionPlan;
  scansRemaining: number; // For free tier (-1 for unlimited)
}

export type ViewMode = 'scanner' | 'admin_dashboard';
