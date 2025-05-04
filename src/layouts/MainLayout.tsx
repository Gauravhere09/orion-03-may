
import { useState, useEffect, useRef } from 'react';
import { Message } from '@/services/api';
import { hasApiKeys } from '@/services/storage';
import { useNavigate } from 'react-router-dom';

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
import { useAuth } from '@/contexts/AuthContext';
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, isLoading, isGenerating, handleSendMessage, handleRegenerateResponse, 
          handleStopGeneration, handleNewChat, generatedCode, showClearChatConfirm, 
          setShowClearChatConfirm, confirmClearChat, enhanceUserPrompt, lastError, 
          setLastError, loadChatFromSaved } = useChatStore();
  const { selectedModel, handleModelSelect } = useModelStore();
  const { isChatMode, toggleChatMode, isDarkMode } = useUiStore();
  
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [errorReportOpen, setErrorReportOpen] = useState(false);
  const lastScrollPosition = useRef(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Load current project if available
  useEffect(() => {
    try {
      const currentProjectStr = localStorage.getItem('currentProject');
      if (currentProjectStr) {
        const currentProject = JSON.parse(currentProjectStr);
        if (currentProject && currentProject.chats) {
          // Clear the current project from localStorage after loading it
          loadChatFromSaved(currentProject);
          localStorage.removeItem('currentProject');
        }
      }
    } catch (e) {
      console.error('Error loading current project:', e);
    }
  }, []);
  
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

  // Open error report form when there's an error
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
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-background text-foreground">
      <div 
        ref={headerRef}
        className={`transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'} sticky top-0 z-10`}
      >
        <Header 
          selectedModel={selectedModel}
          onModelSelectClick={() => setModelSelectorOpen(true)}
          onNewChatClick={() => setShowClearChatConfirm(true)}
        />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="w-full md:w-1/2 flex flex-col overflow-hidden border-r border-border"
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
                className="flex items-center gap-2 my-2 border-primary/20 text-xs"
              >
                <div className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
                <span>Stop Generating</span>
              </Button>
            )}
          </div>
          
          <div className="relative px-4">
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
        
        <div className="hidden md:flex md:w-1/2 overflow-hidden flex-col border-l border-border">
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
        <AlertDialogContent className="border border-border">
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
