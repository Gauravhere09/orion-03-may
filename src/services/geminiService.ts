
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
    
    // Find the system message and user messages
    const systemMessage = formattedMessages.find(msg => msg.role === 'system');
    const userMessages = formattedMessages.filter(msg => msg.role === 'user');
    
    // Get the last user message
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    if (!lastUserMessage) {
      throw new Error('No user message found for Gemini API request');
    }
    
    // Build request body
    const requestBody = {
      contents: [
        ...(systemMessage ? [systemMessage] : []),
        lastUserMessage
      ],
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

    const responseText = await response.text();
    console.log('Gemini API raw response:', responseText);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", e);
      throw new Error(`Failed to parse Gemini response: ${responseText.substring(0, 100)}...`);
    }

    if (!response.ok) {
      let errorMessage = 'Failed to get response from Gemini API';
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
    
    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    throw error;
  }
};
