
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasApiKeys } from '@/services/storage';
import { toast } from '@/components/ui/sonner';

import MainLayout from '@/layouts/MainLayout';
import { useChatStore } from '@/stores/chatStore';
import { useModelStore } from '@/stores/modelStore';
import { useUiStore } from '@/stores/uiStore';

const Index = () => {
  const navigate = useNavigate();
  const { isLoading, isGenerating, messages } = useChatStore();
  const { selectedModel } = useModelStore();
  const { isPreviewMode, setIsPreviewMode } = useUiStore();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  
  // Initialize API keys and check if they exist
  useEffect(() => {
    if (!hasApiKeys()) {
      setApiKeyModalOpen(true);
    }
  }, []);

  return (
    <MainLayout 
      apiKeyModalOpen={apiKeyModalOpen}
      onApiKeyModalOpenChange={setApiKeyModalOpen}
      isPreviewMode={isPreviewMode}
      onExitPreview={() => setIsPreviewMode(false)}
    />
  );
};

export default Index;
