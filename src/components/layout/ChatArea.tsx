
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '@/services/apiTypes';
import MessageBubble from '@/components/MessageBubble';
import { useChatActions } from '@/stores/chatActions';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  loadingMessage?: string;
  selectedCode?: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  loadingMessage,
  selectedCode,
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { setSelectedCodeBlock } = useChatActions();

  const handleScroll = () => {
    if (!chatRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    const scrollPosition = scrollTop + clientHeight;
    
    // Consider "at bottom" if we're within 100px of the bottom
    const isBottom = scrollHeight - scrollPosition < 100;
    setIsAtBottom(isBottom);
  };
  
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  // Only scroll to bottom automatically on new messages if user was already at the bottom
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages.length, isAtBottom]);

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 pb-24 relative" 
      ref={chatRef}
      onScroll={handleScroll}
    >
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          message={message}
          isSelected={selectedCode === `code-${index}`}
          onSelectCode={() => setSelectedCodeBlock(`code-${index}`)}
        />
      ))}
      
      {isLoading && (
        <MessageBubble
          message={{
            role: 'assistant',
            content: loadingMessage || 'Thinking...',
          }}
          isLoading={true}
        />
      )}
      
      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <Button 
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 h-10 w-10 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 shadow-md"
          size="icon"
        >
          <ArrowDown size={20} />
        </Button>
      )}
    </div>
  );
};

export default ChatArea;
