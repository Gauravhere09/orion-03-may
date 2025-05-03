
import React, { useState, useRef, useEffect } from 'react';
import { Code, FileImage, PlusCircle, SendHorizonal, Send, MessageSquare, Wand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AIModel } from '@/data/models';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/sonner';

interface ChatInputProps {
  onSendMessage: (message: string, imageUrls?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  isChatMode: boolean;
  onToggleChatMode: () => void;
  onEnhancePrompt: (prompt: string) => string;
  selectedModel: AIModel;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type your message...',
  isChatMode,
  onToggleChatMode,
  onEnhancePrompt,
  selectedModel
}) => {
  const [message, setMessage] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [enhanceActive, setEnhanceActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [enhanceDrawerOpen, setEnhanceDrawerOpen] = useState(false);
  
  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleSend = () => {
    if (message.trim() === '' || disabled) {
      return;
    }

    const finalMessage = enhanceActive ? onEnhancePrompt(message) : message;
    onSendMessage(finalMessage, imageUrls);
    setMessage('');
    setImageUrls([]);
    setImagePreviewUrls([]);
    setEnhanceActive(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    // In a real app, you would upload these files to your server
    // Here we're just creating local object URLs as a demo
    const newPreviewUrls = Array.from(files).map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    
    // Simulate upload delay
    setTimeout(() => {
      setImageUrls([...imageUrls, ...newPreviewUrls]);
      setIsUploading(false);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast('Images attached successfully', {
        description: `${files.length} image(s) attached to your message.`
      });
    }, 1000);
  };
  
  const removeImage = (index: number) => {
    const newImageUrls = [...imageUrls];
    const newPreviewUrls = [...imagePreviewUrls];
    
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    newImageUrls.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setImageUrls(newImageUrls);
    setImagePreviewUrls(newPreviewUrls);
  };
  
  const handleEnhancePrompt = () => {
    if (isMobile) {
      setEnhanceDrawerOpen(true);
    } else {
      setEnhanceActive(!enhanceActive);
      if (!enhanceActive && message.trim() !== '') {
        const enhancedPrompt = onEnhancePrompt(message);
        setMessage(enhancedPrompt);
      }
    }
  };
  
  return (
    <div className="relative space-y-2">
      {/* Image Previews */}
      {imagePreviewUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {imagePreviewUrls.map((url, index) => (
            <div 
              key={index} 
              className="relative w-16 h-16 rounded-md overflow-hidden border border-border group"
            >
              <img 
                src={url} 
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Main Input Area */}
      <div className="flex items-end space-x-2 glass-morphism rounded-2xl pl-4 pr-2 py-2">
        <div className="flex-1 min-h-10">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-10 max-h-52 resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
          />
        </div>
        
        <div className="flex items-center gap-1 py-1">
          {/* Toggle between Chat and Code mode */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onToggleChatMode}
            disabled={disabled}
            title={isChatMode ? "Switch to Code Generation" : "Switch to Chat Mode"}
          >
            {isChatMode ? <Code className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </Button>
          
          {/* File upload button */}
          {selectedModel.supportsImages && isChatMode && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
                multiple
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                title="Attach images"
              >
                {isUploading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                ) : (
                  <FileImage className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          
          {/* Enhance prompt button (for code mode) */}
          {!isChatMode && (
            <>
              {isMobile ? (
                <Drawer open={enhanceDrawerOpen} onOpenChange={setEnhanceDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant={enhanceActive ? "default" : "ghost"}
                      className={`rounded-full h-8 w-8 ${enhanceActive ? "text-primary-foreground bg-cyan-600" : "text-muted-foreground hover:text-foreground"}`}
                      disabled={disabled}
                      title="Enhance prompt with additional details"
                    >
                      <Wand className="h-4 w-4" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="p-4 space-y-4">
                      <h3 className="text-lg font-medium">Enhance your prompt</h3>
                      <p className="text-sm text-muted-foreground">
                        This will add additional details to your prompt to help the AI generate better code.
                      </p>
                      <Button 
                        className="w-full bg-cyan-600" 
                        onClick={() => {
                          setEnhanceActive(true);
                          setEnhanceDrawerOpen(false);
                          const enhancedPrompt = onEnhancePrompt(message);
                          setMessage(enhancedPrompt);
                        }}
                      >
                        <Wand className="mr-2 h-4 w-4" />
                        Enhance Prompt
                      </Button>
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Button
                  type="button"
                  size="icon"
                  variant={enhanceActive ? "default" : "ghost"}
                  className={`rounded-full h-8 w-8 ${enhanceActive ? "text-primary-foreground bg-cyan-600" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={handleEnhancePrompt}
                  disabled={disabled}
                  title="Enhance prompt with additional details"
                >
                  <Wand className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
          
          {/* Send button */}
          <Button
            type="button"
            className={`rounded-full h-9 w-9 bg-cyan-600 hover:bg-cyan-700 text-white`}
            onClick={handleSend}
            disabled={disabled || message.trim() === ''}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
