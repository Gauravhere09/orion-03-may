
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { useModelStore } from '@/stores/modelStore';
import { Loader2, Download, Copy, Share2, Image as ImageIcon, Wand2, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { generateDreamStudioImage, DREAM_STUDIO_STYLE_PRESETS, DREAM_STUDIO_ASPECT_RATIOS } from '@/services/dreamStudioService';
import ApiKeyModal from '@/components/ApiKeyModal';
import { useAuth } from '@/contexts/AuthContext';
import { listApiKeyServices } from '@/services/apiKeyService';

const ImageGenerator = () => {
  const { selectedModel } = useModelStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1:1');
  const [style, setStyle] = useState('');
  const [count, setCount] = useState(1);
  const [quality, setQuality] = useState(75);
  const [generator, setGenerator] = useState<'openrouter' | 'dream_studio'>('openrouter');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const { user } = useAuth();

  // Check available API keys
  useEffect(() => {
    if (user) {
      // If logged in, check which API services are available in Supabase
      const checkAvailableServices = async () => {
        const services = await listApiKeyServices();
        setAvailableServices(services);
      };
      checkAvailableServices();
    } else {
      // If not logged in, check localStorage
      const openrouterAvailable = localStorage.getItem('openrouter_api_keys') !== null;
      const geminiAvailable = localStorage.getItem('gemini_api_key') !== null;
      const dreamStudioAvailable = localStorage.getItem('dream_studio_api_key') !== null;
      
      const services = [];
      if (openrouterAvailable) services.push('openrouter');
      if (geminiAvailable) services.push('gemini');
      if (dreamStudioAvailable) services.push('dream_studio');
      
      setAvailableServices(services);
    }
  }, [user]);

  // Generate images based on selected generator
  const generateImages = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    try {
      if (generator === 'dream_studio') {
        // Use Dream Studio API via Supabase Edge Function
        const image = await generateDreamStudioImage({
          prompt,
          aspectRatio: size,
          stylePreset: style || undefined,
          outputFormat: 'webp'
        });
        
        if (image) {
          setImages([image]);
        } else {
          throw new Error("Failed to generate image with Dream Studio");
        }
      } else {
        // Fallback to placeholder images for OpenRouter
        // In a real implementation, this would call OpenRouter's API
        toast.info("Using placeholder images", { 
          description: "Connect Dream Studio for AI-generated images" 
        });
        
        setTimeout(() => {
          // Use placeholder images
          const generatedImages = Array(count)
            .fill(0)
            .map((_, i) => `https://source.unsplash.com/random/1024x1024?${encodeURIComponent(prompt)}&sig=${Date.now() + i}`);
          
          setImages(generatedImages);
        }, 2000);
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
  
  const downloadImage = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-image-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const copyImage = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Image URL copied to clipboard"))
      .catch(() => toast.error("Failed to copy image URL"));
  };

  const handleModelSelect = () => {
    // Show model selection dialog
  };
  
  const handleNewProject = () => {
    // Reset the form and generated images
    setPrompt('');
    setImages([]);
  };

  const handleApiKeyModalOpen = () => {
    setApiKeyModalOpen(true);
  };

  const handleApiKeySaved = () => {
    // Refresh available services
    if (user) {
      const checkAvailableServices = async () => {
        const services = await listApiKeyServices();
        setAvailableServices(services);
      };
      checkAvailableServices();
    } else {
      // If not logged in, check localStorage
      const openrouterAvailable = localStorage.getItem('openrouter_api_keys') !== null;
      const geminiAvailable = localStorage.getItem('gemini_api_key') !== null;
      const dreamStudioAvailable = localStorage.getItem('dream_studio_api_key') !== null;
      
      const services = [];
      if (openrouterAvailable) services.push('openrouter');
      if (geminiAvailable) services.push('gemini');
      if (dreamStudioAvailable) services.push('dream_studio');
      
      setAvailableServices(services);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        selectedModel={selectedModel} 
        onModelSelectClick={handleModelSelect}
        onNewChatClick={handleNewProject}
      />
      
      <div className="container mx-auto p-4 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">AI Image Generator</h1>
          <Button variant="outline" size="icon" onClick={handleApiKeyModalOpen}>
            <Settings className="h-4 w-4" />
          </Button>
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
                        <Label>Image Generator</Label>
                        <Select 
                          value={generator} 
                          onValueChange={(value) => setGenerator(value as 'openrouter' | 'dream_studio')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select generator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="openrouter">OpenRouter (Placeholder)</SelectItem>
                            <SelectItem value="dream_studio" disabled={!availableServices.includes('dream_studio')}>
                              Dream Studio (Stability AI)
                              {!availableServices.includes('dream_studio') && " - Add API key"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {!availableServices.includes('dream_studio') && generator === 'dream_studio' && (
                          <div className="text-sm text-amber-600 dark:text-amber-400">
                            You need to add a Dream Studio API key to use this generator
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="prompt">Your Prompt</Label>
                        <Textarea 
                          id="prompt"
                          placeholder="Describe the image you want to create..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="resize-none h-32"
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
                      
                      {generator === 'dream_studio' && (
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
                              <SelectItem value="">None (Default)</SelectItem>
                              {DREAM_STUDIO_STYLE_PRESETS.map(preset => (
                                <SelectItem key={preset.value} value={preset.value}>{preset.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {generator === 'openrouter' && (
                        <>
                          <div className="space-y-2">
                            <Label>Number of Images: {count}</Label>
                            <Slider 
                              min={1} 
                              max={4} 
                              step={1}
                              value={[count]}
                              onValueChange={(values) => setCount(values[0])}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Quality: {quality}%</Label>
                            <Slider 
                              min={25} 
                              max={100} 
                              step={25}
                              value={[quality]}
                              onValueChange={(values) => setQuality(values[0])}
                            />
                          </div>
                        </>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading || !prompt.trim() || (generator === 'dream_studio' && !availableServices.includes('dream_studio'))}
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
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                {images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((img, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="relative aspect-square">
                          <img 
                            src={img} 
                            alt={`Generated image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyImage(img)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadImage(img)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
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
                      
                      {!availableServices.some(s => ['openrouter', 'dream_studio'].includes(s)) && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={handleApiKeyModalOpen}
                        >
                          Add API Key to Get Started
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="text-center p-8">
              <h3 className="text-xl font-medium">Image History</h3>
              <p className="text-muted-foreground mt-2">
                Your generated images will be saved here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <ApiKeyModal 
        open={apiKeyModalOpen} 
        onOpenChange={setApiKeyModalOpen}
        onApiKeySaved={handleApiKeySaved}
      />
    </div>
  );
};

export default ImageGenerator;
