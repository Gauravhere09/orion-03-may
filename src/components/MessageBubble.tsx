
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Message } from "@/services/api";
import { Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
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
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3 text-sm animate-slide-in relative group",
        isUser 
          ? "bg-primary text-primary-foreground rounded-tr-none ml-4" 
          : "bg-secondary text-secondary-foreground rounded-tl-none mr-4"
      )}>
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {line || " "}
          </p>
        ))}
        
        {!isUser && (
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 rounded-full bg-background/10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
