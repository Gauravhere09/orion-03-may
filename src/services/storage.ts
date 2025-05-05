import { Message } from './apiTypes';

const API_KEYS_STORAGE_KEY = 'openrouter_api_keys';
const CHATS_STORAGE_KEY = 'ai_code_generator_chats';

export interface ApiKey {
  key: string;
  isDefault: boolean;
  priority: number;
}

// Default OpenRouter API keys (placeholder keys - to be replaced later)
const DEFAULT_API_KEYS: ApiKey[] = [
  { key: "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", isDefault: true, priority: 1 },
  { key: "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", isDefault: true, priority: 2 }
  // Removed placeholder keys that aren't working
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

export const getApiKeys = (): ApiKey[] => {
  const keysStr = localStorage.getItem(API_KEYS_STORAGE_KEY);
  return keysStr ? JSON.parse(keysStr) : [];
};

export const getAllApiKeys = (): ApiKey[] => {
  const localKeys = getApiKeys() || [];
  // Use valid keys from local storage OR use default keys if none found
  return localKeys.length > 0 ? localKeys : DEFAULT_API_KEYS;
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

// Add function to sync API keys with Supabase
export const syncApiKeysWithSupabase = async (supabaseClient: any): Promise<void> => {
  try {
    const { data: supabaseKeys, error } = await supabaseClient
      .from('openrouter_apis')
      .select('*')
      .order('priority', { ascending: true });
    
    if (error) {
      console.error('Error fetching API keys from Supabase:', error);
      return;
    }
    
    if (supabaseKeys && supabaseKeys.length > 0) {
      // Map Supabase keys to our ApiKey format
      const formattedKeys: ApiKey[] = supabaseKeys.map(key => ({
        key: key.api_key,
        isDefault: key.is_default || false,
        priority: key.priority || 99
      }));
      
      // Save these keys to local storage
      saveApiKeys(formattedKeys);
      console.log('API keys synced from Supabase');
    }
  } catch (e) {
    console.error('Failed to sync API keys with Supabase:', e);
  }
};
