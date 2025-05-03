
import { AIModel } from '@/data/models';
import { ApiKey, getAllApiKeys } from './storage';
import { Message, ChatCompletionResponse, ErrorResponse, GeneratedCode, ApiError, MessageContent } from './apiTypes';
import { getMessageText, hasCodeBlocks, maskApiKey, prepareMessageContent } from './apiHelpers';
import { sendMessageToGemini } from './geminiService';
import { sendMessageToOpenRouter } from './openRouterService';
import { enhancePrompt, parseCodeResponse } from './codeService';

// Try each API key in order until one works
export const sendMessageWithFallback = async (
  model: AIModel,
  messages: Message[]
): Promise<string> => {
  const apiKeys = getAllApiKeys();
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error('No API keys available');
  }
  
  // Sort API keys by priority
  const sortedKeys = [...apiKeys].sort((a, b) => a.priority - b.priority);
  
  let lastError: ApiError | null = null;
  
  // Check if we should use Gemini API
  if (model.id === 'gemini') {
    try {
      return await sendMessageToGemini(messages);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw error;
    }
  }
  
  // Try each API key in order until one works
  for (const apiKey of sortedKeys) {
    try {
      const response = await sendMessageToOpenRouter(model, messages, apiKey.key);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error;
        console.error(`API key ${maskApiKey(error.apiKey)} failed:`, error.message);
        // Continue to next API key
      } else {
        // For non-API errors, throw immediately
        throw error;
      }
    }
  }
  
  // If we get here, all API keys failed
  if (lastError) {
    throw new Error(`All API keys failed. Last error: ${lastError.message}`);
  } else {
    throw new Error('All API keys failed with unknown errors');
  }
};

// Re-export everything from the modules
export { 
  getMessageText, 
  hasCodeBlocks, 
  prepareMessageContent, 
  enhancePrompt, 
  parseCodeResponse,
  sendMessageToGemini,
  sendMessageToOpenRouter
};
export type { 
  Message, 
  MessageContent, 
  ChatCompletionResponse, 
  ErrorResponse, 
  GeneratedCode, 
  ApiError 
};
