
import { supabase } from "@/integrations/supabase/client";

// Get API key for a specific service
export async function getApiKey(service: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('service', service)
      .single();
    
    if (error) {
      console.error(`Error fetching ${service} API key:`, error);
      return null;
    }
    
    return data?.api_key || null;
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
    return null;
  }
}

// Save or update API key for a service
export async function saveApiKey(service: string, apiKey: string): Promise<boolean> {
  try {
    // Check if service already exists
    const { data } = await supabase
      .from('api_keys')
      .select('id')
      .eq('service', service)
      .single();
    
    let result;
    
    if (data?.id) {
      // Update existing key
      result = await supabase
        .from('api_keys')
        .update({ api_key: apiKey, updated_at: new Date().toISOString() })
        .eq('service', service);
    } else {
      // Insert new key
      result = await supabase
        .from('api_keys')
        .insert({ service, api_key: apiKey });
    }
    
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

// Delete API key for a service
export async function deleteApiKey(service: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('service', service);
    
    if (error) {
      console.error(`Error deleting ${service} API key:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${service} API key:`, error);
    return false;
  }
}

// List all available API key services
export async function listApiKeyServices(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('service');
    
    if (error) {
      console.error("Error fetching API key services:", error);
      return [];
    }
    
    return data.map(item => item.service);
  } catch (error) {
    console.error("Error fetching API key services:", error);
    return [];
  }
}
