
import { useState, useEffect } from 'react';
import { hasApiKeys } from '@/services/storage';
import MainLayout from '@/layouts/MainLayout';
import { useUiStore } from '@/stores/uiStore';

const Chat = () => {
  const { isPreviewMode, setIsPreviewMode } = useUiStore();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  
  // Initialize API keys and check if they exist
  useEffect(() => {
    if (!hasApiKeys()) {
      setApiKeyModalOpen(true);
    }
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      <MainLayout 
        apiKeyModalOpen={apiKeyModalOpen}
        onApiKeyModalOpenChange={setApiKeyModalOpen}
        isPreviewMode={isPreviewMode}
        onExitPreview={() => setIsPreviewMode(false)}
      />
    </div>
  );
};

export default Chat;
