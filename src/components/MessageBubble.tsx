
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Message, getMessageText } from "@/services/api";
import { Copy, RefreshCw, Check, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useChatStore } from "@/stores/chatStore";

interface MessageBubbleProps {
  message: Message;
  messageIndex: number;
  onRegenerate?: () => void;
  onViewPreview?: () => void;
  modelName?: string;
  isChatMode: boolean;
}

const MessageBubble = ({ 
  message, 
  messageIndex,
  onRegenerate, 
  onViewPreview, 
  modelName, 
  isChatMode 
}: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const messageText = getMessageText(message.content);
  const { messageRatings, rateMessage } = useChatStore();
  
  const messageRating = messageRatings[messageIndex];
  
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
  
  const hasCode = messageText.includes("```html") || 
                 messageText.includes("```css") || 
                 messageText.includes("```js") ||
                 messageText.includes("```javascript");
  
  const formattedContent = messageText.replace(
    /```(html|css|javascript|js)([\s\S]*?)```/g, 
    (match, language, code) => {
      return `<div class="mt-2 mb-2">
                <div class="bg-secondary/50 text-xs px-3 py-1 rounded-t-md font-mono">${language}</div>
                <pre class="bg-secondary/30 p-3 overflow-x-auto rounded-b-md rounded-tr-md text-sm"><code>${code}</code></pre>
              </div>`;
    }
  );
  
  return (
    <div className={cn(
      "flex flex-col w-full mb-4",
      isUser ? "items-end" : "items-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm relative group",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-secondary text-secondary-foreground rounded-tl-none"
      )}>
        {isUser ? (
          <p>{messageText}</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )}
      </div>
      
      {/* Model info for AI messages */}
      {!isUser && modelName && (
        <div className="mt-1 text-xs text-muted-foreground opacity-70">
          {modelName}
        </div>
      )}
      
      {/* Show buttons for all AI messages */}
      {!isUser && (
        <div className="flex flex-wrap gap-2 mt-2">
          {/* Rating buttons (like/dislike) */}
          <div className="flex space-x-2">
            <Button 
              onClick={() => rateMessage(messageIndex, 'like')}
              size="sm"
              variant={messageRating === 'like' ? 'default' : 'secondary'}
              className="w-8 h-8 p-0"
              title="Like"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            
            <Button 
              onClick={() => rateMessage(messageIndex, 'dislike')}
              size="sm"
              variant={messageRating === 'dislike' ? 'destructive' : 'secondary'}
              className="w-8 h-8 p-0"
              title="Dislike"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Copy button */}
          <Button 
            onClick={handleCopy}
            size="sm"
            variant="secondary"
            className="w-8 h-8 p-0"
            title="Copy"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          
          {/* Regenerate button */}
          {onRegenerate && (
            <Button 
              onClick={() => setRegenerateDialogOpen(true)}
              size="sm"
              variant="secondary" 
              className="w-8 h-8 p-0"
              title="Regenerate"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          
          {/* Preview button for code responses regardless of mode */}
          {hasCode && onViewPreview && (
            <Button 
              onClick={onViewPreview}
              size="sm"
              variant="secondary"
              className="flex items-center space-x-1 text-xs"
            >
              <Eye className="h-3 w-3" />
              <span>Preview</span>
            </Button>
          )}
        </div>
      )}
      
      <AlertDialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Response?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new response for your question. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerateConfirm}>Yes, Regenerate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MessageBubble;
