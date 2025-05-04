
import { AIModel } from '@/data/models';
import { ApiKey, getAllApiKeys } from './storage';
import { Message, ChatCompletionResponse, ErrorResponse, GeneratedCode, ApiError, MessageContent, SendMessageParams } from './apiTypes';
import { getMessageText, hasCodeBlocks, maskApiKey, prepareMessageContent } from './apiHelpers';
import { sendMessageToGemini } from './geminiService';
import { sendMessageToOpenRouter } from './openRouterService';
import { enhancePrompt, parseCodeResponse } from './codeService';
import { toast } from '@/components/ui/sonner';

// Try each API key in order until one works
export const sendMessageWithFallback = async (
  params: SendMessageParams
): Promise<Message> => {
  const { messages, options } = params;
  const apiKeys = getAllApiKeys();
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error('No API keys available');
  }
  
  // Sort API keys by priority
  const sortedKeys = [...apiKeys].sort((a, b) => a.priority - b.priority);
  
  let lastError: ApiError | null = null;
  
  // Get current model from the stores (will need to be passed in)
  const model = { id: 'default', name: 'AI Assistant', openRouterModel: 'anthropic/claude-3-opus', version: '1.0' };
  
  // Check if we should use Gemini API
  if (model.id === 'gemini') {
    try {
      console.log("Using Gemini API directly");
      const responseText = await sendMessageToGemini(messages);
      return {
        role: 'assistant',
        content: responseText
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
      }
      throw error;
    }
  }
  
  console.log(`Attempting to use OpenRouter with model: ${model.name}, ${model.openRouterModel}`);
  console.log(`Available API keys: ${sortedKeys.length}`);
  
  // Try each API key in order until one works
  for (const apiKey of sortedKeys) {
    try {
      console.log(`Trying API key: ${maskApiKey(apiKey.key)}`);
      const responseText = await sendMessageToOpenRouter(model, messages, apiKey.key);
      console.log("Got successful response from OpenRouter");
      return {
        role: 'assistant',
        content: responseText
      };
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error;
        console.error(`API key ${maskApiKey(error.apiKey)} failed:`, error.message);
        
        // If the error is a rate limit, log but don't show toast
        if (error.message.includes("Rate limit") || error.code === "429") {
          console.log(`Rate limit exceeded for API key ${maskApiKey(error.apiKey)}. Trying next key...`);
        }
        // Continue to next API key
      } else {
        // For non-API errors, throw immediately
        console.error("Unexpected error:", error);
        throw error;
      }
    }
  }
  
  // If we get here, all API keys failed
  const errorMessage = lastError 
    ? `All API keys failed. Last error: ${lastError.message}` 
    : 'All API keys failed with unknown errors';
  
  throw new Error(errorMessage);
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
