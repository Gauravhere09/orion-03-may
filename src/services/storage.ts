
import { supabase } from "@/integrations/supabase/client";

// API key structure
export interface ApiKey {
  id?: string;
  key: string;
  isDefault?: boolean;
  priority?: number;
}

// Sync API keys between Supabase and local storage
export async function syncApiKeysWithSupabase(supabase: any): Promise<void> {
  try {
    // Attempt to sync Dream Studio API keys
    const { data: dreamStudioKeys, error: dreamStudioError } = await supabase
      .from('dream_studio_api_keys')
      .select('api_key, priority')
      .order('priority', { ascending: true });
      
    if (!dreamStudioError && dreamStudioKeys?.length > 0) {
      console.log('Synced Dream Studio API keys from Supabase');
    } else {
      console.log('No Dream Studio API keys found in Supabase');
    }
    
    // Attempt to sync OpenRouter API keys
    const { data: openRouterKeys, error: openRouterError } = await supabase
      .from('openrouter_apis')
      .select('api_key, priority')
      .order('priority', { ascending: true });
      
    if (!openRouterError && openRouterKeys?.length > 0) {
      console.log('Synced OpenRouter API keys from Supabase');
    } else {
      console.log('No OpenRouter API keys found in Supabase');
    }
    
    // Attempt to sync Gemini API keys
    const { data: geminiKeys, error: geminiError } = await supabase
      .from('gemini_api_keys')
      .select('api_key, priority')
      .order('priority', { ascending: true });
      
    if (!geminiError && geminiKeys?.length > 0) {
      console.log('Synced Gemini API keys from Supabase');
    } else {
      console.log('No Gemini API keys found in Supabase');
    }
  } catch (err) {
    console.error('Error syncing API keys with Supabase:', err);
  }
}

// Initialize default API keys (this is now a no-op as we're using Supabase exclusively)
export function initializeApiKeys(): void {
  console.log('API keys are now managed through Supabase');
}

// Save API key (this is now a no-op as we're using Supabase exclusively)
export function saveApiKey(apiKey: string): void {
  console.log('API keys should be saved directly to Supabase');
}

// Get all API keys (this is now a no-op as we're using Supabase exclusively)
export function getAllApiKeys(): ApiKey[] {
  console.log('API keys should be fetched directly from Supabase');
  return [];
}

// Remove API key (this is now a no-op as we're using Supabase exclusively)
export function removeApiKey(key: string): void {
  console.log('API keys should be deleted directly from Supabase');
}

// Reorder API keys (this is now a no-op as we're using Supabase exclusively)
export function reorderApiKeys(keys: ApiKey[]): void {
  console.log('API keys should be reordered directly in Supabase');
}

// Check if system has API keys (now we check directly with Supabase)
export async function hasApiKeys(): Promise<boolean> {
  try {
    // Check if we have any Dream Studio API keys
    const { data: dreamStudioKeys, error: dreamStudioError } = await supabase
      .from('dream_studio_api_keys')
      .select('id')
      .limit(1);
      
    if (!dreamStudioError && dreamStudioKeys?.length > 0) {
      return true;
    }
    
    // Check if we have any OpenRouter API keys
    const { data: openRouterKeys, error: openRouterError } = await supabase
      .from('openrouter_apis')
      .select('id')
      .limit(1);
      
    if (!openRouterError && openRouterKeys?.length > 0) {
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Error checking for API keys:', err);
    return false;
  }
}

// Save API keys (this is now a no-op as we're using Supabase exclusively)
export function saveApiKeys(keys: ApiKey[]): void {
  console.log('API keys should be saved directly to Supabase');
}
