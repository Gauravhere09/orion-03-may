
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
    <header className="flex items-center justify-between p-4 border-b glass-morphism">
      <div className="flex items-center space-x-3">
        <img 
          src="/lovable-uploads/b8b23fd4-5e37-45df-a71f-69c1687f384b.png" 
          alt="Orion.AI" 
          className="h-10 w-auto"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="text-foreground"
        >
          {isDarkMode ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2 text-xs border-primary/40"
          onClick={onNewChatClick}
        >
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2 text-xs border-primary/40"
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
