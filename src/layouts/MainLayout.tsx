import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import ApiKeyModal from '@/components/ApiKeyModal';
import ModelSelectorDialog from '@/components/ModelSelectorDialog';
import CodeDisplay from '@/components/CodeDisplay';
import CodePreview from '@/components/CodePreview';
import Header from '@/components/Header';
import ErrorReportForm from '@/components/ErrorReportForm';
import ChatArea from '@/components/layout/ChatArea';
import CodeArea from '@/components/layout/CodeArea';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/stores/chatStore';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { syncApiKeysWithSupabase } from '@/services/storage';
import { supabase } from '@/integrations/supabase/client';
import { Code, X } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface MainLayoutProps {
  children?: React.ReactNode;
  apiKeyModalOpen: boolean;
  onApiKeyModalOpenChange: (open: boolean) => void;
  isPreviewMode: boolean;
  onExitPreview: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const MainLayout = ({ 
  children,
  apiKeyModalOpen, 
  onApiKeyModalOpenChange,
  isPreviewMode,
  onExitPreview,
  authModalOpen,
  setAuthModalOpen
}: MainLayoutProps) => {
  const { messages, isLoading, isGenerating, handleSendMessage, handleRegenerateResponse, 
          handleStopGeneration, handleNewChat, generatedCode, showClearChatConfirm, 
          setShowClearChatConfirm, confirmClearChat, enhanceUserPrompt, lastError, 
          setLastError, loadChatFromSaved, chatId, projectName, autoSaveIfNeeded } = useChatStore();
  const { selectedModel, handleModelSelect } = useModelStore();
  const { isChatMode } = useUiStore();
  
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [errorReportOpen, setErrorReportOpen] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const isMobile = useIsMobile();
  
  // Sync API keys from Supabase on initial load
  useEffect(() => {
    syncApiKeysWithSupabase(supabase).catch(err => 
      console.error('Error syncing API keys on component mount:', err)
    );
  }, []);
  
  // Trigger auto-save every 30 seconds if messages have changed
  useEffect(() => {
    if (projectName && chatId && messages.length > 0) {
      const saveInterval = setInterval(() => {
        autoSaveIfNeeded();
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(saveInterval);
    }
  }, [projectName, chatId, messages, autoSaveIfNeeded]);
  
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
  }, [loadChatFromSaved]);

  // Open error report form when there's an error
  useEffect(() => {
    if (lastError) {
      setErrorReportOpen(true);
    }
  }, [lastError]);

  // Check if we have generated code
  const hasGeneratedCode = !!(generatedCode.html);

  // Function to toggle code editor visibility for mobile
  const toggleCodeEditor = () => {
    setShowCodeEditor(prev => !prev);
  };

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
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-background text-foreground scrollbar-none">
      <Header 
        selectedModel={selectedModel}
        onModelSelectClick={() => setModelSelectorOpen(true)}
        onNewChatClick={() => setShowClearChatConfirm(true)}
        projectName={projectName}
        setAuthModalOpen={setAuthModalOpen}
      />
      
      <div className="pt-14 flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main content area */}
        {children ? (
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {children}
          </div>
        ) : (
          <>
            {/* Chat container (mobile or desktop) */}
            <div className={`w-full ${!isMobile && hasGeneratedCode ? 'md:w-1/2' : ''} flex flex-col overflow-hidden border-r border-border`}>
              <ChatArea 
                messages={messages}
                isLoading={isLoading}
                isGenerating={isGenerating}
                loadingMessage="Thinking..."
                onRegenerate={handleRegenerateResponse}
                onSendMessage={handleSendMessage}
                onStopGeneration={handleStopGeneration}
                onViewPreview={onExitPreview}
                onEnhancePrompt={enhanceUserPrompt}
              />
            </div>
            
            {/* Desktop: Show code editor in split view */}
            {!isMobile && hasGeneratedCode && (
              <CodeArea code={generatedCode} />
            )}
          </>
        )}
      </div>
      
      {/* Mobile: Show code toggle button if we have code */}
      {isMobile && hasGeneratedCode && !children && (
        <Button
          variant="default"
          size="sm"
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg flex items-center gap-1 bg-primary"
          onClick={toggleCodeEditor}
        >
          <Code className="h-4 w-4" />
          <span>{showCodeEditor ? "Hide Code" : "View Code"}</span>
        </Button>
      )}
      
      {/* Mobile: Show code editor in full screen when toggled */}
      {isMobile && showCodeEditor && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="h-full flex flex-col">
            <div className="border-b border-border p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">Code Editor</h2>
              <Button variant="ghost" size="sm" onClick={toggleCodeEditor}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeDisplay code={generatedCode} />
            </div>
          </div>
        </div>
      )}
      
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
