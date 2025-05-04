import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { ChevronDown, Menu, Moon, Save, Sun, User } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AuthModal from './AuthModal';

interface HeaderProps {
  selectedModel: any;
  onModelSelectClick: () => void;
  onNewChatClick: () => void;
}

const Header = ({ selectedModel, onModelSelectClick, onNewChatClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useUiStore();
  const { messages } = useChatStore();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSaveProject = async () => {
    if (!user) {
      setSaveDialogOpen(false);
      setAuthModalOpen(true);
      return;
    }

    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsSaving(true);
    try {
      // Get a preview image (could be from the generated code or a placeholder)
      // For this example, we'll use a placeholder
      const previewImage = '/public/placeholder.svg';

      // Fix type issue: Convert messages to a plain object before saving to Supabase
      const messagesJson = JSON.stringify(messages);

      // Save to Supabase
      const { data, error } = await supabase
        .from('saved_projects')
        .insert({
          user_id: user.id,
          project_name: projectName,
          chats: messagesJson,
          preview_image: previewImage
        })
        .select();

      if (error) throw error;

      toast.success('Project saved successfully!');
      setSaveDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="border-b border-border px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold hidden md:inline-block">Orion</span>
        </div>

        <div className="flex-1 flex justify-center ml-4 md:ml-0">
          <Button
            variant="outline"
            className="h-9 text-xs md:text-sm border-border"
            onClick={onModelSelectClick}
          >
            {selectedModel ? selectedModel.name : 'Select Model'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Button */}
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Save className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Navigation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                Navigate
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/explore')}>
                Explore
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onNewChatClick}>
                New Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => user ? navigate('/dashboard') : setAuthModalOpen(true)}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Save Project Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name">Project Name</label>
              <Input 
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter a name for your project"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
};

export default Header;
