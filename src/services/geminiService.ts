
import { Message } from './apiTypes';
import { getMessageText } from './apiHelpers';
import { getApiKey } from './apiKeyService';
import { supabase } from "@/integrations/supabase/client";

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

// Get Gemini API key (first try Supabase, then fallback to localStorage or default key)
const getGeminiApiKey = async (): Promise<string> => {
  // First try to get from Supabase if user is authenticated
  const session = await supabase.auth.getSession();
  if (session.data.session) {
    const supabaseKey = await getApiKey('gemini');
    if (supabaseKey) return supabaseKey;
  }
  
  // Try localStorage
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey) return localKey;
  
  // Fallback to default key (for development only)
  return "AIzaSyAzD5oKhOg1xt7wuUvORklBZ5qaO7TT8g8";
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
  try {
    const apiKey = await getGeminiApiKey();
    
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
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
