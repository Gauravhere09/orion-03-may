
import { AIModel } from '@/data/models';
import { Button } from '@/components/ui/button';
import { KeyRound, Sparkles, Plus, Moon, Sun } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';

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
  const { isDarkMode, toggleDarkMode } = useUiStore();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-3 border-b glass-morphism">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2 text-xs border-primary/40 glass-morphism"
          onClick={onNewChatClick}
        >
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="h-8 w-8 text-foreground rounded-full"
        >
          {isDarkMode ? (
            <Sun className="h-[1rem] w-[1rem]" />
          ) : (
            <Moon className="h-[1rem] w-[1rem]" />
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2 text-xs border-primary/40 glass-morphism"
          onClick={onModelSelectClick}
        >
          <Sparkles className="h-3 w-3" />
          <span className="hidden sm:inline">{selectedModel.name} {selectedModel.version}</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
