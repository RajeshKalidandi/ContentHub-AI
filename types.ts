export enum Platform {
  LinkedIn = 'LinkedIn',
  Twitter = 'Twitter',
}

export enum Framework {
  AIDA = 'AIDA',
  PAS = 'PAS',
  BAB = 'BAB',
  FourPs = '4Ps',
}

export enum Page {
  Analyze = 'Analyze',
  Generate = 'Generate',
  History = 'History',
  Analytics = 'Analytics',
}

export enum AppMode {
  ContentCreator = 'ContentCreator',
  JobSeeker = 'JobSeeker',
}

export interface ContentPost {
  id: string;
  content: string;
  frameworkUsed: Framework;
}

export interface GenerationRequest {
  topic: string;
}

export interface TimingSuggestion {
  linkedin: {
    days: string;
    times: string;
    reason: string;
  };
  twitter: {
    days: string;
    times: string;
    reason: string;
  };
}

export interface GeneratedContentBundle {
    id: string;
    topic: string;
    generatedImage: string;
    generatedImageAltText: string;
    linkedinPosts: ContentPost[];
    twitterPosts: ContentPost[];
    timingSuggestions: TimingSuggestion;
    groundingChunks: GroundingChunk[];
    createdAt: Date;
    feedback: 'up' | 'down' | null;
}

export interface GroundingChunk {
  web?: {
    // FIX: Made uri and title optional to match the type from the Gemini API response.
    uri?: string;
    title?: string;
  };
}

export interface TrendingTopic {
  topic: string;
  description: string;
  hashtags: string[];
}
