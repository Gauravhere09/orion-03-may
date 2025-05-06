
import { supabase } from "@/integrations/supabase/client";

// Get API key for a specific service
export async function getApiKey(service: string): Promise<string | null> {
  try {
    let tableName = 'api_keys';
    
    // Map service to the correct table
    if (service === 'openrouter') {
      tableName = 'openrouter_apis';
    } else if (service === 'gemini') {
      tableName = 'gemini_api_keys';
    } else if (service === 'dream_studio') {
      tableName = 'dream_studio_api_keys';
    }
    
    // Query the appropriate table
    const { data, error } = await supabase
      .from(tableName)
      .select('api_key')
      .order('priority', { ascending: true })
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    
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

// Save or update API key for a service (admin only)
export async function saveApiKey(service: string, apiKey: string, priority = 1): Promise<boolean> {
  try {
    let tableName = 'api_keys';
    
    // Map service to the correct table
    if (service === 'openrouter') {
      tableName = 'openrouter_apis';
    } else if (service === 'gemini') {
      tableName = 'gemini_api_keys';
    } else if (service === 'dream_studio') {
      tableName = 'dream_studio_api_keys';
    }
    
    // Insert new key
    const result = await supabase
      .from(tableName)
      .insert({
        api_key: apiKey,
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

// Delete API key for a service (admin only)
export async function deleteApiKey(service: string, apiKey: string): Promise<boolean> {
  try {
    let tableName = 'api_keys';
    
    // Map service to the correct table
    if (service === 'openrouter') {
      tableName = 'openrouter_apis';
    } else if (service === 'gemini') {
      tableName = 'gemini_api_keys';
    } else if (service === 'dream_studio') {
      tableName = 'dream_studio_api_keys';
    }
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('api_key', apiKey);
    
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

// List all API keys for a service
export async function listApiKeys(service: string): Promise<{ id: string, api_key: string, priority: number }[]> {
  try {
    let tableName = 'api_keys';
    
    // Map service to the correct table
    if (service === 'openrouter') {
      tableName = 'openrouter_apis';
    } else if (service === 'gemini') {
      tableName = 'gemini_api_keys';
    } else if (service === 'dream_studio') {
      tableName = 'dream_studio_api_keys';
    }
    
    const { data, error } = await supabase
      .from(tableName)
      .select('id, api_key, priority')
      .order('priority', { ascending: true });
    
    if (error) {
      console.error(`Error listing ${service} API keys:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Error listing ${service} API keys:`, error);
    return [];
  }
}

// Check if user is an admin
export async function isUserAdmin(): Promise<boolean> {
  try {
    const session = await supabase.auth.getSession();
    
    if (!session.data.session?.user?.id) {
      return false;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.data.session.user.id)
      .maybeSingle();
    
    if (error || !data) {
      console.error("Error checking admin status:", error);
      return false;
    }
    
    return data.is_admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
