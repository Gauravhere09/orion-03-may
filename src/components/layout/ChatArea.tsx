
import { useRef } from 'react';
import { Message } from '@/services/apiTypes';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';
import ScrollToBottom from './ScrollToBottom';
import { create } from 'zustand';

// Create useChatActions store that was missing
interface ChatActionsState {
  selectedCodeBlock: string | null;
  setSelectedCodeBlock: (id: string | null) => void;
}

export const useChatActions = create<ChatActionsState>((set) => ({
  selectedCodeBlock: null,
  setSelectedCodeBlock: (id) => set({ selectedCodeBlock: id }),
}));

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  isGenerating?: boolean;
  loadingMessage?: string;
  onRegenerate?: () => void;
  onSendMessage?: (message: string, imageUrls?: string[]) => void;
  onStopGeneration?: () => void;
  onViewPreview?: (code: any) => void;
  onEnhancePrompt?: (prompt: string) => string;
}

const ChatArea = ({ 
  messages, 
  isLoading, 
  isGenerating = false,
  loadingMessage = "Loading...",
  onRegenerate,
  onSendMessage,
  onStopGeneration,
  onViewPreview,
  onEnhancePrompt
}: ChatAreaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedModel } = useModelStore();
  const { isChatMode, toggleChatMode } = useUiStore();

  return (
    <div ref={containerRef} className="flex flex-col h-full relative">
      <ChatContainer 
        messages={messages} 
        isLoading={isLoading}
        onRegenerate={onRegenerate}
        onViewPreview={onViewPreview}
      />
      
      <div className="sticky bottom-0 w-full z-10">
        {isGenerating && onStopGeneration ? (
          <div className="flex justify-center py-4">
            <button 
              onClick={onStopGeneration}
              className="px-4 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center space-x-2 transition-all"
            >
              <span>Stop Generating</span>
            </button>
          </div>
        ) : (
          <ChatInput 
            onSendMessage={(message, imageUrls) => onSendMessage && onSendMessage(message, imageUrls)} 
            disabled={isLoading || !onSendMessage}
            placeholder={isLoading ? loadingMessage : "Type your message..."}
            isChatMode={isChatMode}
            onToggleChatMode={toggleChatMode}
            onEnhancePrompt={onEnhancePrompt}
            selectedModel={selectedModel}
          />
        )}
      </div>
      
      <ScrollToBottom containerRef={containerRef} />
    </div>
  );
};

export default ChatArea;
