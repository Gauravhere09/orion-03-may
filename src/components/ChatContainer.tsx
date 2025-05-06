
import { useEffect, useRef, useState } from 'react';
import { Message } from '@/services/apiTypes';
import { getMessageText, hasCodeBlocks } from '@/services/api';
import MessageBubble from '@/components/MessageBubble';
import { Skeleton } from '@/components/ui/skeleton';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';
import ScrollToBottom from './layout/ScrollToBottom';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerate?: () => void;
  onViewPreview?: (code: string) => void;
}

const ChatContainer = ({ messages, isLoading, onRegenerate, onViewPreview }: ChatContainerProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const { selectedModel } = useModelStore();
  const { isChatMode } = useUiStore();

  // Auto scroll only for new messages if user is at the bottom
  useEffect(() => {
    if (bottomRef.current && shouldAutoScroll) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, shouldAutoScroll]);
  
  // Track scroll position to determine if auto-scroll should happen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider "at bottom" if within 100px of the bottom
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isAtBottom);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
      
      {/* Scroll to bottom button is now handled by ScrollToBottom component */}
    </div>
  );
};

export default ChatContainer;
