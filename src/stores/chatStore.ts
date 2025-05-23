
import { create } from 'zustand';
import { Message, GeneratedCode, SendMessageParams, MessageOptions } from '@/services/apiTypes';
import { sendMessageWithFallback, enhancePrompt, parseCodeResponse, getMessageText, prepareMessageContent } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { useModelStore } from '@/stores/modelStore';
import { autoSaveCurrentChat } from '@/services/projectService';

// Define storage key as a constant
const CHAT_STORAGE_KEY = 'orion_chat_history';

// Define rating type
type MessageRating = 'like' | 'dislike' | null;

export interface ChatState {
  chatId: string;
  messages: Message[];
  isLoading: boolean;
  isGenerating: boolean;
  generatedCode: GeneratedCode;
  showClearChatConfirm: boolean;
  lastError: string | null;
  messageRatings: { [key: number]: MessageRating };
  projectName: string | null;
  lastAutoSaveTime: number;
  
  handleSendMessage: (message: string, imageUrls?: string[]) => Promise<void>;
  handleRegenerateResponse: () => Promise<void>;
  handleStopGeneration: () => void;
  handleNewChat: () => void;
  setShowClearChatConfirm: (show: boolean) => void;
  confirmClearChat: () => void;
  setGeneratedCode: (code: GeneratedCode) => void;
  enhanceUserPrompt: (prompt: string) => string;
  parseCodeFromResponse: (content: string) => GeneratedCode;
  setLastError: (error: string | null) => void;
  loadChatFromStorage: (chatId?: string) => void;
  loadChatFromSaved: (savedChat: any) => void;
  rateMessage: (messageIndex: number, rating: MessageRating) => void;
  setProjectName: (name: string) => void;
  autoSaveIfNeeded: () => void;
}

// Save chats to localStorage
const saveChatsToStorage = (chats: Record<string, Message[]>) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving chats to localStorage:', error);
  }
};

// Load chats from localStorage
const loadChatsFromStorage = (): Record<string, Message[]> => {
  try {
    const chatsStr = localStorage.getItem(CHAT_STORAGE_KEY);
    return chatsStr ? JSON.parse(chatsStr) : {};
  } catch (error) {
    console.error('Error loading chats from localStorage:', error);
    return {};
  }
};

// Initialize with default welcome message
const createInitialMessages = (): Message[] => {
  return [{
    role: 'assistant',
    content: 'Welcome to Orion AI! How can I help you create today?'
  }];
};

// Auto-save debounce time (in ms)
const AUTO_SAVE_DEBOUNCE = 30000; // 30 seconds

