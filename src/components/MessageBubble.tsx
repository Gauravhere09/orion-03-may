
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Message } from "@/services/apiTypes";
import { getMessageText } from "@/services/api";
import { Copy, RefreshCw, Check, Eye, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useChatStore } from "@/stores/chatStore";
import Highlight from 'react-highlight';
import 'highlight.js/styles/night-owl.css';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useUiStore } from "@/stores/uiStore";

interface MessageBubbleProps {
  message: Message;
  messageIndex: number;
  onRegenerate?: () => void;
  onViewPreview?: () => void;
  modelName?: string;
  isChatMode: boolean;
  isSelected?: boolean;
  onSelectCode?: () => void;
  isLoading?: boolean;
}

const MessageBubble = ({ 
  message, 
  messageIndex,
  onRegenerate, 
  onViewPreview, 
  modelName, 
  isChatMode,
  isSelected = false,
  onSelectCode,
  isLoading = false
}: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);
  const { messageRatings = {}, rateMessage } = useChatStore();
  
  const messageRating = messageRatings[messageIndex];
  
  // Extract text content and images from the message
  const messageText = getMessageText(message.content);
  const messageImages = Array.isArray(message.content) 
    ? message.content.filter(c => c.type === 'image_url').map(c => (c as any).image_url.url) 
    : [];
    
  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleRegenerateConfirm = () => {
    if (onRegenerate) {
      onRegenerate();
    }
    setRegenerateDialogOpen(false);
  };
  
  const openImage = (url: string) => {
    setEnlargedImageUrl(url);
  };
  
  const hasCode = messageText.includes("```html") || 
                 messageText.includes("```css") || 
                 messageText.includes("```js") ||
                 messageText.includes("```javascript");
  
  const formatMessage = (content: string) => {
    return content.replace(
      /```(html|css|javascript|js)([\s\S]*?)```/g, 
      (match, language, code) => {
        return `<div class="mt-2 mb-2">
                  <div class="bg-secondary/50 text-xs px-3 py-1 rounded-t-md font-mono">${language}</div>
                  <pre class="language-${language} bg-secondary/30 p-3 overflow-x-auto rounded-b-md rounded-tr-md text-sm"><code>${code}</code></pre>
                </div>`;
      }
    );
  };
  
  // Determine which model generated this response - for AI messages only
  // Use the message's own model property if available, otherwise use the passed modelName prop
  const responseModel = !isUser ? (message.model || modelName) : undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col w-full mb-4 items-start">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm glass-morphism text-foreground rounded-tl-none">
          <p className="leading-relaxed">{messageText}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex flex-col w-full mb-4",
      isUser ? "items-end" : "items-start"
    )}>
      {/* Image thumbnails for user messages */}
      {isUser && messageImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 max-w-[85%]">
          {messageImages.map((url, idx) => (
            <div key={idx} className="relative rounded-md overflow-hidden border border-primary/20 cursor-pointer"
                 onClick={() => openImage(url)}>
              <img 
                src={url} 
                alt="User uploaded" 
                className="w-20 h-20 object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm relative group",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "glass-morphism text-foreground rounded-tl-none"
      )}>
        {isUser ? (
          <p>{messageText}</p>
        ) : (
          hasCode ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formatMessage(messageText) }} />
            </div>
          ) : (
            <p className="leading-relaxed">{messageText}</p>
          )
        )}
      </div>
      
      {/* Model info for AI messages */}
      {!isUser && responseModel && (
        <div className="mt-1 text-xs text-primary opacity-70">
          Generated by {responseModel}
        </div>
      )}
      
      {/* Show buttons for all AI messages */}
      {!isUser && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {/* Rating buttons (like/dislike) */}
          <div className="flex space-x-1.5">
            <Button 
              onClick={() => rateMessage(messageIndex, 'like')}
              size="sm"
              variant={messageRating === 'like' ? 'default' : 'secondary'}
              className="w-5 h-5 p-0"
              title="Like"
            >
              <ThumbsUp className="h-2.5 w-2.5" />
            </Button>
            
            <Button 
              onClick={() => rateMessage(messageIndex, 'dislike')}
              size="sm"
              variant={messageRating === 'dislike' ? 'destructive' : 'secondary'}
              className="w-5 h-5 p-0"
              title="Dislike"
            >
              <ThumbsDown className="h-2.5 w-2.5" />
            </Button>
          </div>
          
          {/* Copy button */}
          <Button 
            onClick={handleCopy}
            size="sm"
            variant="secondary"
            className="w-5 h-5 p-0"
            title="Copy"
          >
            {copied ? (
              <Check className="h-2.5 w-2.5" />
            ) : (
              <Copy className="h-2.5 w-2.5" />
            )}
          </Button>
          
          {/* Regenerate button */}
          {onRegenerate && (
            <Button 
              onClick={() => setRegenerateDialogOpen(true)}
              size="sm"
              variant="secondary" 
              className="w-5 h-5 p-0"
              title="Regenerate"
            >
              <RefreshCw className="h-2.5 w-2.5" />
            </Button>
          )}
          
          {/* Preview button for code responses regardless of mode */}
          {hasCode && onViewPreview && (
            <Button 
              onClick={onViewPreview}
              size="sm"
              variant="outline"
              className="flex items-center space-x-1 text-xs h-5 border-primary/20"
            >
              <Eye className="h-2.5 w-2.5 mr-1" />
              <span>Preview</span>
            </Button>
          )}
        </div>
      )}
      
      {/* Regenerate confirmation dialog */}
      <AlertDialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <AlertDialogContent className="glass-morphism">
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Response?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new response for your question. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerateConfirm} className="cyan-glow">Yes, Regenerate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Full image dialog */}
      <Dialog open={!!enlargedImageUrl} onOpenChange={() => setEnlargedImageUrl(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded-full"
              onClick={() => setEnlargedImageUrl(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center justify-center w-full h-full p-4">
              <img 
                src={enlargedImageUrl || ''} 
                alt="Full size" 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageBubble;
