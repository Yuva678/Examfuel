export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  university: string;
  branch?: string;
  joinedAt: string;
}

export type ResourceType = 'PDF' | 'Image' | 'PPT' | 'DOCX' | 'TXT' | 'ZIP';

export interface Comment {
  id: string;
  resourceId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: number;
  university: string;
  branch: string;
  type: ResourceType;
  tags: string[];
  uploader: User;
  uploadDate: string;
  views: number;
  downloads: number;
  fileSize: string;
  thumbnailUrl?: string;
}

export interface FilterOptions {
  semesters: number[];
  subjects: string[];
  universities: string[];
  resourceTypes: ResourceType[];
  years: string[];
}
