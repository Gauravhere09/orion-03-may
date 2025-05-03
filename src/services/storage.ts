import { Message } from './api';

const API_KEYS_STORAGE_KEY = 'openrouter_api_keys';
const CHATS_STORAGE_KEY = 'ai_code_generator_chats';

export interface ApiKey {
  key: string;
  isDefault: boolean;
  priority: number;
}

// Default OpenRouter API keys (placeholder keys - to be replaced later)
const DEFAULT_API_KEYS: ApiKey[] = [
  { key: "sk-or-v1-placeholder-key-1", isDefault: true, priority: 1 },
  { key: "sk-or-v1-placeholder-key-2", isDefault: true, priority: 2 },
  { key: "sk-or-v1-placeholder-key-3", isDefault: true, priority: 3 },
  { key: "sk-or-v1-placeholder-key-4", isDefault: true, priority: 4 },
  { key: "sk-or-v1-placeholder-key-5", isDefault: true, priority: 5 },
  { key: "sk-or-v1-placeholder-key-6", isDefault: true, priority: 6 },
  { key: "sk-or-v1-placeholder-key-7", isDefault: true, priority: 7 },
  { key: "sk-or-v1-placeholder-key-8", isDefault: true, priority: 8 },
  { key: "sk-or-v1-placeholder-key-9", isDefault: true, priority: 9 },
  { key: "sk-or-v1-placeholder-key-10", isDefault: true, priority: 10 }
];

export interface Chat {
  id: string;
  messages: Message[];
  modelId: string;
  timestamp: number;
}

// Maximum number of API keys allowed
const MAX_API_KEYS = 20;

// Initialize API keys in storage if they don't exist
export const initializeApiKeys = (): void => {
  const existingKeys = getApiKeys();
  if (!existingKeys || existingKeys.length === 0) {
    saveApiKeys(DEFAULT_API_KEYS);
  }
};

export const saveApiKey = (apiKey: string): void => {
  const existingKeys = getApiKeys() || [];
  
  // Check if we've reached the maximum number of API keys
  if (existingKeys.length >= MAX_API_KEYS) {
    throw new Error(`Maximum number of API keys (${MAX_API_KEYS}) reached. Please remove some keys first.`);
  }
  
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
