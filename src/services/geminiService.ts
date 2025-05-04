
import { Message } from './apiTypes';
import { getMessageText } from './apiHelpers';

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const GEMINI_API_KEY = "AIzaSyAzD5oKhOg1xt7wuUvORklBZ5qaO7TT8g8"; // This is a public API key from Vertex AI

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
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
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
