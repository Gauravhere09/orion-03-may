
import { useState } from 'react';
import { Message } from '@/services/api';
import { aiModels, AIModel } from '@/data/models';

import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ApiKeyModal from '@/components/ApiKeyModal';
import ApiKeyManager from '@/components/ApiKeyManager';
import ModelSelectorDialog from '@/components/ModelSelectorDialog';
import CodeDisplay from '@/components/CodeDisplay';
import CodePreview from '@/components/CodePreview';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Eye, Code } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';

interface MainLayoutProps {
  apiKeyModalOpen: boolean;
  onApiKeyModalOpenChange: (open: boolean) => void;
  isPreviewMode: boolean;
  onExitPreview: () => void;
}

const MainLayout = ({ 
  apiKeyModalOpen, 
  onApiKeyModalOpenChange,
  isPreviewMode,
  onExitPreview
}: MainLayoutProps) => {
  const { messages, isLoading, isGenerating, handleSendMessage, handleRegenerateResponse, handleStopGeneration, handleNewChat, generatedCode } = useChatStore();
  const { selectedModel, handleModelSelect } = useModelStore();
  const { isChatMode, toggleChatMode } = useUiStore();
  
  const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  // If in preview mode, show the preview component with full screen display
  if (isPreviewMode && generatedCode.preview) {
    return (
      <CodePreview 
        code={generatedCode} 
        onBack={onExitPreview}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <Header 
        selectedModel={selectedModel}
        onModelSelectClick={() => setModelSelectorOpen(true)}
        onApiKeyManagerClick={() => setApiKeyManagerOpen(true)}
        onNewChatClick={handleNewChat}
        onPreviewClick={() => generatedCode.preview ? useUiStore.getState().setIsPreviewMode(true) : null}
        hasPreview={!!generatedCode.preview}
        isChatMode={isChatMode}
        onToggleChatMode={toggleChatMode}
      />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden border-r">
          <ChatContainer 
            messages={messages} 
            isLoading={isLoading} 
            onRegenerate={handleRegenerateResponse}
            onViewPreview={(code) => {
              const parsedCode = useChatStore.getState().parseCodeFromResponse(code);
              if (parsedCode.preview) {
                useChatStore.getState().setGeneratedCode(parsedCode);
                useUiStore.getState().setIsPreviewMode(true);
              }
            }}
          />
          
          <div className="flex items-center justify-center">
            {isGenerating && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopGeneration}
                className="flex items-center gap-2 my-2"
              >
                <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                <span>Stop Generating</span>
              </Button>
            )}
          </div>
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading || !hasApiKeys()}
            placeholder={isChatMode 
              ? "Chat with AI assistant..." 
              : "Describe the code you want to generate..."}
            isChatMode={isChatMode}
            onToggleChatMode={toggleChatMode}
          />
        </div>
        
        <div className="hidden md:flex md:w-1/2 overflow-hidden flex-col">
          {(generatedCode.html || generatedCode.css || generatedCode.js) ? (
            <CodeDisplay code={generatedCode} />
          ) : (
            <div className="flex items-center justify-center h-full p-4 bg-muted/20">
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-lg font-medium">No Code Generated Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Ask the AI to generate code and it will appear here. You can generate HTML, CSS, and JavaScript components.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ApiKeyModal 
        open={apiKeyModalOpen} 
        onOpenChange={onApiKeyModalOpenChange} 
        onApiKeySaved={() => {}} 
      />
      
      <ApiKeyManager
        open={apiKeyManagerOpen}
        onOpenChange={setApiKeyManagerOpen}
      />
      
      <ModelSelectorDialog
        open={modelSelectorOpen}
        onOpenChange={setModelSelectorOpen}
        selectedModel={selectedModel}
        onModelSelect={handleModelSelect}
      />
    </div>
  );
};

export default MainLayout;
