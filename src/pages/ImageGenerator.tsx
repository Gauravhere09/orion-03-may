
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { useModelStore } from '@/stores/modelStore';
import { Loader2, Download, Copy, Share2, Image as ImageIcon, Wand2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ImageGenerator = () => {
  const { selectedModel } = useModelStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [style, setStyle] = useState('vivid');
  const [count, setCount] = useState(1);
  const [quality, setQuality] = useState(75);

  // Placeholder function for generating images
  const generateImages = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    
    try {
      // Simulate image generation
      setTimeout(() => {
        // Use placeholder images for now
        const generatedImages = Array(count)
          .fill(0)
          .map((_, i) => `https://source.unsplash.com/random/1024x1024?sig=${Date.now() + i}`);
        
        setImages(generatedImages);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error generating images:", error);
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
    navigator.clipboard.writeText(url);
  };

  const handleModelSelect = () => {
    // Show model selection dialog
  };
  
  const handleNewProject = () => {
    // Reset the form and generated images
    setPrompt('');
    setImages([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        selectedModel={selectedModel} 
        onModelSelectClick={handleModelSelect}
        onNewChatClick={handleNewProject}
      />
      
      <div className="container mx-auto p-4 flex-1">
        <h1 className="text-3xl font-bold mb-6">AI Image Generator</h1>
        
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
                      className="resize-none h-32"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Image Size</Label>
                    <Select 
                      value={size} 
                      onValueChange={setSize}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">1024 x 1024 (Square)</SelectItem>
                        <SelectItem value="1024x1792">1024 x 1792 (Portrait)</SelectItem>
                        <SelectItem value="1792x1024">1792 x 1024 (Landscape)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Style</Label>
                    <Select 
                      value={style} 
                      onValueChange={setStyle}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vivid">Vivid</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="digital-art">Digital Art</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
