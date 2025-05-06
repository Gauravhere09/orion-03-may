
import { supabase } from "@/integrations/supabase/client";
import { ApiKey, ApiKeyInsert } from "./types";

/**
 * Get the default OpenRouter API key
 */
export async function getOpenRouterApiKey(): Promise<string | null> {
  try {
    const result = await supabase
      .from('openrouter_apis')
      .select('api_key')
      .order('priority', { ascending: true })
      .eq('is_default', true)
      .limit(1)
      .maybeSingle();
    
    if (result.error) {
      console.error('Error fetching OpenRouter API key:', result.error);
      return null;
    }
    
    return result.data?.api_key || null;
  } catch (error) {
    console.error('Error fetching OpenRouter API key:', error);
    return null;
  }
}

/**
 * Save or update OpenRouter API key
 */
export async function saveOpenRouterApiKey(apiKey: string, priority = 1): Promise<boolean> {
  try {
    const result = await supabase
      .from('openrouter_apis')
      .insert({
        api_key: apiKey,
        priority: priority,
        is_default: true,
        updated_at: new Date().toISOString()
      });
    
    if (result.error) {
      console.error('Error saving OpenRouter API key:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving OpenRouter API key:', error);
    return false;
  }
}

/**
 * List all OpenRouter API keys
 */
export async function listOpenRouterApiKeys(): Promise<ApiKey[]> {
  try {
    const result = await supabase
      .from('openrouter_apis')
      .select('id, api_key, priority')
      .order('priority', { ascending: true });
    
    if (result.error) {
      console.error('Error listing OpenRouter API keys:', result.error);
      return [];
    }
    
    return result.data as ApiKey[] || [];
  } catch (error) {
    console.error('Error listing OpenRouter API keys:', error);
    return [];
  }
}

/**
 * Delete OpenRouter API key
 */
export async function deleteOpenRouterApiKey(apiKey: string): Promise<boolean> {
  try {
    const result = await supabase
      .from('openrouter_apis')
      .delete()
      .eq('api_key', apiKey);
    
    if (result.error) {
      console.error('Error deleting OpenRouter API key:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting OpenRouter API key:', error);
    return false;
  }
}
