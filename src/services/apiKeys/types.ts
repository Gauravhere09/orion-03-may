
export interface ApiKey {
  id: string;
  api_key: string;
  priority: number;
}

export interface ApiKeyInsert {
  api_key: string;
  priority: number;
  is_active?: boolean;
  is_default?: boolean;
  updated_at?: string;
}
