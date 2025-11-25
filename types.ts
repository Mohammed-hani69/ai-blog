export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  replies?: Comment[]; // Support for nested replies
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  imageUrl: string;
  author: string;
  date: string;
  tags: string[];
  category: string;
  status: 'published' | 'draft';
  views: number;
  comments: Comment[];
  trafficSources: {
    search: number;
    social: number;
    direct: number;
    referral: number;
  };
}

export interface AISettings {
  niche: string;
  keywords: string;
  articlesPerDay: number;
  imageQuality: '1K' | '2K' | '4K';
  language: 'Arabic' | 'English';
  autoPublish: boolean;
}

export interface AdZone {
  enabled: boolean;
  code: string; // HTML or JS Script for the ad
}

export interface AdSettings {
  header: AdZone;
  sidebar: AdZone;
  articleTop: AdZone;
  articleMiddle: AdZone;
  articleBottom: AdZone;
  footer: AdZone;
  adsTxtContent: string; // Content for ads.txt file
}

export interface AdminProfile {
  name: string;
  email: string;
  password: string; // In a real app, this should be hashed.
  avatarUrl?: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'system';
}

export enum AIState {
  IDLE = 'IDLE',
  ANALYZING_TRENDS = 'ANALYZING_TRENDS',
  WRITING_CONTENT = 'WRITING_CONTENT',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  PUBLISHING = 'PUBLISHING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}