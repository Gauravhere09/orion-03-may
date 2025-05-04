
import { useState, useEffect } from 'react';
import { hasApiKeys } from '@/services/storage';
import MainLayout from '@/layouts/MainLayout';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isPreviewMode, setIsPreviewMode } = useUiStore();
  const { user, isLoading } = useAuth();
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
