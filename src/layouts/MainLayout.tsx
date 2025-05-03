
import { useState, useEffect, useRef } from 'react';
import { hasApiKeys } from '@/services/storage';

import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ApiKeyModal from '@/components/ApiKeyModal';
import ModelSelectorDialog from '@/components/ModelSelectorDialog';
import CodeDisplay from '@/components/CodeDisplay';
import CodePreview from '@/components/CodePreview';
import Header from '@/components/Header';
import ErrorReportForm from '@/components/ErrorReportForm';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const { messages, isLoading, isGenerating, handleSendMessage, handleRegenerateResponse, handleStopGeneration, handleNewChat, generatedCode, showClearChatConfirm, setShowClearChatConfirm, confirmClearChat, enhanceUserPrompt, lastError, setLastError } = useChatStore();
  const { selectedModel, handleModelSelect } = useModelStore();
  const { isChatMode, toggleChatMode } = useUiStore();
  
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [errorReportOpen, setErrorReportOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Effect for error reporting
  useEffect(() => {
    if (lastError) {
      setErrorReportOpen(true);
    }
  }, [lastError]);

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
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-background text-foreground relative">
      <Header 
        selectedModel={selectedModel}
        onModelSelectClick={() => setModelSelectorOpen(true)}
        onApiKeyManagerClick={() => {}}
        onNewChatClick={() => setShowClearChatConfirm(true)}
      />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="w-full md:w-1/2 flex flex-col overflow-hidden border-r border-border/30"
        >
          <div className="flex-1 overflow-y-auto">
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
          </div>
          
          <div className="flex items-center justify-center">
            {isGenerating && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopGeneration}
                className="flex items-center gap-2 my-2 border-primary/20 text-xs"
              >
                <div className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
                <span>Stop</span>
              </Button>
            )}
          </div>
          
          <div className="sticky bottom-0 p-4 border-t border-border/30 bg-background/80 backdrop-blur-sm">
            <ChatInput 
              onSendMessage={(msg, imageUrls) => handleSendMessage(msg, imageUrls)} 
              disabled={isLoading || !hasApiKeys()}
              placeholder={isChatMode 
                ? "Chat with AI assistant..." 
                : "Describe the code you want to generate..."}
              isChatMode={isChatMode}
              onToggleChatMode={toggleChatMode}
              onEnhancePrompt={enhanceUserPrompt}
              selectedModel={selectedModel}
            />
          </div>
        </div>
        
        <div className="hidden md:flex md:w-1/2 overflow-hidden flex-col">
          {(generatedCode.html || generatedCode.css || generatedCode.js) ? (
            <CodeDisplay code={generatedCode} />
          ) : (
            <div className="flex items-center justify-center h-full p-4 bg-muted/10">
              <div className="text-center space-y-2 max-w-sm glass-morphism p-6 rounded-xl">
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
        <AlertDialogContent className="glass-morphism">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current chat and start a new one. Any unsaved code will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearChat} className="bg-cyan-600 hover:bg-cyan-700">Yes, Clear Chat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Error Report Form */}
      <ErrorReportForm
        open={errorReportOpen && !!lastError}
        onOpenChange={setErrorReportOpen}
        error={lastError || ''}
        onClose={() => setLastError(null)}
      />
    </div>
  );
};

export default MainLayout;
