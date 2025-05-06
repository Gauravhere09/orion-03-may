
import { supabase } from "@/integrations/supabase/client";
import { ApiKey } from "./types";

/**
 * Get API key for a generic service
 */
export async function getGenericApiKey(service: string): Promise<string | null> {
  try {
    const result = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('service', service)
      .eq('is_active', true)
      .order('priority', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    if (result.error) {
      console.error(`Error fetching ${service} API key:`, result.error);
      return null;
    }
    
    return result.data?.api_key || null;
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
    return null;
  }
}

/**
 * Save or update API key for a generic service
 */
export async function saveGenericApiKey(service: string, apiKey: string, priority = 1): Promise<boolean> {
  try {
    const result = await supabase
      .from('api_keys')
      .insert({
        api_key: apiKey,
        service: service,
        priority: priority,
        is_active: true,
        updated_at: new Date().toISOString()
      });
    
    if (result.error) {
      console.error(`Error saving ${service} API key:`, result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error saving ${service} API key:`, error);
    return false;
  }
}

/**
 * List all API keys for a generic service
 */
export async function listGenericApiKeys(service: string): Promise<ApiKey[]> {
  try {
    const result = await supabase
      .from('api_keys')
      .select('id, api_key, priority')
      .eq('service', service)
      .order('priority', { ascending: true });
    
    if (result.error) {
      console.error(`Error listing ${service} API keys:`, result.error);
      return [];
    }
    
    return result.data as ApiKey[] || [];
  } catch (error) {
    console.error(`Error listing ${service} API keys:`, error);
    return [];
  }
}

/**
 * Delete API key for a generic service
 */
export async function deleteGenericApiKey(service: string, apiKey: string): Promise<boolean> {
  try {
    const result = await supabase
      .from('api_keys')
      .delete()
      .eq('api_key', apiKey)
      .eq('service', service);
    
    if (result.error) {
      console.error(`Error deleting ${service} API key:`, result.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${service} API key:`, error);
    return false;
  }
}
