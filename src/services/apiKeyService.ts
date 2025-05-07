
import { supabase } from "@/integrations/supabase/client";
import { 
  getOpenRouterApiKey,
  saveOpenRouterApiKey, 
  listOpenRouterApiKeys, 
  deleteOpenRouterApiKey 
} from "./apiKeys/openRouterKeyService";
import { 
  getGeminiApiKey, 
  saveGeminiApiKey, 
  listGeminiApiKeys, 
  deleteGeminiApiKey 
} from "./apiKeys/geminiKeyService";
import { 
  getDreamStudioApiKey, 
  saveDreamStudioApiKey, 
  listDreamStudioApiKeys, 
  deleteDreamStudioApiKey,
  getAllDreamStudioApiKeys 
} from "./apiKeys/dreamStudioKeyService";
import { 
  getGenericApiKey, 
  saveGenericApiKey, 
  listGenericApiKeys, 
  deleteGenericApiKey 
} from "./apiKeys/genericKeyService";

// Get API key for a specific service (only from Supabase)
export async function getApiKey(service: string): Promise<string | null> {
  try {
    if (service === 'openrouter') {
      return await getOpenRouterApiKey();
    } else if (service === 'gemini') {
      return await getGeminiApiKey();
    } else if (service === 'dream_studio') {
      return await getDreamStudioApiKey();
    } else {
      return await getGenericApiKey(service);
    }
  } catch (error) {
    console.error(`Error fetching ${service} API key:`, error);
    return null;
  }
}

// Get all API keys for DreamStudio to enable multi-API usage (only from Supabase)
export async function getAllDreamStudioKeys(): Promise<string[]> {
  return await getAllDreamStudioApiKeys();
}

// Save or update API key for a service (admin only)
export async function saveApiKey(service: string, apiKey: string, priority = 1): Promise<boolean> {
  try {
    if (service === 'openrouter') {
      return await saveOpenRouterApiKey(apiKey, priority);
    } else if (service === 'gemini') {
      return await saveGeminiApiKey(apiKey, priority);
    } else if (service === 'dream_studio') {
      return await saveDreamStudioApiKey(apiKey, priority);
    } else {
      return await saveGenericApiKey(service, apiKey, priority);
    }
  } catch (error) {
    console.error(`Error saving ${service} API key:`, error);
    return false;
  }
}

// Delete API key for a service (admin only)
export async function deleteApiKey(service: string, apiKey: string): Promise<boolean> {
  try {
    if (service === 'openrouter') {
      return await deleteOpenRouterApiKey(apiKey);
    } else if (service === 'gemini') {
      return await deleteGeminiApiKey(apiKey);
    } else if (service === 'dream_studio') {
      return await deleteDreamStudioApiKey(apiKey);
    } else {
      return await deleteGenericApiKey(service, apiKey);
    }
  } catch (error) {
    console.error(`Error deleting ${service} API key:`, error);
    return false;
  }
}

// List all API keys for a service
export async function listApiKeys(service: string): Promise<{ id: string, api_key: string, priority: number }[]> {
  try {
    if (service === 'openrouter') {
      return await listOpenRouterApiKeys();
    } else if (service === 'gemini') {
      return await listGeminiApiKeys();
    } else if (service === 'dream_studio') {
      return await listDreamStudioApiKeys();
    } else {
      return await listGenericApiKeys(service);
    }
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
