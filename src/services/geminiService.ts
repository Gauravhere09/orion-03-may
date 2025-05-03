
import { Message } from './apiTypes';
import { getMessageText } from './apiHelpers';

// Send message to Gemini API
export const sendMessageToGemini = async (messages: Message[]): Promise<string> => {
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
    
    // Keep only the essential parts of the conversation
    const systemMessage = formattedMessages.find(msg => msg.role === 'system');
    const userMessages = formattedMessages.filter(msg => msg.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (!lastUserMessage) {
      throw new Error('No user message found for Gemini API request');
    }
    
    // Build request body
    const requestBody = {
      contents: [
        systemMessage, 
        lastUserMessage
      ].filter(Boolean), // Filter out undefined values
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };
    
    console.log('Sending request to Gemini API:', JSON.stringify(requestBody));
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      
      let errorMessage = 'Failed to get response from Gemini API';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the status text
        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data));
    
    if (data.candidates && data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text || '';
    }
    
    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    throw error;
  }
};
