
import { AIModel } from '@/data/models';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Eye, Code, KeyRound, Sparkles, MessageSquare } from 'lucide-react';

interface HeaderProps {
  selectedModel: AIModel;
  onModelSelectClick: () => void;
  onApiKeyManagerClick: () => void;
  onNewChatClick: () => void;
  onPreviewClick: () => void;
  hasPreview: boolean;
  isChatMode: boolean;
  onToggleChatMode: () => void;
}

const Header = ({ 
  selectedModel, 
  onModelSelectClick, 
  onApiKeyManagerClick, 
  onNewChatClick, 
  onPreviewClick,
  hasPreview,
  isChatMode,
  onToggleChatMode
}: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">AI Code Generator</h1>
        <div className="ml-4 flex gap-1 p-1 border rounded-md bg-background">
          <Toggle
            pressed={isChatMode}
            onPressedChange={onToggleChatMode}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </Toggle>
          <Toggle
            pressed={!isChatMode}
            onPressedChange={() => onToggleChatMode()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Code</span>
          </Toggle>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {hasPreview && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
            onClick={onPreviewClick}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
          onClick={onNewChatClick}
        >
          <Code className="h-4 w-4" />
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
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onApiKeyManagerClick}
          title="Manage API Keys"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