export const useChatStore = create<ChatState>((set, get) => ({
  chatId: uuidv4(),
  messages: createInitialMessages(),
  isLoading: false,
  isGenerating: false,
  generatedCode: { html: '', css: '', js: '', preview: '' },
  showClearChatConfirm: false,
  lastError: null,
  messageRatings: {},
  projectName: null,
  lastAutoSaveTime: 0,

  handleSendMessage: async (message, imageUrls = []) => {
    if (!message.trim() && imageUrls.length === 0) return;

    // Get the selected model
    const { selectedModel } = useModelStore.getState();

    set(state => {
      // Create a new user message
      const userMessage: Message = {
        role: 'user',
        content: imageUrls.length > 0 
          ? [
              ...imageUrls.map(url => ({
                type: 'image_url',
                image_url: { url }
              })),
              { type: 'text', text: message }
            ] 
          : message
      };
      
      const newMessages = [...state.messages, userMessage];
      
      // Save to localStorage
      const allChats = loadChatsFromStorage();
      allChats[state.chatId] = newMessages;
      saveChatsToStorage(allChats);
      
      return { messages: newMessages, isLoading: true, isGenerating: true };
    });

    try {
      // Create params object for sendMessageWithFallback with the selected model
      const params: SendMessageParams = {
        messages: get().messages, 
        options: { 
          message, 
          imageUrls,
          selectedModel
        }
      };
      
      // Call the API with the correct parameter structure
      const response = await sendMessageWithFallback(params);

      // Parse the assistant's response for code if present
      const responseText = getMessageText(response.content);
      const generatedCode = parseCodeResponse(responseText);
      
      set(state => {
        // Add the assistant's response to messages
        const newMessages = [...state.messages, response];
        
        // Save to localStorage again with assistant's response
        const allChats = loadChatsFromStorage();
        allChats[state.chatId] = newMessages;
        saveChatsToStorage(allChats);
        
        return { 
          messages: newMessages, 
          isLoading: false,
          isGenerating: false,
          generatedCode 
        };
      });
      
      // Auto-save to Supabase if this is part of a named project
      get().autoSaveIfNeeded();
    } catch (error: any) {
      console.error('Error in AI response:', error);
      
      set(state => {
        // Create an error message
        const errorMessage: Message = {
          role: 'assistant',
          content: `I encountered an error: ${error.message || 'Unknown error'}. Please try again.`
        };
        
        const newMessages = [...state.messages, errorMessage];
        
        // Save to localStorage including the error message
        const allChats = loadChatsFromStorage();
        allChats[state.chatId] = newMessages;
        saveChatsToStorage(allChats);
        
        return { 
          messages: newMessages, 
          isLoading: false, 
          isGenerating: false,
          lastError: error.message || 'Unknown error'
        };
      });
    }
  },

  handleRegenerateResponse: async () => {
    // Get the selected model
    const { selectedModel } = useModelStore.getState();
    
    // Find the last user message
    const messages = get().messages;
    let lastUserMessageIndex = messages.length - 1;
    
    while (lastUserMessageIndex >= 0 && messages[lastUserMessageIndex].role !== 'user') {
      lastUserMessageIndex--;
    }
    
    if (lastUserMessageIndex < 0) return; // No user message found
    
    // Get the last user message
    const lastUserMessage = messages[lastUserMessageIndex];
    const userMessageText = typeof lastUserMessage.content === 'string' 
      ? lastUserMessage.content 
      : lastUserMessage.content.find((c: any) => c.type === 'text')?.text || '';
    
    // Remove all messages after the last user message
    set(state => {
      const trimmedMessages = state.messages.slice(0, lastUserMessageIndex + 1);
      return { 
        messages: trimmedMessages, 
        isLoading: true,
        isGenerating: true 
      };
    });
    
    // Extract image URLs if they exist
    const imageUrls = typeof lastUserMessage.content !== 'string' 
      ? lastUserMessage.content
          .filter((c: any) => c.type === 'image_url')
          .map((c: any) => c.image_url.url)
      : [];
    
    // Send the message again
    try {
      // Create params object for sendMessageWithFallback with the selected model
      const params: SendMessageParams = {
        messages: get().messages,
        options: { 
          message: userMessageText, 
          imageUrls,
          selectedModel
        }
      };
      
      // Call the API with the correct parameter structure
      const response = await sendMessageWithFallback(params);

      // Parse the assistant's response for code if present
      const responseText = getMessageText(response.content);
      const generatedCode = parseCodeResponse(responseText);
      
      set(state => {
        // Add the assistant's response to messages
        const newMessages = [...state.messages, response];
        
        // Save to localStorage
        const allChats = loadChatsFromStorage();
        allChats[state.chatId] = newMessages;
        saveChatsToStorage(allChats);
        
        return { 
          messages: newMessages, 
          isLoading: false,
          isGenerating: false,
          generatedCode 
        };
      });
      
      // Auto-save to Supabase if this is part of a named project
      get().autoSaveIfNeeded();
    } catch (error: any) {
      console.error('Error in AI response:', error);
      
      set(state => {
        const errorMessage: Message = {
          role: 'assistant',
          content: `I encountered an error: ${error.message || 'Unknown error'}. Please try again.`
        };
        
        const newMessages = [...state.messages, errorMessage];
        
        // Save to localStorage
        const allChats = loadChatsFromStorage();
        allChats[state.chatId] = newMessages;
        saveChatsToStorage(allChats);
        
        return { 
          messages: newMessages, 
          isLoading: false, 
          isGenerating: false,
          lastError: error.message || 'Unknown error' 
        };
      });
    }
  },

  handleStopGeneration: () => {
    set({ isGenerating: false });
  },

  handleNewChat: () => {
    const newChatId = uuidv4();
    set({
      chatId: newChatId,
      messages: createInitialMessages(),
      isLoading: false,
      generatedCode: { html: '', css: '', js: '', preview: '' },
      showClearChatConfirm: false,
      projectName: null
    });
  },

  setShowClearChatConfirm: (show) => {
    set({ showClearChatConfirm: show });
  },

  confirmClearChat: () => {
    get().handleNewChat();
    set({ showClearChatConfirm: false });
  },

  setGeneratedCode: (code) => {
    set({ generatedCode: code });
  },

  enhanceUserPrompt: (prompt) => {
    return enhancePrompt(prompt);
  },

  parseCodeFromResponse: (content) => {
    return parseCodeResponse(content);
  },

  setLastError: (error) => {
    set({ lastError: error });
  },
  
  rateMessage: (messageIndex, rating) => {
    set(state => {
      const currentRating = state.messageRatings[messageIndex];
      
      if (currentRating === rating) {
        const { [messageIndex]: _, ...rest } = state.messageRatings;
        return { messageRatings: rest };
      } else {
        return { 
          messageRatings: { 
            ...state.messageRatings, 
            [messageIndex]: rating 
          } 
        };
      }
    });
  },
  
  loadChatFromStorage: (chatId) => {
    const allChats = loadChatsFromStorage();
    
    if (chatId && allChats[chatId]) {
      set({
        chatId,
        messages: allChats[chatId],
        generatedCode: { html: '', css: '', js: '', preview: '' }
      });
    } else if (Object.keys(allChats).length > 0) {
      const mostRecentChatId = Object.keys(allChats)[0];
      set({
        chatId: mostRecentChatId,
        messages: allChats[mostRecentChatId],
        generatedCode: { html: '', css: '', js: '', preview: '' }
      });
    }
  },
  
  loadChatFromSaved: (savedChat) => {
    if (!savedChat || !savedChat.chats) return;
    
    set({
      chatId: savedChat.id,
      messages: savedChat.chats,
      projectName: savedChat.project_name || null,
      generatedCode: { html: '', css: '', js: '', preview: '' }
    });
    
    const allChats = loadChatsFromStorage();
    allChats[savedChat.id] = savedChat.chats;
    saveChatsToStorage(allChats);
  },
  
  setProjectName: (name) => {
    set({ projectName: name });
  },
  
  autoSaveIfNeeded: () => {
    const state = get();
    const now = Date.now();
    
    // Only auto-save if this is a named project and enough time has passed since last save
    if (
      state.projectName && 
      state.chatId && 
      state.messages.length > 1 && 
      (now - state.lastAutoSaveTime > AUTO_SAVE_DEBOUNCE)
    ) {
      // Auto-save to Supabase
      autoSaveCurrentChat(state.chatId, state.messages)
        .then(() => {
          console.log('Chat auto-saved to Supabase');
          set({ lastAutoSaveTime: now });
        })
        .catch(err => {
          console.error('Failed to auto-save chat:', err);
        });
    }
  }
}));

// Initialize by loading saved chat if available
(() => {
  const storedChats = loadChatsFromStorage();
  
  if (Object.keys(storedChats).length > 0) {
    try {
      const currentProjectStr = localStorage.getItem('currentProject');
      if (currentProjectStr) {
        const currentProject = JSON.parse(currentProjectStr);
        if (currentProject && currentProject.chats) {
          useChatStore.setState({
            chatId: currentProject.id,
            messages: currentProject.chats,
            projectName: currentProject.project_name || null
          });
          return;
        }
      }
    } catch (e) {
      console.error('Error loading current project:', e);
    }
    
    const mostRecentChatId = Object.keys(storedChats)[0];
    useChatStore.setState({
      chatId: mostRecentChatId,
      messages: storedChats[mostRecentChatId]
    });
  }
})();

// Helper function to detect code blocks in messages
export const hasCodeBlocks = (content: string | any[]): boolean => {
  const text = getMessageText(content);
  return text.includes("```html") || 
         text.includes("```css") || 
         text.includes("```js") || 
         text.includes("```javascript");
};
