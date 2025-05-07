
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AIModel } from '@/data/models';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Settings, Save, LogOut, Menu, X, Image, PanelLeft, TrendingUp, User } from 'lucide-react';

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="Orion AI" className="h-7" />
          <span className="font-semibold text-lg hidden sm:inline-block">Orion</span>
        </Link>
        
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
            className="text-sm"
          >
            <Link to="/">Chat</Link>
          </Button>
          
          <Button 
            variant={isActive('/explore') ? "secondary" : "ghost"} 
            size="sm"
            asChild
            className="text-sm"
          >
            <Link to="/explore">Explore</Link>
          </Button>

          <Button 
            variant={isActive('/dashboard') ? "secondary" : "ghost"} 
            size="sm"
            asChild
            className="text-sm"
          >
            <Link to="/dashboard">Dashboard</Link>
          </Button>

          <Button 
            variant={isActive('/image-generator') ? "secondary" : "ghost"} 
            size="sm"
            asChild
            className="text-sm"
          >
            <Link to="/image-generator">Images</Link>
          </Button>
        </nav>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Selected model - Desktop */}
        {selectedModel && onModelSelectClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onModelSelectClick}
            className="hidden md:flex items-center gap-1 text-xs"
          >
            <span className="max-w-[100px] truncate">{selectedModel.name}</span>
            <span className="text-muted-foreground text-xs">{selectedModel.version}</span>
          </Button>
        )}
        
        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
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
              <Button variant="ghost" size="sm" className="gap-2">
                <User size={16} />
                <span className="hidden sm:block">{user.email?.split('@')[0]}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="grid gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start gap-2" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Button variant="outline" size="sm" onClick={handleSignIn}>
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
              className="hidden md:flex"
            >
              <PanelLeft className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
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
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/">
                <PanelLeft className="h-4 w-4 mr-2" />
                Chat
              </Link>
            </Button>
            
            <Button 
              variant={isActive('/explore') ? "secondary" : "ghost"} 
              size="sm"
              asChild
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/explore">
                <TrendingUp className="h-4 w-4 mr-2" />
                Explore
              </Link>
            </Button>

            <Button 
              variant={isActive('/dashboard') ? "secondary" : "ghost"} 
              size="sm"
              asChild
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/dashboard">
                <Settings className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>

            <Button 
              variant={isActive('/image-generator') ? "secondary" : "ghost"} 
              size="sm"
              asChild
              className="justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/image-generator">
                <Image className="h-4 w-4 mr-2" />
                Images
              </Link>
            </Button>
          </nav>
          
          {selectedModel && onModelSelectClick && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onModelSelectClick();
                  setIsMenuOpen(false);
                }}
                className="w-full justify-between"
              >
                <span>Model: {selectedModel.name}</span>
                <span className="text-muted-foreground text-xs">{selectedModel.version}</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
