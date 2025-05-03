
import { useEffect, useRef } from 'react';
import { Message, getMessageText, hasCodeBlocks } from '@/services/api';
import MessageBubble from '@/components/MessageBubble';
import { Skeleton } from '@/components/ui/skeleton';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerate?: () => void;
  onViewPreview?: (code: string) => void;
}

const ChatContainer = ({ messages, isLoading, onRegenerate, onViewPreview }: ChatContainerProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedModel } = useModelStore();
  const { isChatMode } = useUiStore();

  // Scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Filter out system messages from display and validate message structure
  const displayMessages = Array.isArray(messages) 
    ? messages.filter(msg => msg && typeof msg === 'object' && msg.role !== 'system') 
    : [];

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 pb-32 rounded-lg space-y-4 scrollbar-none"
    >
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
        displayMessages.map((message, index) => {
          // Skip invalid messages
          if (!message || typeof message !== 'object') return null;
          
          const isLastAssistantMessage = message.role === 'assistant' && 
            displayMessages.slice(index + 1).every(m => m && m.role !== 'assistant');
            
          // Safely get message text
          const messageContent = message.content || '';
          const messageText = getMessageText(messageContent);
          const hasCode = hasCodeBlocks(messageContent);
          const isGenerating = messageText.includes('Generating') || 
                              messageText.includes('Regenerating') || 
                              messageText.includes('Thinking');
            
          return (
            <MessageBubble 
              key={index}
              messageIndex={index}
              message={message} 
              onRegenerate={isLastAssistantMessage && !isGenerating && onRegenerate ? onRegenerate : undefined}
              onViewPreview={message.role === 'assistant' && onViewPreview && hasCode
                ? () => onViewPreview(messageText) : undefined}
              modelName={message.role === 'assistant' ? selectedModel.name : undefined}
              isChatMode={isChatMode}
            />
          );
        })
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
