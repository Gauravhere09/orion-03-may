
import { AIModel } from '@/data/models';
import { ApiKey, getAllApiKeys, syncApiKeysWithSupabase } from './storage';
import { Message, ChatCompletionResponse, ErrorResponse, GeneratedCode, ApiError, MessageContent, SendMessageParams } from './apiTypes';
import { getMessageText, hasCodeBlocks, maskApiKey, prepareMessageContent } from './apiHelpers';
import { sendMessageToGemini } from './geminiService';
import { sendMessageToOpenRouter } from './openRouterService';
import { enhancePrompt, parseCodeResponse, codeGenerationPrompt } from './codeService';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

// Initialize by syncing API keys from Supabase
(async () => {
  try {
    await syncApiKeysWithSupabase(supabase);
  } catch (e) {
    console.error('Failed to sync API keys on initialization:', e);
  }
})();

// Try each API key in order until one works
export const sendMessageWithFallback = async (
  params: SendMessageParams
): Promise<Message> => {
  const { messages, options } = params;
  const { selectedModel, message } = options;
  
  // Check if we should use Gemini API directly
  if (selectedModel.id === 'gemini') {
    try {
      return await useGeminiApi(messages, message);
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Try OpenRouter with available API keys
  try {
    return await useOpenRouterWithFallback(selectedModel, messages);
  } catch (error) {
    console.error("All OpenRouter API keys failed or none available:", error);
    
    // Fall back to Gemini as a last resort if OpenRouter fails
    toast.warning("OpenRouter API unavailable. Falling back to Gemini API.");
    try {
      return await useGeminiApi(messages, message);
    } catch (fallbackError) {
      console.error("Fallback to Gemini also failed:", fallbackError);
      throw new Error(`All API services failed. Last error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
    }
  }
};

// Use Gemini API directly with improved response handling
const useGeminiApi = async (messages: Message[], userMessage?: string): Promise<Message> => {
  try {
    console.log("Using Gemini API directly");
    
    // Add system prompt for better code generation if the message appears to be asking for code
    let processedMessages = [...messages];
    if (userMessage && (
      userMessage.toLowerCase().includes('create') ||
      userMessage.toLowerCase().includes('generate') ||
      userMessage.toLowerCase().includes('build') ||
      userMessage.toLowerCase().includes('develop') ||
      userMessage.toLowerCase().includes('code')
    )) {
      // Add code generation system prompt
      processedMessages = [
        { role: 'system', content: codeGenerationPrompt },
        ...processedMessages
      ];
    }
    
    const responseText = await sendMessageToGemini(processedMessages);
    return {
      role: 'assistant',
      content: responseText,
      model: 'Gemini'  // Track which model generated this response
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw error;
  }
};

// Try OpenRouter with API keys fallback
const useOpenRouterWithFallback = async (
  model: AIModel,
  messages: Message[]
): Promise<Message> => {
  const apiKeys = getAllApiKeys();
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error('No API keys available');
  }
  
  // Sort API keys by priority
  const sortedKeys = [...apiKeys].sort((a, b) => a.priority - b.priority);
  
  let lastError: ApiError | null = null;
  
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
        content: responseText,
        model: model.name  // Track which model generated this response
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
