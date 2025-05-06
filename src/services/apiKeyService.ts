
import { supabase } from "@/integrations/supabase/client";

// Get API key for a specific service
export async function getApiKey(service: string): Promise<string | null> {
  try {
    let data = null;
    let error = null;
    
    // Query the appropriate table based on service name
    if (service === 'openrouter') {
      const result = await supabase
        .from('openrouter_apis')
        .select('api_key')
        .order('priority', { ascending: true })
        .eq('is_default', true)
        .limit(1)
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    } else if (service === 'gemini') {
      const result = await supabase
        .from('gemini_api_keys')
        .select('api_key')
        .order('priority', { ascending: true })
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    } else if (service === 'dream_studio') {
      const result = await supabase
        .from('dream_studio_api_keys')
        .select('api_key')
        .order('priority', { ascending: true })
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    } else {
      // For any other service, try the general api_keys table
      const result = await supabase
        .from('api_keys')
        .select('api_key')
        .eq('service', service)
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .limit(1)
        .maybeSingle();
      
      data = result.data;
      error = result.error;
    }
    
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
    let result = null;
    
    // Insert into the appropriate table based on service name
    if (service === 'openrouter') {
      result = await supabase
        .from('openrouter_apis')
        .insert({
          api_key: apiKey,
          priority: priority,
          is_default: true,
          updated_at: new Date().toISOString()
        });
    } else if (service === 'gemini') {
      result = await supabase
        .from('gemini_api_keys')
        .insert({
          api_key: apiKey,
          priority: priority,
          is_active: true,
          updated_at: new Date().toISOString()
        });
    } else if (service === 'dream_studio') {
      result = await supabase
        .from('dream_studio_api_keys')
        .insert({
          api_key: apiKey,
          priority: priority,
          is_active: true,
          updated_at: new Date().toISOString()
        });
    } else {
      // For any other service, use the general api_keys table
      result = await supabase
        .from('api_keys')
        .insert({
          api_key: apiKey,
          service: service,
          priority: priority,
          is_active: true,
          updated_at: new Date().toISOString()
        });
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

// Delete API key for a service (admin only)
export async function deleteApiKey(service: string, apiKey: string): Promise<boolean> {
  try {
    let result = null;
    
    // Delete from the appropriate table based on service name
    if (service === 'openrouter') {
      result = await supabase
        .from('openrouter_apis')
        .delete()
        .eq('api_key', apiKey);
    } else if (service === 'gemini') {
      result = await supabase
        .from('gemini_api_keys')
        .delete()
        .eq('api_key', apiKey);
    } else if (service === 'dream_studio') {
      result = await supabase
        .from('dream_studio_api_keys')
        .delete()
        .eq('api_key', apiKey);
    } else {
      // For any other service, use the general api_keys table
      result = await supabase
        .from('api_keys')
        .delete()
        .eq('api_key', apiKey)
        .eq('service', service);
    }
    
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

// List all API keys for a service
export async function listApiKeys(service: string): Promise<{ id: string, api_key: string, priority: number }[]> {
  try {
    let result = null;
    
    // Query the appropriate table based on service name
    if (service === 'openrouter') {
      result = await supabase
        .from('openrouter_apis')
        .select('id, api_key, priority')
        .order('priority', { ascending: true });
    } else if (service === 'gemini') {
      result = await supabase
        .from('gemini_api_keys')
        .select('id, api_key, priority')
        .order('priority', { ascending: true });
    } else if (service === 'dream_studio') {
      result = await supabase
        .from('dream_studio_api_keys')
        .select('id, api_key, priority')
        .order('priority', { ascending: true });
    } else {
      // For any other service, use the general api_keys table
      result = await supabase
        .from('api_keys')
        .select('id, api_key, priority')
        .eq('service', service)
        .order('priority', { ascending: true });
    }
    
    if (result.error) {
      console.error(`Error listing ${service} API keys:`, result.error);
      return [];
    }
    
    return result.data as { id: string, api_key: string, priority: number }[] || [];
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
