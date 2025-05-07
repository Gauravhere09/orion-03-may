
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getDreamStudioApiKeys } from "../_shared/supabase-admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request data
    const requestData = await req.json();
    const { prompt, aspect_ratio = "1:1", style_preset, output_format = "webp", api_key: userProvidedApiKey } = requestData;
    
    // First try user-provided API key if available
    let dreamStudioApiKeys = [];
    
    if (userProvidedApiKey) {
      dreamStudioApiKeys = [userProvidedApiKey];
      console.log("Using user-provided Dream Studio API key");
    } else {
      // Fetch API keys from Supabase
      dreamStudioApiKeys = await getDreamStudioApiKeys();
      console.log(`Fetched ${dreamStudioApiKeys.length} Dream Studio API keys from Supabase`);
    }
    
    if (dreamStudioApiKeys.length === 0) {
      throw new Error('No Dream Studio API keys available');
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Generating image with Dream Studio:", { 
      prompt, 
      aspect_ratio, 
      style_preset: style_preset || "none" 
    });
    
    // Try all available API keys
    let lastError = null;
    
    for (const apiKey of dreamStudioApiKeys) {
      try {
        console.log(`Attempting with Dream Studio key: ${apiKey.substring(0, 5)}...`);
        
        // Create payload for Stability AI API
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('output_format', output_format);
        formData.append('aspect_ratio', aspect_ratio);
        
        // Only add style_preset if it's provided and not "none"
        if (style_preset && style_preset !== "none") {
          formData.append('style_preset', style_preset);
        }

        // Call Stability AI API
        const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/ultra", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "image/*"
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Stability AI API error with key ${apiKey.substring(0, 5)}...: ${response.status}`, errorText);
          lastError = `Stability AI API error: ${response.status} - ${errorText}`;
          // Continue to next key
          continue;
        }

        // Convert binary response to base64
        const imageBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        const binary = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
        const base64Image = btoa(binary);
        const dataUrl = `data:image/${output_format};base64,${base64Image}`;

        return new Response(
          JSON.stringify({ image: dataUrl }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (keyError) {
        console.error(`Error with Dream Studio key ${apiKey.substring(0, 5)}...`, keyError);
        lastError = keyError.message || "Unknown error with API key";
        // Continue to next key
      }
    }
    
    // If we're here, all keys failed
    throw new Error(lastError || "All Dream Studio API keys failed");
    
  } catch (error) {
    console.error("Error in Dream Studio function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
