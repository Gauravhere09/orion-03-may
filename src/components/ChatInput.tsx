
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Code } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
  isChatMode: boolean;
  onToggleChatMode: () => void;
}

const ChatInput = ({ onSendMessage, disabled, placeholder = "Type your message...", isChatMode, onToggleChatMode }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-muted">
      <div className="flex space-x-2 relative max-w-3xl mx-auto">
        <div className="absolute left-2 bottom-2 flex items-center h-10 z-10">
          <Toggle
            pressed={isChatMode}
            onPressedChange={onToggleChatMode}
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
            title={isChatMode ? "Chat Mode" : "Code Mode"}
          >
            {isChatMode ? (
              <MessageSquare className="h-4 w-4" />
            ) : (
              <Code className="h-4 w-4" />
            )}
          </Toggle>
        </div>
        
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="resize-none min-h-[60px] rounded-full pl-12 pr-14"
          disabled={disabled}
        />
        
        <Button 
          type="submit" 
          size="icon" 
          className="absolute right-2 bottom-2 h-10 w-10 rounded-full"
          disabled={!input.trim() || disabled}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-5 w-5"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
