
import { useRef } from 'react';
import { Message } from '@/services/apiTypes';
import { Button } from '@/components/ui/button';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ScrollToBottom from '@/components/layout/ScrollToBottom';
import { hasApiKeys } from '@/services/storage';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  onRegenerate: () => void;
  onSendMessage: (msg: string, imageUrls?: string[]) => void;
  onStopGeneration: () => void;
  onViewPreview: (code: string) => void;
  onEnhancePrompt: (prompt: string) => string;
}

const ChatArea = ({
  messages,
  isLoading,
  isGenerating,
  onRegenerate,
  onSendMessage,
  onStopGeneration,
  onViewPreview,
  onEnhancePrompt
}: ChatAreaProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { selectedModel } = useModelStore();
  const { isChatMode, toggleChatMode } = useUiStore();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div ref={chatContainerRef} className="flex-1 overflow-hidden">
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          onRegenerate={onRegenerate}
          onViewPreview={onViewPreview}
        />
        
        <div className="flex items-center justify-center">
          {isGenerating && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStopGeneration}
              className="flex items-center gap-2 my-2 border-primary/20 text-xs"
            >
              <div className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
              <span>Stop Generating</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative px-4">
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={isLoading || !hasApiKeys()}
          placeholder={isChatMode 
            ? "Chat with AI assistant..." 
            : "Describe the code you want to generate..."}
          isChatMode={isChatMode}
          onToggleChatMode={toggleChatMode}
          onEnhancePrompt={onEnhancePrompt}
          selectedModel={selectedModel}
        />
      </div>
      
      {/* Scroll to bottom button */}
      <ScrollToBottom containerRef={chatContainerRef} />
    </div>
  );
};

export default ChatArea;
