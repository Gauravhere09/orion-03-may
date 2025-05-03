
import { create } from 'zustand';
import { Message, GeneratedCode, sendMessageWithFallback, enhancePrompt, parseCodeResponse, getMessageText, prepareMessageContent } from '@/services/api';
import { hasApiKeys, saveChat, getChatById } from '@/services/storage';
import { useModelStore } from './modelStore';
import { useUiStore } from './uiStore';
import { getCodeGenerationPrompt, getAssistantPrompt, initializeChat, parseCodeFromResponse, enhanceUserPrompt } from './chatActions';

interface ChatStore {
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  generatedCode: GeneratedCode;
  chatId: string;
  lastError: string | null;
  setLastError: (error: string | null) => void;
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
  loadChatById: (id: string) => boolean;
}

export const useChatStore = create<ChatStore>((set, get) => {
  // Controller for aborting requests
  const abortControllerRef: { current: AbortController | null } = { current: null };
  // Reference to the last user message index
  let lastUserMessageIndexRef = -1;
  
  // Initialize with stored chat if available, otherwise use default welcome message
  const initialState = initializeChat();
  
  return {
    messages: initialState.messages,
    isLoading: false,
    isGenerating: false,
    generatedCode: {},
    chatId: initialState.chatId,
    lastError: null,
    showClearChatConfirm: false,
    isEnhancingPrompt: false,
    
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set(state => ({ messages: [...state.messages, message] })),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setGeneratedCode: (code) => set({ generatedCode: code }),
    setChatId: (id) => set({ chatId: id }),
    setLastError: (error) => set({ lastError: error }),
    setShowClearChatConfirm: (show) => set({ showClearChatConfirm: show }),
    setIsEnhancingPrompt: (isEnhancing) => set({ isEnhancingPrompt: isEnhancing }),
    
    confirmClearChat: () => {
      set({ showClearChatConfirm: false });
      get().handleNewChat();
    },
    
    enhanceUserPrompt,

    loadChatById: (id: string) => {
      const chat = getChatById(id);
      if (chat) {
        set({
          chatId: id,
          messages: chat.messages,
          isLoading: false,
          isGenerating: false
        });
        
        // If this is a code chat, also parse the code
        const lastAssistantMessage = chat.messages
          .filter(m => m.role === 'assistant')
          .pop();
          
        if (lastAssistantMessage) {
          const messageText = getMessageText(lastAssistantMessage.content);
          if (hasCodeBlocks(messageText)) {
            const parsedCode = parseCodeResponse(messageText);
            set({ generatedCode: parsedCode });
          }
        }
        
        return true;
      }
      return false;
    },
    
    handleSendMessage: async (content, imageUrls = []) => {
      if (!hasApiKeys()) {
        set({ lastError: "API Keys Required - Please add API keys to continue" });
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
        isGenerating: true,
        lastError: null
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
        set(state => ({ 
          messages: state.messages.slice(0, state.messages.length - 1),
          lastError: error instanceof Error ? error.message : "Failed to get a response"
        }));
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
      
      set({ isLoading: true, isGenerating: true, lastError: null });
      
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
      } catch (error) {
        console.error('Error regenerating response:', error);
        
        set(state => ({ 
          lastError: error instanceof Error ? error.message : "Failed to regenerate response",
          // Remove the temporary message if there was an error
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
        generatedCode: {},
        lastError: null
      });
    },
    
    parseCodeFromResponse
  };
});

// Helper function outside the store
function hasCodeBlocks(content: string | MessageContent[]): boolean {
  const text = getMessageText(content);
  return text.includes("```html") || 
         text.includes("```css") || 
         text.includes("```js") || 
         text.includes("```javascript");
}
