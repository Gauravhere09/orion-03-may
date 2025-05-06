
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share2, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: string;
  prompt: string;
  onDelete?: () => void;
}

const ImageViewer = ({ open, onOpenChange, image, prompt, onDelete }: ImageViewerProps) => {
  const copyImage = () => {
    navigator.clipboard.writeText(image)
      .then(() => toast.success("Image URL copied to clipboard"))
      .catch(() => toast.error("Failed to copy image URL"));
  };
  
  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = image;
    a.download = `generated-image-${Date.now()}.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const shareImage = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: prompt,
          url: image,
        });
        toast.success("Shared successfully");
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error("Failed to share image");
      }
    } else {
      copyImage();
      toast.info("Sharing not supported, URL copied instead");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-auto sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Generated Image</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-hidden">
          <img src={image} alt="AI Generated" className="w-full h-auto object-contain" />
        </div>
        
        <div className="mt-2 bg-secondary/10 p-2 rounded-md max-h-24 overflow-y-auto scrollbar-none">
          <p className="text-sm">{prompt}</p>
        </div>
        
        <DialogFooter className="flex justify-between items-center mt-4 gap-2">
          <div className="flex-1">
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyImage}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadImage}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={shareImage}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
