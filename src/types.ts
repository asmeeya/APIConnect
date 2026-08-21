export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at?: string;
}

export interface FeatureRecord {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Archived';
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  status_code?: number;
}

export interface ProjectFile {
  path: string;
  project: 'api_provider' | 'api_client';
  language: string;
  content: string;
  description: string;
}

export interface ApiCallLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  caller: 'Project 2 Client' | 'Direct API Test' | 'External Consumer';
  authHeader: string | null;
  statusCode: number;
  requestBody?: any;
  responseBody: any;
  durationMs: number;
}
