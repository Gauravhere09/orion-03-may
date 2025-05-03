
import { useState, useEffect, useRef } from 'react';
import { Message } from '@/services/api';
import { hasApiKeys } from '@/services/storage';

import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ApiKeyModal from '@/components/ApiKeyModal';
import ApiKeyManager from '@/components/ApiKeyManager';
import ModelSelectorDialog from '@/components/ModelSelectorDialog';
import CodeDisplay from '@/components/CodeDisplay';
import CodePreview from '@/components/CodePreview';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Code, MessageSquare } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';
import { Toggle } from '@/components/ui/toggle';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
  const { messages, isLoading, isGenerating, handleSendMessage, handleRegenerateResponse, handleStopGeneration, handleNewChat, generatedCode, showClearChatConfirm, setShowClearChatConfirm, confirmClearChat, enhanceUserPrompt } = useChatStore();
  const { selectedModel, handleModelSelect } = useModelStore();
  const { isChatMode, toggleChatMode } = useUiStore();
  
  const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollPosition = useRef(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll behavior for header
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const currentScrollPos = container.scrollTop;
      const isScrollingDown = currentScrollPos > lastScrollPosition.current;
      
      // Only hide header after scrolling down a bit
      if (isScrollingDown && currentScrollPos > 60) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      lastScrollPosition.current = currentScrollPos;
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div 
        ref={headerRef}
        className={`transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'} sticky top-0 z-10`}
      >
        <Header 
          selectedModel={selectedModel}
          onModelSelectClick={() => setModelSelectorOpen(true)}
          onApiKeyManagerClick={() => setApiKeyManagerOpen(true)}
          onNewChatClick={() => setShowClearChatConfirm(true)}
          onPreviewClick={() => generatedCode.preview ? useUiStore.getState().setIsPreviewMode(true) : null}
          hasPreview={!!generatedCode.preview}
        />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="w-full md:w-1/2 flex flex-col overflow-hidden border-r"
        >
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
          
          <div className="relative px-4 border-t mt-auto">
            {/* Mode toggle positioned at the right side above input */}
            <div className="flex justify-end py-2">
              <Toggle
                pressed={isChatMode}
                onPressedChange={toggleChatMode}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-8"
                title={isChatMode ? "Switch to Code Mode" : "Switch to Chat Mode"}
              >
                {isChatMode ? (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                  </>
                ) : (
                  <>
                    <Code className="h-4 w-4" />
                    <span>Code</span>
                  </>
                )}
              </Toggle>
            </div>
            
            <ChatInput 
              onSendMessage={(msg, imageUrls) => handleSendMessage(msg, imageUrls)} 
              disabled={isLoading || !hasApiKeys()}
              placeholder={isChatMode 
                ? "Chat with AI assistant..." 
                : "Describe the code you want to generate..."}
              isChatMode={isChatMode}
              onEnhancePrompt={enhanceUserPrompt}
            />
          </div>
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
      
      <AlertDialog 
        open={showClearChatConfirm} 
        onOpenChange={setShowClearChatConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current chat and start a new one. Any unsaved code will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearChat}>Yes, Clear Chat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MainLayout;
