
import { AIModel } from '@/data/models';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Sun, Moon, Save, ChevronDown } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface HeaderProps {
  selectedModel: AIModel;
  onModelSelectClick: () => void;
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

  return (
    <header className="flex justify-between items-center p-3 border-b border-border">
      <div className="flex items-center gap-2">
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

        {/* Navigation Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-1 text-sm px-2 h-8 ml-2"
            >
              <span>Navigate</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
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
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/admin">Admin</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
