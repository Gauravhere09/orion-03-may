
import { create } from 'zustand';
import { Message, GeneratedCode, sendMessageWithFallback, enhancePrompt, parseCodeResponse, getMessageText, MessageContent, prepareMessageContent } from '@/services/api';
import { hasApiKeys, saveChat, getChatById, deleteChat } from '@/services/storage';
import { toast } from '@/components/ui/sonner';
import { useModelStore } from './modelStore';
import { useUiStore } from './uiStore';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  generatedCode: GeneratedCode;
  chatId: string;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setGeneratedCode: (code: GeneratedCode) => void;
  setChatId: (id: string) => void;
  handleSendMessage: (content: string, imageUrls?: string[]) => Promise<void>;
  handleRegenerateResponse: () => Promise<void>;
  handleStopGeneration: () => void;
  handleNewChat: () => void;
  parseCodeFromResponse: (content: string) => GeneratedCode;
  confirmClearChat: () => void;
  showClearChatConfirm: boolean;
  setShowClearChatConfirm: (show: boolean) => void;
  enhanceUserPrompt: (prompt: string) => string;
  isEnhancingPrompt: boolean;
  setIsEnhancingPrompt: (isEnhancing: boolean) => void;
}

// System message for code generation
const getCodeGenerationPrompt = (modelName: string, modelVersion: string) => `You are an AI code generator assistant powered by ${modelName} ${modelVersion}. 
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
Use detailed comments in the code and ensure it's well-organized.
Make the code look visually appealing with good styling and responsive design.
Focus on creating intuitive and modern user interfaces.`;

const getAssistantPrompt = (modelName: string, modelVersion: string) => `You are a helpful AI assistant powered by ${modelName} ${modelVersion}.
Respond concisely and accurately to questions and provide assistance as needed.`;

