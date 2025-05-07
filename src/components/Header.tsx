
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AIModel } from '@/data/models';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, LogOut, Menu, X, Image, PanelLeft, User } from 'lucide-react';

interface HeaderProps {
  selectedModel?: AIModel;
  onModelSelectClick?: () => void;
  onNewChatClick?: () => void;
  projectName?: string | null;
  setAuthModalOpen?: (open: boolean) => void;
}

const Header = ({ 
  selectedModel, 
  onModelSelectClick, 
  onNewChatClick, 
  projectName,
  setAuthModalOpen
}: HeaderProps) => {
  const { isDarkMode, toggleDarkMode, logoUrl } = useUiStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    if (setAuthModalOpen) {
      setAuthModalOpen(true);
    }
  };

  // Create a variable to control whether to show the model selector or logo
  const showModelSelector = location.pathname === '/' && selectedModel && onModelSelectClick;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        {/* Show model selector on chat page, logo on other pages */}
        {showModelSelector ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onModelSelectClick}
            className="flex items-center gap-1 rounded-xl"
          >
            <span className="max-w-[100px] truncate">{selectedModel.name}</span>
            <span className="text-muted-foreground text-xs">{selectedModel.version}</span>
          </Button>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <img src={logoUrl} alt="Orion AI" className="h-7" />
            <span className="font-semibold text-lg hidden sm:inline-block">Orion</span>
          </Link>
        )}
        
        {/* Project name */}
        {projectName && (
          <div className="hidden md:block">
            <span className="text-muted-foreground text-sm">Project:</span>
            <span className="ml-1 font-medium">{projectName}</span>
          </div>
        )}
        
        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <Button 
            variant={isActive('/') ? "secondary" : "ghost"} 
            size="sm" 
            asChild
            className="text-sm rounded-xl"
          >
            <Link to="/">Chat</Link>
          </Button>
          
          <Button 
            variant={isActive('/explore') ? "secondary" : "ghost"} 
            size="sm"
            asChild
            className="text-sm rounded-xl"
          >
            <Link to="/explore">Explore</Link>
          </Button>

          <Button 
            variant={isActive('/dashboard') ? "secondary" : "ghost"} 
            size="sm"
            asChild
            className="text-sm rounded-xl"
          >
            <Link to="/dashboard">Dashboard</Link>
          </Button>

          <Button 
            variant={isActive('/image-generator') ? "secondary" : "ghost"} 
            size="sm"
            asChild
            className="text-sm rounded-xl"
          >
            <Link to="/image-generator">Images</Link>
          </Button>
        </nav>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-xl">
          {isDarkMode ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
        
        {/* Auth button */}
        {user ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                <User size={16} />
                <span className="hidden sm:block">{user.email?.split('@')[0]}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 rounded-xl">
              <div className="grid gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start gap-2 rounded-xl" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button variant="outline" size="sm" onClick={handleSignIn} className="rounded-xl">
            Sign in
          </Button>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* New chat button */}
          {onNewChatClick && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onNewChatClick}
              className="hidden md:flex rounded-xl"
            >
              <PanelLeft className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-xl" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Menu className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-background border-b border-border p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Button 
              variant={isActive('/') ? "secondary" : "ghost"} 
              size="sm" 
              asChild
              className="justify-start rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/">Chat</Link>
            </Button>
            
            <Button 
              variant={isActive('/explore') ? "secondary" : "ghost"} 
              size="sm"
              asChild
              className="justify-start rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/explore">Explore</Link>
            </Button>
            
            <Button 
              variant={isActive('/dashboard') ? "secondary" : "ghost"} 
              size="sm"
              asChild
              className="justify-start rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            
            <Button 
              variant={isActive('/image-generator') ? "secondary" : "ghost"} 
              size="sm"
              asChild
              className="justify-start rounded-xl"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/image-generator">Images</Link>
            </Button>
            
            {onNewChatClick && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  onNewChatClick();
                  setIsMenuOpen(false);
                }}
                className="justify-start rounded-xl"
              >
                <PanelLeft className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
