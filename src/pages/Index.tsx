
import { useState, useEffect } from 'react';
import { Message, sendMessageToGroq } from '@/services/api';
import { aiModels, AIModel } from '@/data/models';
import { getApiKey, hasApiKey } from '@/services/storage';

import ModelSelector from '@/components/ModelSelector';
import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ApiKeyModal from '@/components/ApiKeyModal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

const Index = () => {
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  
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

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden p-4 md:p-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">AI Model Explorer</h1>
          <p className="text-sm text-muted-foreground">
            Powered by Groq API
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setApiKeyModalOpen(true)}
        >
          {hasApiKey() ? "Change API Key" : "Set API Key"}
        </Button>
      </header>
      
      <ModelSelector 
        selectedModel={selectedModel}
        onModelSelect={handleModelSelect}
      />
      
      <div className="flex-1 flex flex-col mt-2 mb-4 overflow-hidden bg-card/30 border rounded-xl">
        <ChatContainer messages={messages} isLoading={isLoading} />
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
    </div>
  );
};

export default Index;
