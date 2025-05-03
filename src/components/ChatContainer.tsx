
import { useEffect, useRef } from 'react';
import { Message } from '@/services/api';
import MessageBubble from '@/components/MessageBubble';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerate?: () => void;
  onViewPreview?: (code: string) => void;
}

const ChatContainer = ({ messages, isLoading, onRegenerate, onViewPreview }: ChatContainerProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter out system messages from display
  const displayMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <div className="flex-1 overflow-y-auto p-4 rounded-lg space-y-4 scrollbar-none">
      {displayMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-md">
            <h3 className="text-lg font-medium">Welcome to the AI Code Generator</h3>
            <p className="text-muted-foreground text-sm">
              Describe the application or component you want to create, and I'll generate the code for you.
            </p>
          </div>
        </div>
      ) : (
        displayMessages.map((message, index) => (
          <MessageBubble 
            key={index} 
            message={message} 
            onRegenerate={message.role === 'assistant' && onRegenerate ? onRegenerate : undefined}
            onViewPreview={message.role === 'assistant' && onViewPreview ? onViewPreview : undefined}
          />
        ))
      )}
      {isLoading && (
        <div className="flex items-start">
          <div className="max-w-[85%] space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatContainer;
