
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabase-admin.ts";

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
    // Get Dream Studio API key from database
    const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
      .from('api_keys')
      .select('api_key')
      .eq('service', 'dream_studio')
      .maybeSingle();

    if (apiKeyError) {
      console.error('Error fetching Dream Studio API key:', apiKeyError);
      throw new Error(`Failed to fetch API key: ${apiKeyError.message}`);
    }

    if (!apiKeyData?.api_key) {
      throw new Error('Dream Studio API key not found');
    }

    const dreamStudioApiKey = apiKeyData.api_key;
    const requestData = await req.json();
    const { prompt, aspect_ratio = "1:1", style_preset, output_format = "webp" } = requestData;

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
        Authorization: `Bearer ${dreamStudioApiKey}`,
        Accept: "image/*"
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Stability AI API error: ${response.status}`, errorText);
      throw new Error(`Stability AI API error: ${response.status} - ${errorText}`);
    }

    // Convert binary response to base64
    const imageBuffer = await response.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const dataUrl = `data:image/${output_format};base64,${base64Image}`;

    return new Response(
      JSON.stringify({ image: dataUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in Dream Studio function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
