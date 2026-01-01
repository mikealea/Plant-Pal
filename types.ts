
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
  commonName?: string;
  scientificName?: string;
  groundingMetadata?: GroundingMetadata;
  videoUri?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
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
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  password?: string;
  joinedDate?: string;
  plan: SubscriptionPlan;
  scansRemaining: number;
}

export type ViewMode = 'scanner' | 'admin_dashboard';
