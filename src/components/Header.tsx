
import { AIModel } from '@/data/models';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Sun, Moon } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';

interface HeaderProps {
  selectedModel: AIModel;
  onModelSelectClick: () => void;
  onNewChatClick: () => void;
  onSettingsClick?: () => void;
}

const Header = ({ 
  selectedModel, 
  onModelSelectClick, 
  onNewChatClick,
  onSettingsClick 
}: HeaderProps) => {
  const { isDarkMode, toggleDarkMode } = useUiStore();

  return (
    <header className="flex justify-between items-center p-3 border-b border-border">
      {/* Empty div to maintain spacing */}
      <div className="w-10"></div>
      
      {/* Center - AI Model Selector */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onModelSelectClick}
        className="flex items-center gap-1.5 px-2 text-sm h-8 hover:bg-secondary/20"
      >
        <div className="w-4 h-4 relative">
          <div className={`absolute inset-0 rounded-full ${selectedModel.id === 'gemini' ? 'bg-cyan-500/60' : 'bg-violet-500/60'}`}></div>
        </div>
        <span className="font-medium truncate max-w-[150px]">{selectedModel.name}</span>
      </Button>
      
      {/* Right - New Chat and Settings buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChatClick}
          className="h-8 w-8 rounded-full"
          title="New Chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="h-8 w-8 rounded-full"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="h-8 w-8 rounded-full"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
