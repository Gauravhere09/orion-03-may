
import { useState, useEffect, useRef } from 'react';
import { Message, sendMessageToGroq, regenerateResponse, parseCodeResponse, GeneratedCode } from '@/services/api';
import { aiModels, AIModel } from '@/data/models';
import { getApiKey, hasApiKey, saveChat, getChats } from '@/services/storage';

import ChatContainer from '@/components/ChatContainer';
import ChatInput from '@/components/ChatInput';
import ApiKeyModal from '@/components/ApiKeyModal';
import ModelSelectorDialog from '@/components/ModelSelectorDialog';
import CodeDisplay from '@/components/CodeDisplay';
import CodePreview from '@/components/CodePreview';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { RefreshCw, Copy, Settings, Sparkles, StopCircle, Eye, Code } from 'lucide-react';

const Index = () => {
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
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
  Always format your code responses with proper markdown code blocks:
  \`\`\`html
  <!-- HTML code here -->
  \`\`\`
  \`\`\`css
  /* CSS code here */
  \`\`\`
  \`\`\`javascript
  // JavaScript code here
  \`\`\`
  Use detailed comments to explain the code sections and ensure it's well-organized and follows best practices.`;
  
  // Check if API key exists on initial load
  useEffect(() => {
    if (!hasApiKey()) {
      setApiKeyModalOpen(true);
    } else {
      // Load chat history
      const savedChats = getChats();
      if (savedChats && savedChats.length > 0) {
        const latestChat = savedChats[savedChats.length - 1];
        if (latestChat && latestChat.messages) {
          setMessages(latestChat.messages);
          setChatId(latestChat.id);
        }
      }
    }
    
    // Add welcome message if no saved chats
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Welcome to the AI Code Generator! Describe the application or component you want me to create, and I\'ll generate HTML, CSS, and JavaScript code for you.'
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
    if (!hasApiKey()) {
      setApiKeyModalOpen(true);
      return;
    }

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    lastUserMessageIndexRef.current = messages.length;
    setIsLoading(true);
    setIsGenerating(true);

    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error('No API key found');

      // Create new messages array with system prompt and chat history
      const messagesForApi: Message[] = [
        { 
          role: 'system', 
          content: codeGenerationSystemPrompt
        },
        ...messages,
        userMessage
      ];

      abortControllerRef.current = new AbortController();
      const response = await sendMessageToGroq(selectedModel, messagesForApi, apiKey);
      
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Parse code from response if it contains code blocks
      if (response.includes("```html") || response.includes("```css") || response.includes("```js")) {
        const parsedCode = parseCodeResponse(response);
        setGeneratedCode(parsedCode);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    if (messages.length === 0 || isLoading || !hasApiKey()) return;
    
    setIsLoading(true);
    setIsGenerating(true);
    
    try {
      const apiKey = getApiKey();
      if (!apiKey) throw new Error('No API key found');

      // Get the latest user message index
      const lastUserIndex = lastUserMessageIndexRef.current;
      
      // Create messages array with system prompt and chat history up to the last user message
      const messagesForApi: Message[] = [
        { 
          role: 'system', 
          content: codeGenerationSystemPrompt
        },
        ...messages.slice(0, lastUserIndex + 1)
      ];

      abortControllerRef.current = new AbortController();
      const response = await sendMessageToGroq(selectedModel, messagesForApi, apiKey);
      
      // Replace the last assistant message or add a new one
      const newMessages = messages.filter((_, index) => index <= lastUserIndex);
      const assistantMessage: Message = { role: 'assistant', content: response };
      
      setMessages([...newMessages, assistantMessage]);
      
      // Parse code from response
      if (response.includes("```html") || response.includes("```css") || response.includes("```js")) {
        const parsedCode = parseCodeResponse(response);
        setGeneratedCode(parsedCode);
      }
      
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

  // Find the last assistant message for copying
  const handleCopyLastMessage = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        navigator.clipboard.writeText(messages[i].content);
        toast("Copied to clipboard", {
          description: "The last assistant message has been copied to your clipboard."
        });
        break;
      }
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
        
        <div className="flex items-center space-x-3">
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
            onClick={() => setApiKeyModalOpen(true)}
            title="API Key Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
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
            disabled={isLoading || !hasApiKey()}
            placeholder="Describe the code you want to generate..."
          />
        </div>
        
        {(generatedCode.html || generatedCode.css || generatedCode.js) && (
          <div className="hidden md:flex md:w-1/2 border-l overflow-hidden flex-col">
            <CodeDisplay code={generatedCode} />
          </div>
        )}
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
