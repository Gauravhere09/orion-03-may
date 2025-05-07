
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { generateDreamStudioImage, DREAM_STUDIO_ASPECT_RATIOS, DREAM_STUDIO_STYLE_PRESETS } from '@/services/dreamStudioService';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ImageViewer from '@/components/ImageViewer';
import ImageGenerationLoading from '@/components/ImageGenerationLoading';
import MainLayout from '@/layouts/MainLayout';
import { Loader2, Save } from 'lucide-react';

interface SavedImage {
  id: string;
  prompt: string;
  url: string;
  createdAt: string;
}

const FormSchema = z.object({
  prompt: z
    .string()
    .min(3, {
      message: 'Prompt must be at least 3 characters.',
    })
    .max(1000, {
      message: 'Prompt must not exceed 1000 characters.',
    }),
  aspectRatio: z.string().default('1:1'),
  stylePreset: z.string().default('none'),
});

interface ImageGeneratorProps {
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const ImageGenerator = ({ authModalOpen, setAuthModalOpen }: ImageGeneratorProps) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt: '',
      aspectRatio: '1:1',
      stylePreset: 'none',
    },
  });

  // For the main layout
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Load saved images from local storage or API
  useEffect(() => {
    const loadSavedImages = async () => {
      setIsLoadingSaved(true);
      try {
        // Replace with actual API call to get saved images from Supabase
        const savedImagesData = localStorage.getItem('saved_images');
        const images = savedImagesData ? JSON.parse(savedImagesData) : [];
        setSavedImages(images);
      } catch (error) {
        console.error('Error loading saved images:', error);
      } finally {
        setIsLoadingSaved(false);
      }
    };

    loadSavedImages();
  }, [user]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsGenerating(true);
    
    try {
      const image = await generateDreamStudioImage({
        prompt: data.prompt,
        aspectRatio: data.aspectRatio,
        stylePreset: data.stylePreset === 'none' ? undefined : data.stylePreset,
      });
      
      setGeneratedImage(image);
      
      if (!image) {
        toast.error("Failed to generate image", {
          description: "Please check your API key and try again."
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error("Failed to generate image", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const saveCurrentImage = () => {
    if (!generatedImage) return;
    
    const newImage: SavedImage = {
      id: Date.now().toString(),
      prompt: form.getValues('prompt'),
      url: generatedImage,
      createdAt: new Date().toISOString(),
    };
    
    const updatedSavedImages = [newImage, ...savedImages];
    setSavedImages(updatedSavedImages);
    
    // Save to local storage temporarily (replace with API call)
    localStorage.setItem('saved_images', JSON.stringify(updatedSavedImages));
    
    toast.success("Image saved successfully");
  };

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  return (
    <MainLayout
      apiKeyModalOpen={apiKeyModalOpen}
      onApiKeyModalOpenChange={setApiKeyModalOpen}
      isPreviewMode={isPreviewMode}
      onExitPreview={handleExitPreview}
      authModalOpen={authModalOpen}
      setAuthModalOpen={setAuthModalOpen}
    >
      <div className="container py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Image Generator</h1>
          <p className="text-muted-foreground">Create stunning AI-generated images with simple text prompts</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create">Create Image</TabsTrigger>
            <TabsTrigger value="saved">Saved Images</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the image you want to generate..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="aspectRatio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aspect Ratio</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select aspect ratio" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DREAM_STUDIO_ASPECT_RATIOS.map((ratio) => (
                                  <SelectItem key={ratio.value} value={ratio.value}>
                                    {ratio.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="stylePreset"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Style Preset</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">No Style</SelectItem>
                                {DREAM_STUDIO_STYLE_PRESETS.map((style) => (
                                  <SelectItem key={style.value} value={style.value}>
                                    {style.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <Button type="submit" className="cyan-glow" disabled={isGenerating}>
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          'Generate Image'
                        )}
                      </Button>
                      
                      {generatedImage && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={saveCurrentImage}
                          disabled={isGenerating}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save Image
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </div>
              
              <div>
                {isGenerating ? (
                  <ImageGenerationLoading visible={true} />
                ) : generatedImage ? (
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <ImageViewer imageUrl={generatedImage} alt="Generated image" />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="border rounded-lg flex items-center justify-center aspect-square bg-muted/20">
                    <p className="text-muted-foreground text-center p-8">
                      Your generated image will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t text-center">
              <h3 className="text-lg font-medium mb-3">Support Us</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                If you find this AI image generator helpful, consider supporting our development efforts
              </p>
              <Button
                variant="outline"
                className="bg-[#ffdd00] text-black hover:bg-[#ffcc00] border-[#ffcc00]"
                onClick={() => window.open('https://www.buymeacoffee.com', '_blank')}
              >
                Buy me a coffee
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="saved">
            {isLoadingSaved ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : savedImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden hover-scale">
                    <CardContent className="p-0">
                      <ImageViewer 
                        imageUrl={image.url} 
                        alt={image.prompt}
                        caption={image.prompt} 
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-lg bg-muted/10">
                <h3 className="text-xl font-medium mb-2">No saved images</h3>
                <p className="text-muted-foreground">
                  Generate and save images to see them here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ImageGenerator;
