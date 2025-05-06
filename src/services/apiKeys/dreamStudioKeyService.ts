
import { supabase } from "@/integrations/supabase/client";
import { ApiKey, ApiKeyInsert } from "./types";

/**
 * Get the active DreamStudio API key
 */
export async function getDreamStudioApiKey(): Promise<string | null> {
  try {
    const result = await supabase
      .from('dream_studio_api_keys')
      .select('api_key')
      .order('priority', { ascending: true })
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    
    if (result.error) {
      console.error('Error fetching DreamStudio API key:', result.error);
      return null;
    }
    
    return result.data?.api_key || null;
  } catch (error) {
    console.error('Error fetching DreamStudio API key:', error);
    return null;
  }
}

/**
 * Get all active DreamStudio API keys
 */
export async function getAllDreamStudioApiKeys(): Promise<string[]> {
  try {
    const result = await supabase
      .from('dream_studio_api_keys')
      .select('api_key')
      .order('priority', { ascending: true })
      .eq('is_active', true);
    
    if (result.error) {
      console.error('Error fetching all DreamStudio API keys:', result.error);
      return [];
    }
    
    return result.data.map(item => item.api_key) || [];
  } catch (error) {
    console.error('Error fetching all DreamStudio API keys:', error);
    return [];
  }
}

/**
 * Save or update DreamStudio API key
 */
export async function saveDreamStudioApiKey(apiKey: string, priority = 1): Promise<boolean> {
  try {
    const result = await supabase
      .from('dream_studio_api_keys')
      .insert({
        api_key: apiKey,
        priority: priority,
        is_active: true,
        updated_at: new Date().toISOString()
      });
    
    if (result.error) {
      console.error('Error saving DreamStudio API key:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving DreamStudio API key:', error);
    return false;
  }
}

/**
 * List all DreamStudio API keys
 */
export async function listDreamStudioApiKeys(): Promise<ApiKey[]> {
  try {
    const result = await supabase
      .from('dream_studio_api_keys')
      .select('id, api_key, priority')
      .order('priority', { ascending: true });
    
    if (result.error) {
      console.error('Error listing DreamStudio API keys:', result.error);
      return [];
    }
    
    return result.data as ApiKey[] || [];
  } catch (error) {
    console.error('Error listing DreamStudio API keys:', error);
    return [];
  }
}

/**
 * Delete DreamStudio API key
 */
export async function deleteDreamStudioApiKey(apiKey: string): Promise<boolean> {
  try {
    const result = await supabase
      .from('dream_studio_api_keys')
      .delete()
      .eq('api_key', apiKey);
    
    if (result.error) {
      console.error('Error deleting DreamStudio API key:', result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting DreamStudio API key:', error);
    return false;
  }
}
