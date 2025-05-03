
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Message } from "@/services/api";
import { Copy, RefreshCw, Check, Eye } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { parseCodeResponse } from '@/services/api';
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

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onViewPreview?: (code: string) => void;
}

const MessageBubble = ({ message, onRegenerate, onViewPreview }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast("Copied to clipboard");
    
    // Reset the copied state after 2 seconds
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
  
  const hasCode = message.content.includes("```html") || 
                 message.content.includes("```css") || 
                 message.content.includes("```js") ||
                 message.content.includes("```javascript");
  
  // Format code blocks with proper syntax highlighting
  const formattedContent = message.content.replace(
    /```(html|css|javascript|js)([\s\S]*?)```/g, 
    (match, language, code) => {
      return `<div class="mt-2 mb-2">
                <div class="bg-secondary/50 text-xs px-3 py-1 rounded-t-md font-mono">${language}</div>
                <pre class="bg-secondary/30 p-3 overflow-x-auto rounded-b-md rounded-tr-md text-sm"><code>${code}</code></pre>
              </div>`;
    }
  );
  
  const handlePreview = () => {
    if (hasCode && onViewPreview) {
      onViewPreview(message.content);
    }
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
          : "bg-secondary text-secondary-foreground rounded-tl-none"
      )}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
        )}
      </div>
      
      {!isUser && (
        <div className="flex space-x-2 mt-2">
          <button 
            onClick={handleCopy}
            className="flex items-center space-x-1 text-xs py-1 px-2 text-muted-foreground hover:text-foreground rounded-full bg-secondary/50 hover:bg-secondary/80"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span>Copy</span>
          </button>
          
          {onRegenerate && (
            <button 
              onClick={() => setRegenerateDialogOpen(true)}
              className="flex items-center space-x-1 text-xs py-1 px-2 text-muted-foreground hover:text-foreground rounded-full bg-secondary/50 hover:bg-secondary/80"
              aria-label="Regenerate response"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Regenerate</span>
            </button>
          )}
          
          {hasCode && onViewPreview && (
            <button 
              onClick={handlePreview}
              className="flex items-center space-x-1 text-xs py-1 px-2 text-muted-foreground hover:text-foreground rounded-full bg-secondary/50 hover:bg-secondary/80"
              aria-label="Preview code"
            >
              <Eye className="h-3 w-3" />
              <span>Preview</span>
            </button>
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
