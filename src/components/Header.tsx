
import { AIModel } from '@/data/models';
import { Button } from '@/components/ui/button';
import { KeyRound, Sparkles, Plus } from 'lucide-react';

interface HeaderProps {
  selectedModel: AIModel;
  onModelSelectClick: () => void;
  onApiKeyManagerClick: () => void;
  onNewChatClick: () => void;
}

const Header = ({ 
  selectedModel, 
  onModelSelectClick, 
  onApiKeyManagerClick, 
  onNewChatClick
}: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-3">
        <img 
          src="/lovable-uploads/8f162460-5a85-4a8e-82f5-343312051ee5.png" 
          alt="HABT App" 
          className="h-10 w-10 rounded-xl"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
          onClick={onNewChatClick}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
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
        
        {/* Admin access button hidden as per request */}
      </div>
    </header>
  );
};

export default Header;
