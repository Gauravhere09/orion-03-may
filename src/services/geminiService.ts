
import { Message } from './apiTypes';
import { getMessageText } from './apiHelpers';

// Send message to Gemini API
export const sendMessageToGemini = async (messages: Message[]): Promise<string> => {
  const API_KEY = "AIzaSyAHduoaBafMi6FI9fh6kI_u2hwXkIoAeYY"; // Public API key
  
  try {
    // Format the conversation context for better performance
    const formattedMessages = formatMessagesForGemini(messages);
    const conversationContext = buildGeminiConversationContext(formattedMessages);
    
    // Build request body for Gemini-2.0-flash model
    const requestBody = {
      contents: conversationContext,
      generationConfig: {
        temperature: 0.4, // Lower temperature for faster, more deterministic responses
        maxOutputTokens: 4096, // Increase token limit for more comprehensive code generation
        topP: 0.95,
        topK: 64
      }
    };
    
    console.log('Sending request to Gemini API');
    
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

    // Process response
    const responseData = await processGeminiResponse(response);
    return responseData;
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    throw error;
  }
};

// Format messages for Gemini API
const formatMessagesForGemini = (messages: Message[]) => {
  return messages.map(msg => {
    const text = typeof msg.content === 'string' 
      ? msg.content 
      : getMessageText(msg.content);

    return {
      role: msg.role === 'assistant' ? 'model' : msg.role, // Convert roles for Gemini
      parts: [{ text }]
    };
  });
};

// Build a more effective conversation context for Gemini
const buildGeminiConversationContext = (formattedMessages: any[]) => {
  // Extract system message if present
  const systemMessage = formattedMessages.find(msg => msg.role === 'system');
  
  // Get recent conversation history (last 10 messages)
  const recentMessages = formattedMessages
    .filter(msg => msg.role !== 'system')
    .slice(-10); // Limit context to last 10 messages for better performance
  
  // Build context with system message first if available
  return [
    ...(systemMessage ? [systemMessage] : []),
    ...recentMessages
  ];
};

// Process Gemini API response
const processGeminiResponse = async (response: Response): Promise<string> => {
  const responseText = await response.text();
  console.log('Gemini API response received');
  
  // Try to parse the response as JSON
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", e);
    throw new Error(`Failed to parse Gemini response: ${responseText.substring(0, 100)}...`);
  }

  // Handle errors
  if (!response.ok) {
    let errorMessage = 'Failed to get response from Gemini API';
    if (data.error) {
      errorMessage = data.error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Extract text content from successful response
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
};
