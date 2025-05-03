
import { FormEvent, useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Sparkles, Code, MessageSquare, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { AIModel } from '@/data/models';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

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

  // Fixed positioning for mobile devices
  const inputContainerClasses = isMobile 
    ? "fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50" 
    : "mb-4 sticky bottom-0 bg-background pb-2";

  return (
    <>
      <form onSubmit={handleSubmit} className={`${inputContainerClasses} px-1 py-1`}>
        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {images.map((img, index) => (
              <div key={index} className="relative w-20 h-20 rounded overflow-hidden border border-primary/20">
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
          <div className="text-amber-600 dark:text-amber-400 text-xs mb-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-md">
            You've added images. Consider switching to a vision-capable model like Llama 4 or Gemini for better results.
          </div>
        )}
        
        <div className="flex-col max-w-3xl mx-auto glass-morphism rounded-xl p-2">
          {/* Mode toggle and image button above input in row */}
          <div className="flex justify-start gap-2 items-center py-2">
            <Toggle
              pressed={isChatMode}
              onPressedChange={onToggleChatMode}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7 border-primary/20"
              title={isChatMode ? "Switch to Code Mode" : "Switch to Chat Mode"}
            >
              {isChatMode ? (
                <>
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat</span>
                </>
              ) : (
                <>
                  <Code className="h-3.5 w-3.5" />
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
                  className="flex items-center gap-1 h-7 border-gray-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-3.5 w-3.5" />
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
              className="resize-none min-h-[20px] max-h-[120px] rounded-2xl pl-2 pr-4 border-primary/20 focus:ring-primary/30 overflow-y-scroll scrollbar-none"
              disabled={disabled}
              style={{
                height: 'auto',
                maxHeight: '100px',
                overflow: 'auto',
                resize: 'none',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            
            <div className="absolute right-3 bottom-2.5 flex space-x-1">
              {!isChatMode && input.trim() && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-primary/30"
                  onClick={handleEnhanceClick}
                  title="Enhance Prompt"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                type="submit" 
                size="icon" 
                className="h-8 w-8 rounded-full cyan-glow flex items-center justify-center"
                disabled={!input.trim() || disabled}
              >
                <Send className="h-12 w-12 stroke-[3]" />
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Enhanced Prompt Dialog */}
      <Dialog open={enhanceDialogOpen} onOpenChange={setEnhanceDialogOpen}>
        <DialogContent className="glass-morphism">
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
            <Button onClick={useEnhancedPrompt} className="cyan-glow">Use Enhanced Prompt</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatInput;
