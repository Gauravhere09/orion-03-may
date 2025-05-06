
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateDreamStudioImage, DREAM_STUDIO_STYLE_PRESETS, DREAM_STUDIO_ASPECT_RATIOS } from '@/services/dreamStudioService';
import { Label } from '@/components/ui/label';
import ImageGenerationLoading from '@/components/ImageGenerationLoading';
import ImageViewer from '@/components/ImageViewer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import Header from '@/components/Header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIModel } from '@/data/models';
import { Separator } from '@/components/ui/separator';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

// Mock selected model just for the header component
const mockModel: AIModel = {
  id: 'dream_studio',
  name: 'Dream Studio',
  provider: 'stability',
  openRouterModel: '',
  supportsStreaming: false,
  supportsImages: true
};

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stylePreset, setStylePreset] = useState<string>('photographic');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Load previously generated images from localStorage
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem('generatedImages');
      if (savedImages) {
        setGeneratedImages(JSON.parse(savedImages));
      }
    } catch (error) {
      console.error('Error loading generated images:', error);
    }
  }, []);

  // Save generated images to localStorage
  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem('generatedImages', JSON.stringify(generatedImages));
    }
  }, [generatedImages]);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setImages([]);

    try {
      const imageData = await generateDreamStudioImage({
        prompt,
        stylePreset,
        aspectRatio,
      });

      if (imageData) {
        const newImage: GeneratedImage = {
          id: `img-${Date.now()}`,
          url: imageData,
          prompt,
          timestamp: Date.now(),
        };
        
        setImages([newImage]);
        
        // Add to history
        setGeneratedImages(prev => [newImage, ...prev].slice(0, 20)); // Keep only the last 20 images
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <>
      <Header 
        selectedModel={mockModel}
        onNewChatClick={() => {
          setPrompt('');
          setImages([]);
        }}
        onModelSelectClick={() => {}} // Add the missing prop
      />
      
      <div className="container mx-auto p-4 pt-16 flex-1 overflow-y-auto scrollbar-none">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 h-full">
          {/* Main content */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border p-6">
              <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-500" /> Image Generator
              </h1>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt" className="mb-2 block">Prompt</Label>
                  <Textarea 
                    id="prompt"
                    placeholder="Describe the image you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="style" className="mb-2 block">Style</Label>
                    <Select value={stylePreset} onValueChange={setStylePreset}>
                      <SelectTrigger id="style">
                        <SelectValue placeholder="Select a style" />
                      </SelectTrigger>
                      <SelectContent>
                        {DREAM_STUDIO_STYLE_PRESETS.map(style => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="aspect-ratio" className="mb-2 block">Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger id="aspect-ratio">
                        <SelectValue placeholder="Select an aspect ratio" />
                      </SelectTrigger>
                      <SelectContent>
                        {DREAM_STUDIO_ASPECT_RATIOS.map(ratio => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleGenerateImage} 
                    disabled={isGenerating || !prompt.trim()} 
                    className="bg-cyan-500 hover:bg-cyan-600"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Image'}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl border flex-1">
              <div className="p-6 flex-1">
                <h2 className="text-lg font-semibold mb-4">Preview</h2>
                <div className="rounded-lg overflow-hidden">
                  <ImageGenerationLoading visible={isGenerating} />
                  
                  {!isGenerating && images.length === 0 && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center min-h-[300px]">
                      <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        No image generated yet. Enter a prompt and click Generate.
                      </p>
                    </div>
                  )}
                  
                  {!isGenerating && images.length > 0 && (
                    <div className="grid gap-4">
                      {images.map(image => (
                        <ImageViewer 
                          key={image.id} 
                          imageUrl={image.url} 
                          prompt={image.prompt}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Support Us Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-600">Support Our Work</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    If you like this tool, consider buying us a coffee!
                  </p>
                </div>
                <a 
                  href="https://www.buymeacoffee.com/orionai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-black rounded-md hover:bg-[#FFDD00]/90 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 884 1279" fill="none">
                    <path d="M791.109 297.518L790.231 297.002L788.201 296.383C789.018 297.072 790.04 297.472 791.109 297.518Z" fill="#0D0C22"></path>
                    <path d="M803.896 388.891L802.916 389.166L803.896 388.891Z" fill="#0D0C22"></path>
                    <path d="M791.484 297.377C791.359 297.361 791.237 297.332 791.118 297.29C791.111 297.371 791.111 297.453 791.118 297.534C791.252 297.516 791.379 297.462 791.484 297.377Z" fill="#0D0C22"></path>
                    <path d="M791.113 297.529H791.244V297.447L791.113 297.529Z" fill="#0D0C22"></path>
                    <path d="M803.111 388.726L804.591 387.883L805.142 387.573L805.641 387.04C804.702 387.444 803.846 388.016 803.111 388.726Z" fill="#0D0C22"></path>
                    <path d="M793.669 299.515L792.223 298.138L791.243 297.605C791.77 298.535 792.641 299.221 793.669 299.515Z" fill="#0D0C22"></path>
                    <path d="M430.019 1186.18C428.864 1186.68 427.852 1187.46 427.076 1188.45L427.988 1187.87C428.608 1187.3 429.485 1186.63 430.019 1186.18Z" fill="#0D0C22"></path>
                    <path d="M641.187 1144.63C641.187 1143.33 640.551 1143.57 640.705 1148.21C640.705 1147.84 640.86 1147.46 640.929 1147.1C641.015 1146.27 641.084 1145.46 641.187 1144.63Z" fill="#0D0C22"></path>
                    <path d="M619.284 1186.18C618.129 1186.68 617.118 1187.46 616.342 1188.45L617.254 1187.87C617.873 1187.3 618.751 1186.63 619.284 1186.18Z" fill="#0D0C22"></path>
                    <path d="M281.304 1196.06C280.427 1195.3 279.354 1194.8 278.207 1194.61C279.136 1195.06 280.065 1195.51 280.684 1195.85L281.304 1196.06Z" fill="#0D0C22"></path>
                    <path d="M247.841 1164.01C247.704 1162.66 247.288 1161.35 246.619 1160.16C247.093 1161.39 247.489 1162.66 247.806 1163.94L247.841 1164.01Z" fill="#0D0C22"></path>
                    <path d="M472.623 590.836C426.682 583.931 377.504 620.928 372.844 671.145C369.754 705.343 374.675 736.852 373.055 771.049C371.44 805.246 361.059 843.96 332.451 853.856C320.976 858.126 308.264 859.399 296.765 863.326C262.173 875.357 247.763 911.844 248.42 944.755C252.528 1043.59 255.894 1150.78 316.947 1223.79C329.603 1239.76 344.744 1252.16 351.623 1272.28C362.782 1302.71 351.528 1342.7 363.018 1373.09C375.428 1406.15 420.638 1415.36 451.061 1433.81C478.708 1450.1 503.72 1472.65 511.036 1503.17C517.741 1530.83 511.587 1561.44 526.222 1584C526.709 1584.1 527.201 1584.17 527.698 1584.2C543.771 1571.96 555.346 1554.04 560.64 1534.19C570.222 1497.6 564.182 1459.05 557.593 1421.84C552.512 1393.33 547.47 1364.33 552.666 1335.9C556.345 1315.87 565.69 1297.27 572.672 1277.83C591.031 1222.51 578.233 1162.33 579.862 1104.61C581.623 1042.38 604.821 977.822 583.829 921.345C571.094 884.61 533.598 862.29 563.064 826.812C570.594 815.68 580.337 805.191 583.504 791.72C588.145 771.421 576.635 751.762 567.247 733.621C534.45 672.218 545.939 601.69 496.059 549.614C509.583 635.539 344.94 588.241 472.623 590.836Z" fill="#FFDD00"></path>
                    <path d="M711.885 1134.56C693.098 1129.98 669.548 1125.5 656.179 1113.04C637.529 1095.93 647.304 1042.39 647.304 1019.07C647.304 992.33 643.158 977.61 651.239 951.522C654.807 939.034 654.845 926.151 654.576 913.209C654.299 899.982 651.239 880.952 654.942 868.19C655.459 856.728 659.855 846.342 659.855 834.87C659.855 823.398 654.439 812.479 654.439 801.718C654.439 781.179 661.573 762.788 673.241 746.645C683.809 732.333 694.638 719.545 702.23 703.303C709.963 686.674 715.341 666.482 724.323 650.647C736.674 628.294 747.247 606.377 761.478 585.22C773.242 568.228 773.549 544.89 791.724 534.983C796.912 531.781 802.261 529.376 806.388 525.26C818.88 512.79 818.312 495.178 821.283 478.579C824.482 460.581 822.453 441.6 823.926 423.585C824.84 412.868 826.516 401.905 829.761 391.63C833.222 380.817 836.189 369.949 840.429 359.373C849.2 336.807 857.007 314.845 861.519 290.647C866.393 264.602 868.773 238.303 869.211 212.213C869.626 187.521 868.206 163.089 863.826 138.683C859.762 116.057 854.958 94.4301 848.174 72.52C847.471 70.2106 837.418 48.0804 841.185 46.9691C833.634 41.1387 824.228 39.7669 815.352 36.7424C784.298 26.9168 751.606 20.8736 719.383 17.1655C670.233 11.536 620.832 10.8478 571.462 15.1063C519.779 19.627 469.011 29.5797 419.401 46.2739C392.867 55.3398 367.566 67.4737 342.604 80.1959C329.586 86.7531 317.639 94.9777 305.996 103.539C295.126 111.481 285.23 117.82 272.322 122.245C261.573 125.8 259.696 123.782 254.05 114.621C246.095 101.832 234.873 91.4777 221.435 85.1084C195.888 73.0698 159.219 71.4646 136.724 93.8536C115.974 114.585 116.531 147.876 125.759 174.021C133.499 195.452 147.422 213.841 164.882 228.103C173.468 235.216 183.71 240.371 192.827 246.724C206.456 256.035 212.414 264.462 212.414 281.424C212.414 313.299 212.414 345.173 212.414 377.047C212.414 399.469 210.992 421.88 213.569 444.178C215.509 460.812 220.098 473.971 230.968 487.055C240.768 498.823 251.814 514.233 255.422 529.574C261.553 555.21 241.675 583.918 229.555 603.682C214.717 628.185 201.763 647.654 182.068 668.689C177.614 673.41 172.678 677.713 167.849 682.284C148.943 700.147 143.342 719.094 143.342 746.232C143.342 775.883 143.342 805.535 143.342 835.186C143.342 861.551 143.792 883.909 129.33 907.12C122.532 917.757 114.775 929.159 112.809 942.081C110.163 959.548 119.752 971.03 130.398 983.648C153.986 1012.57 162.653 1054.96 175.729 1089.24C185.495 1114.84 198.134 1138.6 215.962 1159.39C233.315 1179.61 252.739 1200.39 281.308 1204.52C308.695 1208.45 334.783 1196.69 362.033 1192.43C387.926 1188.4 414.301 1190.17 440.602 1188.44C472.024 1186.34 503.891 1180.27 535.104 1176.81C562.272 1173.78 584.248 1187.03 599.67 1210.3C607.118 1221.54 616.14 1239.12 629.128 1244.61C642.114 1250.09 666.729 1239.56 680.585 1237.63C714.851 1232.94 756.156 1254.16 775.654 1216.02C801.166 1164.81 754.163 1143.49 711.885 1134.56Z" fill="#0D0C22"></path>
                  </svg>
                  <span>Buy Me a Coffee</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Sidebar with history */}
          <aside className="bg-white dark:bg-gray-900 rounded-xl border p-4 h-full">
            <h2 className="text-lg font-semibold mb-4">History</h2>
            
            {generatedImages.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                No images in history yet
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="grid gap-4">
                  {generatedImages.map(image => (
                    <div key={image.id} className="relative">
                      <div className="rounded-lg overflow-hidden aspect-square">
                        <ImageViewer 
                          imageUrl={image.url} 
                          prompt={image.prompt}
                          onDelete={() => deleteImage(image.id)} 
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {image.prompt}
                      </p>
                      <Separator className="my-3" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </aside>
        </div>
      </div>
    </>
  );
};

export default ImageGenerator;
