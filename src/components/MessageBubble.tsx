import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Message, getMessageText } from "@/services/api";
import { Copy, RefreshCw, Check, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useChatStore } from "@/stores/chatStore";
import Highlight from 'react-highlight';
import 'highlight.js/styles/night-owl.css';

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
  const { messageRatings = {}, rateMessage } = useChatStore();
  
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
  
  return (
    <div className={cn(
      "flex flex-col w-full mb-4",
      isUser ? "items-end" : "items-start"
    )}>
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
      {!isUser && modelName && (
        <div className="mt-1 text-xs text-primary opacity-70">
          {modelName}
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
    </div>
  );
};

export default MessageBubble;
