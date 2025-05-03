
import { Message } from './api';

const API_KEYS_STORAGE_KEY = 'openrouter_api_keys';
const CHATS_STORAGE_KEY = 'ai_code_generator_chats';

export interface ApiKey {
  key: string;
  isDefault: boolean;
  priority: number;
}

// Default OpenRouter API keys
const DEFAULT_API_KEYS: ApiKey[] = [
  { 
    key: "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", 
    isDefault: true, 
    priority: 1 
  },
  { 
    key: "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", 
    isDefault: true, 
    priority: 2 
  },
  { 
    key: "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", 
    isDefault: true, 
    priority: 3 
  }
];

export interface Chat {
  id: string;
  messages: Message[];
  modelId: string;
  timestamp: number;
}

// Initialize API keys in storage if they don't exist
export const initializeApiKeys = (): void => {
  const existingKeys = getApiKeys();
  if (!existingKeys || existingKeys.length === 0) {
    saveApiKeys(DEFAULT_API_KEYS);
  }
};

export const saveApiKey = (apiKey: string): void => {
  const existingKeys = getApiKeys() || [];
  const newKey: ApiKey = {
    key: apiKey,
    isDefault: false,
    priority: existingKeys.length + 1
  };
  
  // Check if key already exists
  const keyExists = existingKeys.some(k => k.key === apiKey);
  if (!keyExists) {
    saveApiKeys([...existingKeys, newKey]);
  }
};

export const saveApiKeys = (apiKeys: ApiKey[]): void => {
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
};

export const getApiKeys = (): ApiKey[] | null => {
  const keysStr = localStorage.getItem(API_KEYS_STORAGE_KEY);
  return keysStr ? JSON.parse(keysStr) : null;
};

export const getAllApiKeys = (): ApiKey[] => {
  return getApiKeys() || DEFAULT_API_KEYS;
};

export const removeApiKey = (apiKey: string): void => {
  const existingKeys = getApiKeys() || [];
  const updatedKeys = existingKeys.filter(k => k.key !== apiKey);
  saveApiKeys(updatedKeys);
};

export const hasApiKeys = (): boolean => {
  const keys = getAllApiKeys();
  return keys.length > 0;
};

export const reorderApiKeys = (keys: ApiKey[]): void => {
  // Update priorities based on array order
  const updatedKeys = keys.map((key, index) => ({
    ...key,
    priority: index + 1
  }));
  saveApiKeys(updatedKeys);
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
