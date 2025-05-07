
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface DreamStudioGenerateOptions {
  prompt: string;
  aspectRatio?: string;
  stylePreset?: string;
  outputFormat?: string;
}

export async function generateDreamStudioImage(options: DreamStudioGenerateOptions): Promise<string | null> {
  try {
    const { prompt, aspectRatio = "1:1", stylePreset, outputFormat = "webp" } = options;
    
    // Get all available Dream Studio API keys directly from Supabase
    const { data: apiKeysData, error: apiKeysError } = await supabase
      .from('dream_studio_api_keys')
      .select('api_key')
      .order('priority', { ascending: true })
      .eq('is_active', true);

    if (apiKeysError) {
      console.error("Error fetching API keys:", apiKeysError);
      toast.error("Could not fetch API keys", {
        description: "Please check your connection to Supabase"
      });
      return null;
    }

    const apiKeys = apiKeysData.map(item => item.api_key);
    
    if (apiKeys.length === 0) {
      toast.error("No Dream Studio API keys found", {
        description: "Please add your Dream Studio API key in the settings"
      });
      return null;
    }
    
    console.log(`Found ${apiKeys.length} Dream Studio API keys to try`);
    
    // Use the first API key (highest priority) for the initial attempt
    let result = await attemptImageGeneration(apiKeys[0], prompt, aspectRatio, stylePreset, outputFormat);
    
    // If first key fails but we have other keys, try them in order
    if (!result && apiKeys.length > 1) {
      for (let i = 1; i < apiKeys.length; i++) {
        console.log(`First API key failed, trying alternate key ${i}...`);
        result = await attemptImageGeneration(apiKeys[i], prompt, aspectRatio, stylePreset, outputFormat);
        if (result) break;
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error generating Dream Studio image:", error);
    toast.error("Failed to generate image", {
      description: error instanceof Error ? error.message : "An unexpected error occurred"
    });
    return null;
  }
}

async function attemptImageGeneration(
  apiKey: string, 
  prompt: string, 
  aspectRatio: string, 
  stylePreset?: string,
  outputFormat: string = 'webp'
): Promise<string | null> {
  try {
    console.log("Attempting image generation with Dream Studio key:", apiKey.substring(0, 5) + "...");
    
    const { data, error } = await supabase.functions.invoke('dream-studio-generate', {
      body: {
        prompt,
        aspect_ratio: aspectRatio,
        style_preset: stylePreset !== "none" ? stylePreset : undefined,
        output_format: outputFormat,
        api_key: apiKey
      }
    });
    
    if (error) {
      console.error("Dream Studio API error:", error);
      return null;
    }
    
    if (!data.image) {
      console.error("No image data returned from Dream Studio API");
      return null;
    }
    
    return data.image;
  } catch (error) {
    console.error(`Error with specific Dream Studio key:`, error);
    return null;
  }
}

export const DREAM_STUDIO_STYLE_PRESETS = [
  { value: "3d-model", label: "3D Model" },
  { value: "analog-film", label: "Analog Film" },
  { value: "anime", label: "Anime" },
  { value: "cinematic", label: "Cinematic" },
  { value: "comic-book", label: "Comic Book" },
  { value: "digital-art", label: "Digital Art" },
  { value: "enhance", label: "Enhance" },
  { value: "fantasy-art", label: "Fantasy Art" },
  { value: "isometric", label: "Isometric" },
  { value: "line-art", label: "Line Art" },
  { value: "low-poly", label: "Low Poly" },
  { value: "modeling-compound", label: "Modeling Compound" },
  { value: "neon-punk", label: "Neon Punk" },
  { value: "origami", label: "Origami" },
  { value: "photographic", label: "Photographic" },
  { value: "pixel-art", label: "Pixel Art" },
  { value: "tile-texture", label: "Tile Texture" }
];

export const DREAM_STUDIO_ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "3:2", label: "Landscape (3:2)" },
  { value: "2:3", label: "Portrait (2:3)" },
  { value: "4:5", label: "Portrait (4:5)" },
  { value: "5:4", label: "Landscape (5:4)" },
  { value: "21:9", label: "Ultrawide (21:9)" },
  { value: "9:21", label: "Tall (9:21)" }
];
