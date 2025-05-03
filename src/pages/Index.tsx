import { useState, useEffect, useRef } from 'react';
import { Message, sendMessageWithFallback, enhancePrompt, parseCodeResponse, GeneratedCode, getMessageText, prepareMessageContent } from '@/services/api';
import { aiModels, AIModel } from '@/data/models';
import { initializeApiKeys, hasApiKeys, saveChat, getChats } from '@/services/storage';

import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ApiKeyModal from '@/components/ApiKeyModal';
import ApiKeyManager from '@/components/ApiKeyManager';
import ModelSelectorDialog from '@/components/ModelSelectorDialog';
import CodeDisplay from '@/components/CodeDisplay';
import CodePreview from '@/components/CodePreview';
import ModelSelector from '@/components/ModelSelector';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { RefreshCw, Settings, Sparkles, StopCircle, Eye, Code, KeyRound } from 'lucide-react';

const Index = () => {
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode>({});
  const [chatId, setChatId] = useState<string>(Date.now().toString());
  const lastUserMessageIndexRef = useRef<number>(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // System message for code generation
  const codeGenerationSystemPrompt = `You are an AI code generator assistant powered by ${selectedModel.name} ${selectedModel.version}. 
  Generate clean, well-structured HTML, CSS, and JavaScript code based on user requests.
  Always provide your response ONLY with the code blocks - no extra text.
  Format your code with:
  \`\`\`html
  <!-- HTML code here -->
  \`\`\`
  \`\`\`css
  /* CSS code here */
  \`\`\`
  \`\`\`javascript
  // JavaScript code here
  \`\`\`
  Use detailed comments in the code and ensure it's well-organized.`;
  
  // Initialize API keys and check if they exist
  useEffect(() => {
    initializeApiKeys();
    
    if (!hasApiKeys()) {
      setApiKeyModalOpen(true);
    } else {
      // Load chat history
      const savedChats = getChats();
      if (savedChats && savedChats.length > 0) {
        const latestChat = savedChats[savedChats.length - 1];
        if (latestChat && latestChat.messages) {
          setMessages(latestChat.messages);
          setChatId(latestChat.id);
          
          // Check if there's code in the last message
          const lastAssistantMessage = latestChat.messages
            .filter(msg => msg.role === 'assistant')
            .pop();
            
          if (lastAssistantMessage) {
            const messageText = getMessageText(lastAssistantMessage.content);
            if (messageText.includes("```html") || 
                messageText.includes("```css") || 
                messageText.includes("```js")) {
              const parsedCode = parseCodeResponse(messageText);
              setGeneratedCode(parsedCode);
            }
          }
        }
      }
    }
    
    // Add welcome message if no saved chats
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Welcome to the AI Code Generator! Describe the application or component you want me to create, and I\'ll generate HTML, CSS, and JavaScript code for you. You can use our default OpenRouter API keys or add your own!'
      }]);
    }
  }, []);
  
  // Save chat when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChat(chatId, messages, selectedModel.id);
    }
  }, [messages, chatId, selectedModel.id]);

  const handleSendMessage = async (content: string) => {
    if (!hasApiKeys()) {
      setApiKeyModalOpen(true);
      return;
    }

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    lastUserMessageIndexRef.current = messages.length;
    setIsLoading(true);
    setIsGenerating(true);

    try {
      // Add a temporary "generating" message
      const tempMessage: Message = { 
        role: 'assistant', 
        content: `Generating code for your ${content.split(' ').slice(0, 3).join(' ')}...` 
      };
      setMessages(prev => [...prev, tempMessage]);
      
      // Enhanced prompt for code generation
      const enhancedContent = enhancePrompt(content);
      
      // Create new messages array with system prompt and chat history
      const messagesForApi: Message[] = [
        { role: 'system', content: codeGenerationSystemPrompt },
        { role: 'user', content: enhancedContent }
      ];

      abortControllerRef.current = new AbortController();
      const response = await sendMessageWithFallback(selectedModel, messagesForApi);
      
      // Replace the temporary message with the actual response
      setMessages(prev => {
        const newMessages = [...prev.slice(0, prev.length - 1)];
        newMessages.push({ role: 'assistant', content: response });
        return newMessages;
      });
      
      // Fix for line 196: Parse code from response using getMessageText
      const codeText = typeof response === 'string' ? response : getMessageText(response);
      const parsedCode = parseCodeResponse(codeText);
      setGeneratedCode(parsedCode);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message if there was an error
      setMessages(prev => prev.slice(0, prev.length - 1));
      toast("Error", { 
        description: error instanceof Error ? error.message : "Failed to get a response",
      });
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      abortControllerRef.current = null;
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
    if (messages.length === 0 || isLoading || !hasApiKeys()) return;
    
    setIsLoading(true);
    setIsGenerating(true);
    
    try {
      // Find the last user message
      let lastUserIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          lastUserIndex = i;
          break;
        }
      }
      
      if (lastUserIndex === -1) return;
      
      // Add a temporary "regenerating" message
      const tempMessage: Message = { 
        role: 'assistant', 
        content: 'Regenerating code...' 
      };
      
      // Remove the previous assistant message and add temp message
      const newMessages = messages.filter((_, index) => index <= lastUserIndex);
      newMessages.push(tempMessage);
      setMessages(newMessages);

      // Get content from the last user message, ensuring we handle potential MessageContent[] type
      const lastUserContent = typeof messages[lastUserIndex].content === 'string' 
        ? messages[lastUserIndex].content as string
        : getMessageText(messages[lastUserIndex].content);

      // Enhanced prompt for code generation
      const enhancedContent = enhancePrompt(lastUserContent);
      
      // Create messages array with system prompt and the user request
      const messagesForApi: Message[] = [
        { role: 'system', content: codeGenerationSystemPrompt },
        { role: 'user', content: enhancedContent }
      ];

      abortControllerRef.current = new AbortController();
      const response = await sendMessageWithFallback(selectedModel, messagesForApi);
      
      // Replace the temporary message with the actual response
      setMessages(prev => {
        const updatedMessages = [...prev.slice(0, prev.length - 1)];
        updatedMessages.push({ role: 'assistant', content: response });
        return updatedMessages;
      });
      
      // Fix for handling string or MessageContent[] response
      const codeText = typeof response === 'string' ? response : getMessageText(response);
      const parsedCode = parseCodeResponse(codeText);
      setGeneratedCode(parsedCode);
      
      toast("Code regenerated", {
        description: `Generated new code using ${selectedModel.name} ${selectedModel.version}`
      });
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast("Error", { 
        description: error instanceof Error ? error.message : "Failed to regenerate response",
      });
      
      // Remove the temporary message if there was an error
      setMessages(prev => prev.filter((_, index) => index <= lastUserMessageIndexRef.current));
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      setIsLoading(false);
      
      // Remove the temporary generating message
      setMessages(prev => {
        if (prev[prev.length - 1].content.includes('Generating') || 
            prev[prev.length - 1].content.includes('Regenerating')) {
          return prev.slice(0, prev.length - 1);
        }
        return prev;
      });
      
      toast("Generation stopped", {
        description: "The code generation process has been stopped."
      });
    }
  };

  const handleViewPreview = (codeContent: string) => {
    const parsedCode = parseCodeResponse(codeContent);
    if (parsedCode.preview) {
      setGeneratedCode(parsedCode);
      setIsPreviewMode(true);
    } else {
      toast("Preview not available", {
        description: "Could not generate preview from the code response."
      });
    }
  };

  // Create a new chat
  const handleNewChat = () => {
    setChatId(Date.now().toString());
    setMessages([{
      role: 'assistant',
      content: 'Welcome to the AI Code Generator! Describe the application or component you want me to create, and I\'ll generate HTML, CSS, and JavaScript code for you.'
    }]);
    setGeneratedCode({});
  };

  // If in preview mode, show the preview component
  if (isPreviewMode && generatedCode.preview) {
    return (
      <CodePreview 
        code={generatedCode} 
        onBack={() => setIsPreviewMode(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">AI Code Generator</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {generatedCode.preview && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setIsPreviewMode(true)}
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
            onClick={handleNewChat}
          >
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
          
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
            onClick={() => setApiKeyManagerOpen(true)}
            title="Manage API Keys"
          >
            <KeyRound className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 flex flex-col overflow-hidden border-r">
          <div className="py-2 px-4">
            <ModelSelector 
              selectedModel={selectedModel}
              onModelSelect={handleModelSelect}
            />
          </div>
          
          <ChatContainer 
            messages={messages} 
            isLoading={isLoading} 
            onRegenerate={handleRegenerateResponse}
            onViewPreview={handleViewPreview}
          />
          
          <div className="flex items-center justify-center">
            {isGenerating && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopGeneration}
                className="flex items-center gap-2 my-2"
              >
                <StopCircle className="h-4 w-4" />
                <span>Stop Generating</span>
              </Button>
            )}
          </div>
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading || !hasApiKeys()}
            placeholder="Describe the code you want to generate..."
          />
        </div>
        
        <div className="hidden md:flex md:w-1/2 overflow-hidden flex-col">
          {(generatedCode.html || generatedCode.css || generatedCode.js) ? (
            <CodeDisplay code={generatedCode} />
          ) : (
            <div className="flex items-center justify-center h-full p-4 bg-muted/20">
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-lg font-medium">No Code Generated Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Ask the AI to generate code and it will appear here. You can generate HTML, CSS, and JavaScript components.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ApiKeyModal 
        open={apiKeyModalOpen} 
        onOpenChange={setApiKeyModalOpen} 
        onApiKeySaved={() => {}} 
      />
      
      <ApiKeyManager
        open={apiKeyManagerOpen}
        onOpenChange={setApiKeyManagerOpen}
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