export const useChatStore = create<ChatStore>((set, get) => {
  const abortControllerRef: { current: AbortController | null } = { current: null };
  let lastUserMessageIndexRef = -1;
  
  // Initialize with stored chat if available, otherwise use default welcome message
  const initializeChat = () => {
    const chatId = Date.now().toString();
    const welcomeMessage = 'Welcome to the AI Code Generator! Describe the application or component you want me to create, and I\'ll generate HTML, CSS, and JavaScript code for you. You can use our default OpenRouter API keys or add your own!';
    
    return {
      chatId,
      messages: [{
        role: 'assistant',
        content: prepareMessageContent(welcomeMessage)
      }]
    };
  };
  
  const initialState = initializeChat();
  
  return {
    messages: initialState.messages,
    isLoading: false,
    isGenerating: false,
    generatedCode: {},
    chatId: initialState.chatId,
    showClearChatConfirm: false,
    isEnhancingPrompt: false,
    
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set(state => ({ messages: [...state.messages, message] })),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setGeneratedCode: (code) => set({ generatedCode: code }),
    setChatId: (id) => set({ chatId: id }),
    setShowClearChatConfirm: (show) => set({ showClearChatConfirm: show }),
    setIsEnhancingPrompt: (isEnhancing) => set({ isEnhancingPrompt: isEnhancing }),
    
    confirmClearChat: () => {
      set({ showClearChatConfirm: false });
      get().handleNewChat();
    },
    
    enhanceUserPrompt: (prompt) => {
      // A simple enhancement logic could be implemented here
      // For now, we'll just add some structuring to the prompt
      return `Create a well-structured, responsive design with the following requirements:\n\n${prompt}\n\nPlease include detailed comments and ensure the code is clean and maintainable.`;
    },
    
    handleSendMessage: async (content, imageUrls = []) => {
      if (!hasApiKeys()) {
        toast("API Keys Required", {
          description: "Please add API keys to continue"
        });
        return;
      }

      const { isChatMode } = useUiStore.getState();
      const { selectedModel } = useModelStore.getState();
      
      // Prepare message content with images if provided
      const messageContent = imageUrls.length > 0 
        ? prepareMessageContent(content, imageUrls) 
        : content;
      
      const userMessage: Message = { role: 'user', content: messageContent };
      set(state => ({ 
        messages: [...state.messages, userMessage],
        isLoading: true,
        isGenerating: true
      }));
      
      lastUserMessageIndexRef = get().messages.length;

      try {
        // Add a temporary "generating" message
        const tempMessage: Message = { 
          role: 'assistant', 
          content: isChatMode 
            ? prepareMessageContent("Thinking...") 
            : prepareMessageContent(`Generating code for your ${content.split(' ').slice(0, 3).join(' ')}...`)
        };
        
        set(state => ({ messages: [...state.messages, tempMessage] }));
        
        // Get the appropriate system message based on mode
        const systemPrompt = isChatMode 
          ? getAssistantPrompt(selectedModel.name, selectedModel.version)
          : getCodeGenerationPrompt(selectedModel.name, selectedModel.version);
        
        // Enhanced prompt for code generation or use original for chat
        const processedContent = isChatMode ? content : enhancePrompt(content);
        
        // Create new messages array with system prompt and chat history
        const messagesForApi: Message[] = [
          { role: 'system', content: systemPrompt },
        ];
        
        // Add image content if in chat mode and images exist
        if (isChatMode && imageUrls.length > 0) {
          messagesForApi.push({ role: 'user', content: messageContent });
        } else {
          messagesForApi.push({ role: 'user', content: processedContent });
        }

        abortControllerRef.current = new AbortController();
        const response = await sendMessageWithFallback(selectedModel, messagesForApi);
        
        // Replace the temporary message with the actual response
        set(state => {
          const newMessages = [...state.messages.slice(0, state.messages.length - 1)];
          newMessages.push({ role: 'assistant', content: response });
          
          // Save the chat
          saveChat(state.chatId, newMessages, selectedModel.id);
          
          return { messages: newMessages };
        });
        
        // Parse code from response if not in chat mode
        if (!isChatMode) {
          const codeText = getMessageText(response);
          const parsedCode = parseCodeResponse(codeText);
          set({ generatedCode: parsedCode });
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove the temporary message if there was an error
        set(state => ({ messages: state.messages.slice(0, state.messages.length - 1) }));
        
        toast("Error", { 
          description: error instanceof Error ? error.message : "Failed to get a response",
        });
      } finally {
        set({ isLoading: false, isGenerating: false });
        abortControllerRef.current = null;
      }
    },
    
    handleRegenerateResponse: async () => {
      const state = get();
      
      if (state.messages.length === 0 || state.isLoading || !hasApiKeys()) return;
      
      const { selectedModel } = useModelStore.getState();
      const { isChatMode } = useUiStore.getState();
      
      set({ isLoading: true, isGenerating: true });
      
      try {
        // Find the last user message
        let lastUserIndex = -1;
        for (let i = state.messages.length - 1; i >= 0; i--) {
          if (state.messages[i].role === 'user') {
            lastUserIndex = i;
            break;
          }
        }
        
        if (lastUserIndex === -1) return;
        
        // Add a temporary "regenerating" message
        const tempMessage: Message = { 
          role: 'assistant', 
          content: isChatMode 
            ? prepareMessageContent("Thinking...") 
            : prepareMessageContent("Regenerating code...")
        };
        
        // Remove the previous assistant message and add temp message
        const newMessages = state.messages.filter((_, index) => index <= lastUserIndex);
        newMessages.push(tempMessage);
        set({ messages: newMessages });

        // Get content from the last user message
        const lastUserContent = typeof state.messages[lastUserIndex].content === 'string' 
          ? state.messages[lastUserIndex].content 
          : state.messages[lastUserIndex].content;

        // Get the appropriate system message based on mode
        const systemPrompt = isChatMode 
          ? getAssistantPrompt(selectedModel.name, selectedModel.version)
          : getCodeGenerationPrompt(selectedModel.name, selectedModel.version);
        
        // Create messages array with system prompt and the user request
        const messagesForApi: Message[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: lastUserContent }
        ];

        abortControllerRef.current = new AbortController();
        const response = await sendMessageWithFallback(selectedModel, messagesForApi);
        
        // Replace the temporary message with the actual response
        set(state => {
          const updatedMessages = [...state.messages.slice(0, state.messages.length - 1)];
          updatedMessages.push({ role: 'assistant', content: response });
          
          // Save the chat
          saveChat(state.chatId, updatedMessages, selectedModel.id);
          
          return { messages: updatedMessages };
        });
        
        // Parse code if not in chat mode
        if (!isChatMode) {
          const codeText = getMessageText(response);
          const parsedCode = parseCodeResponse(codeText);
          set({ generatedCode: parsedCode });
        }
        
        toast("Response regenerated", {
          description: `Generated new response using ${selectedModel.name} ${selectedModel.version}`
        });
      } catch (error) {
        console.error('Error regenerating response:', error);
        
        toast("Error", { 
          description: error instanceof Error ? error.message : "Failed to regenerate response",
        });
        
        // Remove the temporary message if there was an error
        set(state => ({ 
          messages: state.messages.filter((_, index) => index <= lastUserMessageIndexRef)
        }));
      } finally {
        set({ isLoading: false, isGenerating: false });
        abortControllerRef.current = null;
      }
    },
    
    handleStopGeneration: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        
        set(state => {
          const messages = state.messages;
          
          // Remove the temporary generating message
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            const lastMessageText = getMessageText(lastMessage.content);
            
            if (lastMessage.role === 'assistant' && 
                (lastMessageText.includes('Generating') || 
                lastMessageText.includes('Thinking') || 
                lastMessageText.includes('Regenerating'))) {
              return { 
                messages: messages.slice(0, messages.length - 1),
                isGenerating: false,
                isLoading: false
              };
            }
          }
          
          return { isGenerating: false, isLoading: false };
        });
        
        toast("Generation stopped", {
          description: "The generation process has been stopped."
        });
      }
    },
    
    handleNewChat: () => {
      const { chatId } = initializeChat();
      
      set({
        chatId: chatId,
        messages: [{
          role: 'assistant',
          content: prepareMessageContent('Welcome to the AI Code Generator! Describe the application or component you want me to create, and I\'ll generate HTML, CSS, and JavaScript code for you.')
        }],
        generatedCode: {}
      });
    },
    
    parseCodeFromResponse: (content: string) => {
      return parseCodeResponse(content);
    }
  };
});
