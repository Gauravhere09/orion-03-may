
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Trash2, X } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  prompt?: string;
  onDelete?: () => void;
  alt?: string; // Added alt property
  caption?: string; // Added caption property
}

const ImageViewer = ({ imageUrl, prompt, onDelete, alt, caption }: ImageViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async () => {
    if (navigator.share) {
      try {
        // Convert image URL to blob for sharing
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'generated-image.png', { type: blob.type });
        
        await navigator.share({
          title: 'Generated Image',
          text: prompt || caption || 'Check out this AI generated image!',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing image:', error);
        // Fallback for browsers that don't support file sharing
        navigator.share({
          title: 'Generated Image',
          text: prompt || caption || 'Check out this AI generated image!',
          url: imageUrl
        });
      }
    } else {
      console.log('Web Share API not supported');
      // Copy image URL to clipboard as fallback
      navigator.clipboard.writeText(imageUrl);
      alert('Image URL copied to clipboard!');
    }
  };

  return (
    <>
      <div 
        className="overflow-hidden rounded-lg cursor-pointer hover:shadow-lg transition-all"
        onClick={() => setIsFullscreen(true)}
      >
        <img 
          src={imageUrl} 
          alt={alt || caption || prompt || "Generated"} 
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-4xl w-[90vw] p-1 bg-background rounded-xl">
          <div className="relative flex flex-col h-full">
            <div className="absolute top-2 right-2 z-10">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-black/30 hover:bg-black/50 text-white"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <img 
                src={imageUrl} 
                alt={alt || caption || prompt || "Generated"} 
                className="w-full h-auto object-contain"
              />
            </div>
            
            <div className="p-4 bg-background border-t">
              {(prompt || caption) && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {prompt || caption}
                </p>
              )}
              <div className="flex justify-end gap-2">
                {onDelete && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      onDelete();
                      setIsFullscreen(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                    Delete
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={shareImage}
                >
                  <Share2 className="mr-2 h-4 w-4 text-cyan-500" />
                  Share
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="bg-cyan-500 hover:bg-cyan-600"
                  onClick={downloadImage}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageViewer;
