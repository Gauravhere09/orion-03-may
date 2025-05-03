
import { useState, useEffect, useRef } from 'react';
import { Message, sendMessageToGroq, regenerateResponse } from '@/services/api';
import { aiModels, AIModel } from '@/data/models';
import { getApiKey, hasApiKey } from '@/services/storage';

import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ApiKeyModal from '@/components/ApiKeyModal';
import ModelSelectorDialog from '@/components/ModelSelectorDialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { RefreshCw, Copy, Settings, Sparkles } from 'lucide-react';

const Index = () => {
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const lastUserMessageIndexRef = useRef<number>(-1);
  
  // Check if API key exists on initial load
  useEffect(() => {
    if (!hasApiKey()) {
      setApiKeyModalOpen(true);
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!hasApiKey()) {
      setApiKeyModalOpen(true);
      return;
    }

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    lastUserMessageIndexRef.current = messages.length;
    setIsLoading(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error('No API key found');

      // Create new messages array with system prompt and chat history
      const messagesForApi: Message[] = [
        { 
          role: 'system', 
          content: `You are an AI assistant powered by the ${selectedModel.name} ${selectedModel.version} model. 
          Be helpful, concise, and accurate. Format your responses using markdown when appropriate.`
        },
        ...messages,
        userMessage
      ];

      const response = await sendMessageToGroq(selectedModel, messagesForApi, apiKey);
      
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast("Error", { 
        description: error instanceof Error ? error.message : "Failed to get a response",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
    
    // Add a system message when model changes if there are existing messages
    if (messages.length > 0) {
      toast(`Switched to ${model.name} ${model.version}`, {
        description: "Your chat history is preserved but the model context has changed."
      });
    }
  };

  const handleRegenerateResponse = async () => {
    if (messages.length === 0 || isLoading || !hasApiKey()) return;
    
    setIsLoading(true);
    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error('No API key found');

      // Get the latest user message index
      const lastUserIndex = lastUserMessageIndexRef.current;
      
      // Create messages array with system prompt and chat history up to the last user message
      const messagesForApi: Message[] = [
        { 
          role: 'system', 
          content: `You are an AI assistant powered by the ${selectedModel.name} ${selectedModel.version} model. 
          Be helpful, concise, and accurate. Format your responses using markdown when appropriate.`
        },
        ...messages.slice(0, lastUserIndex + 1)
      ];

      const response = await sendMessageToGroq(selectedModel, messagesForApi, apiKey);
      
      // Replace the last assistant message or add a new one
      const newMessages = messages.filter((_, index) => index <= lastUserIndex);
      const assistantMessage: Message = { role: 'assistant', content: response };
      
      setMessages([...newMessages, assistantMessage]);
      
      toast("Response regenerated", {
        description: `Generated a new response using ${selectedModel.name} ${selectedModel.version}`
      });
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast("Error", { 
        description: error instanceof Error ? error.message : "Failed to regenerate response",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fix for the findLast method not being available
  const handleCopyLastMessage = () => {
    let lastMessage = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        lastMessage = messages[i];
        break;
      }
    }

    if (lastMessage) {
      navigator.clipboard.writeText(lastMessage.content);
      toast("Copied to clipboard", {
        description: "The last assistant message has been copied to your clipboard."
      });
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">AI Chat</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => setModelSelectorOpen(true)}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{selectedModel.name} {selectedModel.version}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setApiKeyModalOpen(true)}
            title="API Key Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer 
          messages={messages} 
          isLoading={isLoading} 
          onRegenerate={handleRegenerateResponse}
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading || !hasApiKey()} 
        />
      </div>
      
      <ApiKeyModal 
        open={apiKeyModalOpen} 
        onOpenChange={setApiKeyModalOpen} 
        onApiKeySaved={() => {}} 
      />
      
      <ModelSelectorDialog
        open={modelSelectorOpen}
        onOpenChange={setModelSelectorOpen}
        selectedModel={selectedModel}
        onModelSelect={handleModelSelect}
      />
    </div>
  );
};

export default Index;
