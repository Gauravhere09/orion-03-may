
import { Message } from './apiTypes';
import { getMessageText } from './apiHelpers';

// Send message to Gemini API
export const sendMessageToGemini = async (messages: Message[]): Promise<string> => {
  // First try with Gemini 2.0 Flash model
  try {
    const response = await sendToGeminiModel(messages, "gemini-2.0-flash");
    return response;
  } catch (error) {
    console.error("Error with primary Gemini model, falling back to alternative:", error);
    // If failed, try with Gemini 1.5 Pro
    try {
      const response = await sendToGeminiModel(messages, "gemini-1.5-pro-latest");
      return response;
    } catch (secondError) {
      console.error("Error with fallback Gemini model:", secondError);
      throw new Error("Unable to get response from Gemini. Please try again later.");
    }
  }
};

// Shared function to send messages to different Gemini models
const sendToGeminiModel = async (messages: Message[], modelId: string): Promise<string> => {
  // Hardcoded demo API key (this would normally be stored more securely)
  const API_KEY = "AIzaSyAHduoaBafMi6FI9fh6kI_u2hwXkIoAeYY"; 
  
  try {
    // Format messages for Gemini API
    const formattedMessages = messages.map(msg => {
      // Extract text from content if it's an array
      const text = typeof msg.content === 'string' 
        ? msg.content 
        : getMessageText(msg.content);

      return {
        role: msg.role === 'assistant' ? 'model' : msg.role, // Convert 'assistant' role to 'model' for Gemini
        parts: [{ text }]
      };
    });
    
    // Find the user message
    const userMessages = formattedMessages.filter(msg => msg.role === 'user');
    
    // Get the last user message
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (!lastUserMessage) {
      throw new Error('No user message found for request');
    }
    
    // Find the system message
    const systemMessage = formattedMessages.find(msg => msg.role === 'system');
    
    // Build request body for the specified Gemini model
    const requestBody = {
      contents: [
        ...(systemMessage ? [systemMessage] : []),
        lastUserMessage
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 64
      }
    };
    
    console.log(`Sending request to Gemini (${modelId}):`, JSON.stringify(requestBody));
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    const responseText = await response.text();
    console.log(`Gemini (${modelId}) raw response:`, responseText);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`Failed to parse Gemini (${modelId}) response as JSON:`, e);
      throw new Error(`Failed to parse response: ${responseText.substring(0, 100)}...`);
    }

    if (!response.ok) {
      let errorMessage = `Failed to get response from Gemini (${modelId})`;
      if (data.error) {
        errorMessage = data.error.message || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle the successful response
    if (data.candidates && 
        Array.isArray(data.candidates) && 
        data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        Array.isArray(data.candidates[0].content.parts) && 
        data.candidates[0].content.parts.length > 0) {
      
      return data.candidates[0].content.parts[0].text || '';
    }
    
    throw new Error(`Invalid response format from Gemini (${modelId})`);
  } catch (error) {
    console.error(`Error sending message to Gemini (${modelId}):`, error);
    throw error;
  }
};
