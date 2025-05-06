
import { AIModel } from '@/data/models';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Sun, Moon, Save, ChevronDown, Menu } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  selectedModel: AIModel;
  onModelSelectClick?: () => void; // Made optional with the ? mark
  onNewChatClick: () => void;
  onSettingsClick?: () => void;
  onSaveClick?: () => void;
  projectName?: string | null;
}

const Header = ({ 
  selectedModel, 
  onModelSelectClick, 
  onNewChatClick,
  onSettingsClick,
  onSaveClick,
  projectName
}: HeaderProps) => {
  const { isDarkMode, toggleDarkMode } = useUiStore();
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const location = useLocation();
  const isImageGenerator = location.pathname === '/image-generator';
  const isMainChat = location.pathname === '/';

  // Handle scroll to hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY > prevScrollY && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setPrevScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollY]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border p-3 transition-all duration-300 ease-in-out",
      isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
    )}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Navigation Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1 text-sm px-2 h-8"
              >
                <Menu className="h-4 w-4" />
                <span>Navigate</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/">Chat AI</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/image-generator">Image Generator</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/explore">Explore</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Only show model selector on chat page */}
          {isMainChat && onModelSelectClick && (
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
          )}
          
          {/* Project name dropdown */}
          {projectName && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1 text-sm px-2 h-8"
                >
                  <span className="truncate max-w-[120px]">{projectName}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem className="cursor-pointer">
                  Rename Project
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Export Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Right - New Chat, Save, Theme, and Settings buttons */}
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
          
          {onSaveClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSaveClick}
              className="h-8 w-8 rounded-full"
              title="Save Project"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="h-8 w-8 rounded-full"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          {onSettingsClick && !isImageGenerator && (
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
      </div>
    </header>
  );
};

export default Header;
