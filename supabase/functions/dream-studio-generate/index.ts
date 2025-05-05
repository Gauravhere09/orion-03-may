
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { prompt, aspect_ratio = "1:1", style_preset, output_format = "webp", api_key } = requestData;
    
    let dreamStudioApiKey = api_key;
    
    if (!dreamStudioApiKey) {
      throw new Error('Dream Studio API key not found');
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
    const uint8Array = new Uint8Array(imageBuffer);
    const binary = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
    const base64Image = btoa(binary);
    const dataUrl = `data:image/${output_format};base64,${base64Image}`;

    return new Response(
      JSON.stringify({ image: dataUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in Dream Studio function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
