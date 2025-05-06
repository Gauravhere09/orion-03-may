import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useModelStore } from '@/stores/modelStore';
import { Loader2, Download, Copy, Share2, Wand2, Image as ImageIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { generateDreamStudioImage, DREAM_STUDIO_STYLE_PRESETS, DREAM_STUDIO_ASPECT_RATIOS } from '@/services/dreamStudioService';
import { getAllDreamStudioKeys } from '@/services/apiKeyService';
import ImageGenerationLoading from '@/components/ImageGenerationLoading';
import ImageViewer from '@/components/ImageViewer';

const ImageGenerator = () => {
  const { selectedModel } = useModelStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageHistory, setImageHistory] = useState<{ url: string, prompt: string }[]>([]);
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1:1');
  const [style, setStyle] = useState('none');
  const [isDreamStudioKeyAvailable, setIsDreamStudioKeyAvailable] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string, prompt: string } | null>(null);
  
  useEffect(() => {
    // Check if Dream Studio API keys are available
    const checkApiKeys = async () => {
      try {
        // Try to get keys from Supabase
        const keys = await getAllDreamStudioKeys();
        if (keys.length > 0) {
          setIsDreamStudioKeyAvailable(true);
          return;
        }
        
        // Fallback to localStorage
        const localApiKey = localStorage.getItem('dream_studio_api_key');
        setIsDreamStudioKeyAvailable(!!localApiKey);
      } catch (error) {
        console.error("Error checking Dream Studio API keys:", error);
        // Fallback to localStorage check
        const localApiKey = localStorage.getItem('dream_studio_api_key');
        setIsDreamStudioKeyAvailable(!!localApiKey);
      }
    };
    
    checkApiKeys();
    
    // Load image history from localStorage
    try {
      const savedHistory = localStorage.getItem('image_history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert old format if needed
        const formattedHistory = Array.isArray(parsedHistory) 
          ? parsedHistory.map(url => 
              typeof url === 'string' ? { url, prompt: 'Generated image' } : url
            )
          : [];
        setImageHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Error loading image history:", error);
    }
  }, []);

  // Save image history to localStorage
  const saveImageToHistory = (imageUrl: string, imagePrompt: string) => {
    const newImage = { url: imageUrl, prompt: imagePrompt };
    const updatedHistory = [newImage, ...imageHistory.slice(0, 19)]; // Keep only the 20 most recent images
    setImageHistory(updatedHistory);
    localStorage.setItem('image_history', JSON.stringify(updatedHistory));
  };

  // Generate image using Dream Studio
  const generateImages = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!isDreamStudioKeyAvailable) {
      toast.error("Dream Studio API key not available", {
        description: "Please contact your administrator to add a Dream Studio API key"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Use Dream Studio API via Supabase Edge Function
      const image = await generateDreamStudioImage({
        prompt,
        aspectRatio: size,
        stylePreset: style,
        outputFormat: 'webp'
      });
      
      if (image) {
        setImages([image]);
        saveImageToHistory(image, prompt);
        toast.success("Image generated successfully");
      } else {
        throw new Error("Failed to generate image with Dream Studio");
      }
    } catch (error) {
      console.error("Error generating images:", error);
      toast.error("Failed to generate images", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const viewImage = (image: { url: string, prompt: string }) => {
    setSelectedImage(image);
  };
  
  const deleteImage = (index: number) => {
    const updatedHistory = [...imageHistory];
    updatedHistory.splice(index, 1);
    setImageHistory(updatedHistory);
    localStorage.setItem('image_history', JSON.stringify(updatedHistory));
    toast.success("Image removed from history");
    
    // If this was the selected image, close the modal
    if (selectedImage && selectedImage.url === imageHistory[index].url) {
      setSelectedImage(null);
    }
  };

  // Render individual image card for the generated image
  const ImageCard = ({ image, index }: { image: string, index: number }) => (
    <Card key={index} className="overflow-hidden hover-scale">
      <div 
        className="relative aspect-square cursor-pointer"
        onClick={() => viewImage({ url: image, prompt })}
      >
        <img 
          src={image} 
          alt={`Generated image ${index + 1}`} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2 flex gap-2 justify-end">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(image);
            toast.success("Image URL copied to clipboard");
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const a = document.createElement('a');
            a.href = image;
            a.download = `generated-image-${Date.now()}.webp`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({
                  title: 'AI Generated Image',
                  text: prompt,
                  url: image,
                });
              } catch (error) {
                console.error('Error sharing:', error);
              }
            } else {
              navigator.clipboard.writeText(image);
              toast.info("Sharing not supported, URL copied instead");
            }
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  // Render thumbnail for history
  const ImageThumbnail = ({ image, index }: { image: { url: string, prompt: string }, index: number }) => (
    <div 
      className="relative aspect-square cursor-pointer rounded-md overflow-hidden border border-border hover:border-primary transition-colors"
      onClick={() => viewImage(image)}
    >
      <img 
        src={image.url} 
        alt={`History image ${index + 1}`} 
        className="w-full h-full object-cover"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col overflow-hidden scrollbar-none">
      {/* Header with pt-14 to account for fixed header space */}
      <Header 
        selectedModel={selectedModel} 
        onNewChatClick={() => {
          setPrompt('');
          setImages([]);
        }}
        onModelSelectClick={() => {}} // Add the missing prop
      />
      
      <div className="container mx-auto p-4 pt-16 flex-1 overflow-y-auto scrollbar-none">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">AI Image Generator</h1>
        </div>
        
        <Tabs defaultValue="generate" className="mb-6">
          <TabsList>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      generateImages();
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="prompt">Your Prompt</Label>
                        <Textarea 
                          id="prompt"
                          placeholder="Describe the image you want to create..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="resize-none h-32 scrollbar-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Aspect Ratio</Label>
                        <Select 
                          value={size} 
                          onValueChange={setSize}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select aspect ratio" />
                          </SelectTrigger>
                          <SelectContent>
                            {DREAM_STUDIO_ASPECT_RATIOS.map(ratio => (
                              <SelectItem key={ratio.value} value={ratio.value}>{ratio.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Style Preset</Label>
                        <Select 
                          value={style} 
                          onValueChange={setStyle}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select style (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (Default)</SelectItem>
                            {DREAM_STUDIO_STYLE_PRESETS.map(preset => (
                              <SelectItem key={preset.value} value={preset.value}>{preset.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading || !prompt.trim()}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate
                          </>
                        )}
                      </Button>
                      
                      {!isDreamStudioKeyAvailable && (
                        <div className="text-amber-600 dark:text-amber-400 text-sm text-center">
                          Dream Studio API key not available. Please contact your administrator.
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                {loading ? (
                  <ImageGenerationLoading className="bg-background/20 backdrop-blur-sm rounded-lg border-2 border-dashed border-border" />
                ) : images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((img, index) => (
                      <ImageCard key={index} image={img} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed rounded-lg p-12">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto opacity-50 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No images generated yet</h3>
                      <p className="text-muted-foreground">
                        Enter a prompt and click 'Generate' to create AI-powered images
                      </p>
                      
                      {!isDreamStudioKeyAvailable && (
                        <div className="mt-4 text-amber-600 dark:text-amber-400">
                          Dream Studio API key not configured. Contact your administrator.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            {imageHistory.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {imageHistory.map((img, index) => (
                  <ImageThumbnail key={index} image={img} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border-2 border-dashed rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto opacity-50 mb-4" />
                <h3 className="text-xl font-medium mb-2">No image history</h3>
                <p className="text-muted-foreground">
                  Generated images will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Image viewer modal */}
      {selectedImage && (
        <ImageViewer
          open={!!selectedImage}
          onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}
          image={selectedImage.url}
          prompt={selectedImage.prompt}
          onDelete={
            // Find the index of the selected image to delete it
            () => {
              const index = imageHistory.findIndex(img => img.url === selectedImage.url);
              if (index !== -1) {
                deleteImage(index);
                setSelectedImage(null);
              }
            }
          }
        />
      )}
    </div>
  );
};

export default ImageGenerator;
