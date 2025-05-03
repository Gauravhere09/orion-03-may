
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Message } from "@/services/api";
import { Copy, RefreshCw, Check } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
}

const MessageBubble = ({ message, onRegenerate }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast("Copied to clipboard");
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
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
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line || " "}
          </p>
        ))}
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
              onClick={onRegenerate}
              className="flex items-center space-x-1 text-xs py-1 px-2 text-muted-foreground hover:text-foreground rounded-full bg-secondary/50 hover:bg-secondary/80"
              aria-label="Regenerate response"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
