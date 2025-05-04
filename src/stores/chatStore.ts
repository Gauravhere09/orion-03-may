import { create } from 'zustand';
import { Message, GeneratedCode, sendMessageWithFallback, enhancePrompt, parseCodeResponse, getMessageText, prepareMessageContent } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';

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
}

const LOCAL_STORAGE_KEY = 'orion_chat_history';

// Save chats to localStorage
const saveChatsToStorage = (chats: Record<string, Message[]>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving chats to localStorage:', error);
  }
};

// Load chats from localStorage
const loadChatsFromStorage = (): Record<string, Message[]> => {
  try {
    const chatsStr = localStorage.getItem(LOCAL_STORAGE_KEY);
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
    content: prepareMessageContent('Welcome to Orion AI! How can I help you create today?')
  }];
};

export const useChatStore = create<ChatState>((set, get) => ({
  chatId: uuidv4(),
  messages: createInitialMessages(),
  isLoading: false,
  isGenerating: false,
  generatedCode: { html: '', css: '', js: '', preview: '' },
  showClearChatConfirm: false,
  lastError: null,
  messageRatings: {},

  handleSendMessage: async (message, imageUrls = []) => {
    if (!message.trim() && imageUrls.length === 0) return;

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
      const response = await sendMessageWithFallback(
        get().messages, 
        message, 
        imageUrls
      );

      // Parse the assistant's response for code if present
      const assistantText = getMessageText(response.content);
      const generatedCode = parseCodeResponse(assistantText);
      
      set(state => {
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
      const response = await sendMessageWithFallback(
        get().messages,
        userMessageText,
        imageUrls
      );

      // Parse the assistant's response for code if present
      const assistantText = getMessageText(response.content);
      const generatedCode = parseCodeResponse(assistantText);
      
      set(state => {
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
    // Stop the ongoing generation process
    set({ isGenerating: false });
  },

  handleNewChat: () => {
    // Create a new chat with a welcome message
    const newChatId = uuidv4();
    set({
      chatId: newChatId,
      messages: createInitialMessages(),
      isLoading: false,
      generatedCode: { html: '', css: '', js: '', preview: '' },
      showClearChatConfirm: false
    });
  },

  setShowClearChatConfirm: (show) => {
    set({ showClearChatConfirm: show });
  },

  confirmClearChat: () => {
    // Clear the current chat and start a new one
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
      
      // If they clicked the same rating again, toggle it off
      if (currentRating === rating) {
        const { [messageIndex]: _, ...rest } = state.messageRatings;
        return { messageRatings: rest };
      } else {
        // Otherwise set the new rating
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
      // Load specified chat
      set({
        chatId,
        messages: allChats[chatId],
        generatedCode: { html: '', css: '', js: '', preview: '' } // Reset code display
      });
    } else if (Object.keys(allChats).length > 0) {
      // Load most recent chat if no specific one requested
      const mostRecentChatId = Object.keys(allChats)[0]; // Assuming first chat is most recent
      set({
        chatId: mostRecentChatId,
        messages: allChats[mostRecentChatId],
        generatedCode: { html: '', css: '', js: '', preview: '' } // Reset code display
      });
    } 
    // Otherwise keep current state
  },
  
  loadChatFromSaved: (savedChat) => {
    if (!savedChat || !savedChat.chats) return;
    
    set({
      chatId: savedChat.id,
      messages: savedChat.chats,
      generatedCode: { html: '', css: '', js: '', preview: '' } // Reset code display
    });
    
    // Also save to localStorage
    const allChats = loadChatsFromStorage();
    allChats[savedChat.id] = savedChat.chats;
    saveChatsToStorage(allChats);
  }
}));

// Initialize by loading saved chat if available
// This runs when the store is first created
(() => {
  const storedChats = loadChatsFromStorage();
  
  // Check if we have any saved chats
  if (Object.keys(storedChats).length > 0) {
    // Try to load current project if set
    try {
      const currentProjectStr = localStorage.getItem('currentProject');
      if (currentProjectStr) {
        const currentProject = JSON.parse(currentProjectStr);
        if (currentProject && currentProject.chats) {
          useChatStore.setState({
            chatId: currentProject.id,
            messages: currentProject.chats
          });
          return;
        }
      }
    } catch (e) {
      console.error('Error loading current project:', e);
    }
    
    // Otherwise load most recent chat
    const mostRecentChatId = Object.keys(storedChats)[0];
    useChatStore.setState({
      chatId: mostRecentChatId,
      messages: storedChats[mostRecentChatId]
    });
  }
})();

function hasCodeBlocks(content: string | any[]): boolean {
  const text = getMessageText(content);
  return text.includes("```html") || 
         text.includes("```css") || 
         text.includes("```js") || 
         text.includes("```javascript");
}
