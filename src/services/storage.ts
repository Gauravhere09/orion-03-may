import { Message } from './api';

const API_KEY_STORAGE_KEY = 'groq_api_key';
const CHATS_STORAGE_KEY = 'ai_code_generator_chats';

export interface Chat {
  id: string;
  messages: Message[];
  modelId: string;
  timestamp: number;
}

export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

export const removeApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const saveChat = (chatId: string, messages: Message[], modelId: string): void => {
  const existingChatsStr = localStorage.getItem(CHATS_STORAGE_KEY);
  const existingChats: Chat[] = existingChatsStr ? JSON.parse(existingChatsStr) : [];
  
  const chatIndex = existingChats.findIndex(chat => chat.id === chatId);
  const timestamp = Date.now();
  
  if (chatIndex >= 0) {
    // Update existing chat
    existingChats[chatIndex] = {
      ...existingChats[chatIndex],
      messages,
      modelId,
      timestamp
    };
  } else {
    // Add new chat
    existingChats.push({
      id: chatId,
      messages,
      modelId,
      timestamp
    });
  }
  
  // Sort by timestamp (newest first)
  const sortedChats = existingChats.sort((a, b) => b.timestamp - a.timestamp);
  
  // Keep only the latest 10 chats
  const limitedChats = sortedChats.slice(0, 10);
  
  localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(limitedChats));
};

export const getChats = (): Chat[] | null => {
  const chatsStr = localStorage.getItem(CHATS_STORAGE_KEY);
  return chatsStr ? JSON.parse(chatsStr) : null;
};

export const getChatById = (chatId: string): Chat | null => {
  const chats = getChats();
  if (!chats) return null;
  
  const chat = chats.find(chat => chat.id === chatId);
  return chat || null;
};

export const deleteChat = (chatId: string): void => {
  const chats = getChats();
  if (!chats) return;
  
  const updatedChats = chats.filter(chat => chat.id !== chatId);
  localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updatedChats));
};
