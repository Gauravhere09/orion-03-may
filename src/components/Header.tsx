
import { AIModel } from '@/data/models';
import { Button } from '@/components/ui/button';
import { Eye, KeyRound, Sparkles } from 'lucide-react';

interface HeaderProps {
  selectedModel: AIModel;
  onModelSelectClick: () => void;
  onApiKeyManagerClick: () => void;
  onNewChatClick: () => void;
  onPreviewClick: () => void;
  hasPreview: boolean;
}

const Header = ({ 
  selectedModel, 
  onModelSelectClick, 
  onApiKeyManagerClick, 
  onNewChatClick, 
  onPreviewClick,
  hasPreview
}: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        {/* App name removed as requested */}
      </div>
      
      <div className="flex items-center space-x-2">
        {hasPreview && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
            onClick={onPreviewClick}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
          onClick={onNewChatClick}
        >
          <span>New Chat</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
          onClick={onModelSelectClick}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">{selectedModel.name} {selectedModel.version}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onApiKeyManagerClick}
          title="Manage API Keys"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
