
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { getApiKey } from "./apiKeyService";

export interface DreamStudioGenerateOptions {
  prompt: string;
  aspectRatio?: string;
  stylePreset?: string;
  outputFormat?: string;
}

export async function generateDreamStudioImage(options: DreamStudioGenerateOptions): Promise<string | null> {
  try {
    const { prompt, aspectRatio = "1:1", stylePreset, outputFormat = "webp" } = options;
    
    // First try to get API key from localStorage as a fallback
    const localApiKey = localStorage.getItem('dream_studio_api_key');
    
    // Get API key from Supabase if the user is logged in
    let supabaseKey = null;
    const session = await supabase.auth.getSession();
    if (session.data.session) {
      supabaseKey = await getApiKey('dream_studio');
    }
    
    // Use the Supabase key if available, otherwise use the localStorage key
    const apiKey = supabaseKey || localApiKey;
    
    if (!apiKey) {
      toast.error("Dream Studio API key not found", {
        description: "Please add your Dream Studio API key in the settings"
      });
      return null;
    }
    
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
      toast.error("Failed to generate image", {
        description: error.message || "An unexpected error occurred"
      });
      return null;
    }
    
    if (!data.image) {
      console.error("No image data returned from Dream Studio API");
      toast.error("No image was generated");
      return null;
    }
    
    return data.image;
  } catch (error) {
    console.error("Error generating Dream Studio image:", error);
    toast.error("Failed to generate image", {
      description: error instanceof Error ? error.message : "An unexpected error occurred"
    });
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
