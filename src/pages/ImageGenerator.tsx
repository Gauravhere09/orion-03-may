
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gallery, Image, Sparkles, DownloadCloud, Wand2, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Admin credentials for demo purposes - in a real app, these would be handled securely
const ADMIN_CREDENTIALS = {
  email: "admin@orion.ai",
  password: "admin123"
};

// Function to generate images with fallback to alternative APIs
const generateImage = async (
  prompt: string,
  negativePrompt: string = "",
  width: number = 512,
  height: number = 512, 
  samplingSteps: number = 28
) => {
  // Mock delay for image generation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For now, we're returning placeholder images
  // In production, this would call actual API endpoints with error handling and fallbacks
  return {
    images: [`https://picsum.photos/${width}/${height}?random=${Date.now()}`],
    seed: Math.floor(Math.random() * 1000000),
    model: "dreamStudio",
    prompt
  };
};

// Image generation models
const models = [
  { id: "dreamstudio", name: "DreamStudio AI", version: "v2.0" },
  { id: "dalle", name: "DALL-E", version: "3" },
  { id: "midjourney", name: "Midjourney", version: "v5" },
  { id: "stability", name: "Stability AI", version: "XL" },
];

// Image aspect ratios
const aspectRatios = [
  { id: "1:1", name: "Square (1:1)", width: 512, height: 512 },
  { id: "4:3", name: "Standard (4:3)", width: 640, height: 480 },
  { id: "3:4", name: "Portrait (3:4)", width: 480, height: 640 },
  { id: "16:9", name: "Widescreen (16:9)", width: 704, height: 396 },
];

