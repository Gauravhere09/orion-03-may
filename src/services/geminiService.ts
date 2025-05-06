
import { Message } from './apiTypes';
import { getMessageText } from './apiHelpers';
import { getApiKey } from './apiKeyService';
import { supabase } from "@/integrations/supabase/client";

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Get Gemini API key (only from Supabase)
const getGeminiApiKeys = async (): Promise<string[]> => {
  const keys = [];
  
  // Get from Supabase
  const supabaseKey = await getApiKey('gemini');
  if (supabaseKey) keys.push(supabaseKey);
  
  if (keys.length === 0) {
    throw new Error('Gemini API key not found. Please add your API key in the settings.');
  }
  
  return keys;
}

// Convert our message format to Gemini's format
const convertMessagesToGemini = (messages: Message[]) => {
  // Filter out system messages as Gemini doesn't support them natively
  const userMessages = messages.filter(msg => msg.role !== 'system');
  
  // Format messages for Gemini API
  return userMessages.map(msg => {
    // Extract text from complex messages with images
    const text = getMessageText(msg.content);
    
    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }]
    };
  });
};

// Send a message to Gemini API with optimized settings
export const sendMessageToGemini = async (messages: Message[]): Promise<string> => {
  const apiKeys = await getGeminiApiKeys();
  let lastError: Error | null = null;
  
  // Try each API key until one works
  for (const apiKey of apiKeys) {
    try {
      // Get the most recent messages for context (limit to reduce token usage)
      const recentMessages = messages.slice(-10);
      
      // Convert to Gemini format
      const formattedMessages = convertMessagesToGemini(recentMessages);
      
      // Create request body
      const requestBody = {
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      };

      // Make API request
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Extract the response text from Gemini's response
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        return responseText;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error(`Error calling Gemini API with key ${apiKey.substring(0, 5)}...`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      // Continue to next key
    }
  }
  
  // If we're here, all keys failed
  throw lastError || new Error('All Gemini API keys failed');
};
