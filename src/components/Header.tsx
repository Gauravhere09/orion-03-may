import { AIModel } from '@/data/models';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, Moon, Sun, Compass } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  return (
    <header className="flex items-center justify-between p-4 border-b glass-morphism">
      <div className="flex items-center space-x-3">
      <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 text-xs border-primary/40"
          asChild
        >
          <Link to="/explore">
            <Compass className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Explore</span>
          </Link>
        </Button>
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