// Image styles
const imageStyles = [
  "Photorealistic", "Digital Art", "Anime", "Cartoon", 
  "Oil Painting", "Watercolor", "Sketch", "Abstract",
  "Surrealism", "Minimalist", "Cyberpunk", "Fantasy"
];

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [samplingSteps, setSamplingSteps] = useState(28);
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[0].id);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [currentTab, setCurrentTab] = useState("generate");
  
  // Get width and height based on selected aspect ratio
  const getImageDimensions = () => {
    const selected = aspectRatios.find(ratio => ratio.id === aspectRatio);
    return selected ? { width: selected.width, height: selected.height } : { width: 512, height: 512 };
  };
  
  // Function to enhance the prompt using selected style
  const enhancePrompt = () => {
    if (!prompt) return;
    
    let enhanced = prompt;
    if (selectedStyle) {
      enhanced += `, ${selectedStyle.toLowerCase()} style`;
    }
    
    // Add some artistic flair
    const enhancements = [
      "highly detailed", "professional", "vivid colors", 
      "masterful composition", "stunning", "intricate details"
    ];
    
    // Add 1-2 random enhancements
    const numEnhancements = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numEnhancements; i++) {
      const idx = Math.floor(Math.random() * enhancements.length);
      enhanced += `, ${enhancements[idx]}`;
    }
    
    setEnhancedPrompt(enhanced);
  };
  
  // Function to handle generate button click
  const handleGenerateClick = async () => {
    if (!prompt && !enhancedPrompt) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setGeneratingImage(true);
    try {
      const dimensions = getImageDimensions();
      const finalPrompt = enhancedPrompt || prompt;
      
      const result = await generateImage(
        finalPrompt,
        negativePrompt,
        dimensions.width,
        dimensions.height,
        samplingSteps
      );
      
      setGeneratedImages(prev => [...result.images, ...prev]);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Trying alternative API...");
      
      // Simulate fallback to alternative API
      try {
        const dimensions = getImageDimensions();
        const result = await generateImage(
          enhancedPrompt || prompt,
          negativePrompt,
          dimensions.width,
          dimensions.height
        );
        
        setGeneratedImages(prev => [...result.images, ...prev]);
        toast.success("Image generated with backup API!");
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        toast.error("All generation attempts failed. Please try again later.");
      }
    } finally {
      setGeneratingImage(false);
      setEnhancedPrompt("");
    }
  };
  
  // Load previously generated images from localStorage
  useEffect(() => {
    const savedImages = localStorage.getItem('generatedImages');
    if (savedImages) {
      setGeneratedImages(JSON.parse(savedImages));
    }
  }, []);
  
  // Save generated images to localStorage
  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem('generatedImages', JSON.stringify(generatedImages));
    }
  }, [generatedImages]);
  
  // Function to download an image
  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded successfully");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border p-4">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
          AI Image Generator
        </h1>
      </header>
      
      <Tabs 
        value={currentTab} 
        onValueChange={setCurrentTab}
        className="flex-1 container mx-auto px-4 py-6 max-w-5xl"
      >
        <TabsList className="w-full mb-8">
          <TabsTrigger value="generate" className="flex-1">
            <Wand2 className="mr-2 h-4 w-4" /> Generate
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1">
            <Gallery className="mr-2 h-4 w-4" /> Gallery
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea 
                    id="prompt"
                    placeholder="Describe the image you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-32"
                  />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger id="model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(model => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name} {model.version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger id="aspectRatio">
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatios.map(ratio => (
                          <SelectItem key={ratio.id} value={ratio.id}>
                            {ratio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="style">Style</Label>
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                      <SelectTrigger id="style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No style</SelectItem>
                        {imageStyles.map(style => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="advancedMode"
                    checked={useAdvanced}
                    onCheckedChange={setUseAdvanced}
                  />
                  <Label htmlFor="advancedMode">Advanced Mode</Label>
                </div>
                
                {useAdvanced && (
                  <div className="pt-4 space-y-4 bg-secondary/10 p-4 rounded-lg">
                    <div>
                      <Label htmlFor="negativePrompt">Negative Prompt</Label>
                      <Textarea 
                        id="negativePrompt"
                        placeholder="Things to exclude from the image..."
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        className="h-16"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between">
                        <Label htmlFor="samplingSteps">Sampling Steps: {samplingSteps}</Label>
                      </div>
                      <Slider
                        id="samplingSteps"
                        min={10}
                        max={50}
                        step={1}
                        value={[samplingSteps]}
                        onValueChange={(value) => setSamplingSteps(value[0])}
                        className="pt-2"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={enhancePrompt}
                    disabled={!prompt || generatingImage}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance Prompt
                  </Button>
                  
                  <Button 
                    onClick={handleGenerateClick}
                    disabled={generatingImage || (!prompt && !enhancedPrompt)} 
                    className="flex-1 cyan-glow"
                  >
                    {generatingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>
                
                {enhancedPrompt && (
                  <div className="mt-4 p-3 bg-secondary/20 rounded-md">
                    <Label className="text-xs text-muted-foreground">Enhanced Prompt:</Label>
                    <p className="text-sm font-medium">{enhancedPrompt}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {generatingImage && (
            <div className="relative min-h-[300px] flex items-center justify-center">
              <div className="absolute animate-pulse bg-primary/10 w-64 h-64 rounded-md flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>
          )}
          
          {generatedImages.length > 0 && !generatingImage && (
            <div>
              <h3 className="text-lg font-medium mb-4">Recently Generated</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {generatedImages.slice(0, 6).map((imageUrl, index) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg border border-border">
                    <img 
                      src={imageUrl} 
                      alt={`Generated ${index}`} 
                      className="w-full aspect-square object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => downloadImage(imageUrl)}
                        className="text-white bg-black/30 hover:bg-black/50"
                      >
                        <DownloadCloud className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {generatedImages.length > 6 && (
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={() => setCurrentTab("gallery")}
                >
                  View All Images
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="gallery">
          {generatedImages.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Generated Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg border border-border">
                    <img 
                      src={imageUrl} 
                      alt={`Generated ${index}`}
                      className="w-full aspect-square object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => downloadImage(imageUrl)}
                        className="text-white bg-black/30 hover:bg-black/50"
                      >
                        <DownloadCloud className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
              <Image className="h-16 w-16 mx-auto text-muted-foreground opacity-30 mb-4" />
              <h3 className="text-lg font-medium">No images generated yet</h3>
              <p className="text-muted-foreground mb-4">Start generating images to see them here</p>
              <Button onClick={() => setCurrentTab("generate")}>Go to Generator</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageGenerator;
