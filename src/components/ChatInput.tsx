
import { FormEvent, useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Sparkles, Code, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { AIModel } from '@/data/models';

interface ChatInputProps {
  onSendMessage: (message: string, imageUrls?: string[]) => void;
  disabled: boolean;
  placeholder?: string;
  isChatMode: boolean;
  onToggleChatMode: () => void;
  onEnhancePrompt?: (prompt: string) => string;
  selectedModel?: AIModel;
}

const ChatInput = ({ 
  onSendMessage, 
  disabled, 
  placeholder = "Type your message...", 
  isChatMode,
  onToggleChatMode,
  onEnhancePrompt,
  selectedModel
}: ChatInputProps) => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [enhanceDialogOpen, setEnhanceDialogOpen] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [showVisionWarning, setShowVisionWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim(), images);
      setInput('');
      setImages([]);
      setShowVisionWarning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Limit to 2 images
    if (images.length + files.length > 2) {
      alert("You can only upload a maximum of 2 images");
      return;
    }
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
          
          // Show warning if we have images but not using a vision-capable model
          if (selectedModel && !selectedModel.visionCapable) {
            setShowVisionWarning(true);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setShowVisionWarning(false);
      }
      return updated;
    });
  };
  
  const handleEnhanceClick = () => {
    if (onEnhancePrompt && input.trim()) {
      const enhanced = onEnhancePrompt(input);
      setEnhancedPrompt(enhanced);
      setEnhanceDialogOpen(true);
    }
  };
  
  const useEnhancedPrompt = () => {
    setInput(enhancedPrompt);
    setEnhanceDialogOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-4 sticky bottom-0 bg-background pb-2">
        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {images.map((img, index) => (
              <div key={index} className="relative w-16 h-16 rounded overflow-hidden border">
                <img 
                  src={img} 
                  alt={`Uploaded ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-black/50 text-white w-5 h-5 flex items-center justify-center rounded-bl"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Vision model warning */}
        {showVisionWarning && (
          <div className="text-amber-600 text-xs mb-2 px-2 py-1 bg-amber-100 rounded-md">
            You've added images. Consider switching to a vision-capable model like Llama 4 or Gemini for better results.
          </div>
        )}
        
        <div className="flex-col max-w-3xl mx-auto">
          {/* Mode toggle and image button above input in row */}
          <div className="flex justify-between items-center py-2">
            <Toggle
              pressed={isChatMode}
              onPressedChange={onToggleChatMode}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-8"
              title={isChatMode ? "Switch to Code Mode" : "Switch to Chat Mode"}
            >
              {isChatMode ? (
                <>
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </>
              ) : (
                <>
                  <Code className="h-4 w-4" />
                  <span>Code</span>
                </>
              )}
            </Toggle>
            
            {isChatMode && images.length < 2 && (
              <>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  multiple
                  max={2}
                />
                <Button 
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-4 w-4" />
                  <span className="text-xs">Add Image</span>
                </Button>
              </>
            )}
          </div>
          
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="resize-none min-h-[60px] rounded-lg pl-4 pr-14"
              disabled={disabled}
            />
            
            <div className="absolute right-2 bottom-2 flex space-x-1">
              {!isChatMode && input.trim() && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={handleEnhanceClick}
                  title="Enhance Prompt"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                disabled={!input.trim() || disabled}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-4 w-4"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Enhanced Prompt Dialog */}
      <Dialog open={enhanceDialogOpen} onOpenChange={setEnhanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enhanced Prompt</DialogTitle>
            <DialogDescription>
              The AI has enhanced your prompt to help generate better code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-secondary/20 rounded-md text-sm">
            {enhancedPrompt}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setEnhanceDialogOpen(false)}>Cancel</Button>
            <Button onClick={useEnhancedPrompt}>Use Enhanced Prompt</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatInput;
