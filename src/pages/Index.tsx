
import { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface IndexProps {
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

const Index = ({ authModalOpen, setAuthModalOpen }: IndexProps) => {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { user } = useAuth();

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  return (
    <MainLayout
      apiKeyModalOpen={apiKeyModalOpen}
      onApiKeyModalOpenChange={setApiKeyModalOpen}
      isPreviewMode={isPreviewMode}
      onExitPreview={handleExitPreview}
      authModalOpen={authModalOpen}
      setAuthModalOpen={setAuthModalOpen}
    />
  );
};

export default Index;
