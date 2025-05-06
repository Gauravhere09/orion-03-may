
import { supabase } from "@/integrations/supabase/client";
import { ApiKey, ApiKeyInsert } from "./types";

/**
 * Get the active Gemini API key
 */
export async function getGeminiApiKey(): Promise<string | null> {
  try {
    const result = await supabase
      .from('gemini_api_keys')
      .select('api_key')
      .order('priority', { ascending: true })
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    
    if (result.error) {
      console.error('Error fetching Gemini API key:', result.error);
      return null;
    }
    
    return result.data?.api_key || null;
  } catch (error) {
    console.error('Error fetching Gemini API key:', error);
    return null;
  }
}

/**
 * Save or update Gemini API key
 */
export async function saveGeminiApiKey(apiKey: string, priority = 1): Promise<boolean> {
  try {
    const result = await supabase
      .from('gemini_api_keys')
      .insert({
        api_key: apiKey,
        priority: priority,
        is_active: true,
        updated_at: new Date().toISOString()
      });
    
    if (result.error) {
      console.error('Error saving Gemini API key:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving Gemini API key:', error);
    return false;
  }
}

/**
 * List all Gemini API keys
 */
export async function listGeminiApiKeys(): Promise<ApiKey[]> {
  try {
    const result = await supabase
      .from('gemini_api_keys')
      .select('id, api_key, priority')
      .order('priority', { ascending: true });
    
    if (result.error) {
      console.error('Error listing Gemini API keys:', result.error);
      return [];
    }
    
    return result.data as ApiKey[] || [];
  } catch (error) {
    console.error('Error listing Gemini API keys:', error);
    return [];
  }
}

/**
 * Delete Gemini API key
 */
export async function deleteGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const result = await supabase
      .from('gemini_api_keys')
      .delete()
      .eq('api_key', apiKey);
    
    if (result.error) {
      console.error('Error deleting Gemini API key:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting Gemini API key:', error);
    return false;
  }
}
