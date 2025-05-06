
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get Dream Studio API keys
export async function getDreamStudioApiKeys() {
  const { data, error } = await supabaseAdmin
    .from('dream_studio_api_keys')
    .select('api_key')
    .order('priority', { ascending: true })
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching Dream Studio API keys:', error);
    return [];
  }
  
  return data?.map(item => item.api_key) || [];
}

// Helper function to get Gemini API keys
export async function getGeminiApiKeys() {
  const { data, error } = await supabaseAdmin
    .from('gemini_api_keys')
    .select('api_key')
    .order('priority', { ascending: true })
    .eq('is_active', true);
    
  if (error) {
    console.error('Error fetching Gemini API keys:', error);
    return [];
  }
  
  return data?.map(item => item.api_key) || [];
}

// Helper function to get OpenRouter API keys
export async function getOpenRouterApiKeys() {
  const { data, error } = await supabaseAdmin
    .from('openrouter_apis')
    .select('api_key')
    .order('priority', { ascending: true });
    
  if (error) {
    console.error('Error fetching OpenRouter API keys:', error);
    return [];
  }
  
  return data?.map(item => item.api_key) || [];
}
