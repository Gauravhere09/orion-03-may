
import { AIModel } from '@/data/models';
import { Message, ChatCompletionResponse, ErrorResponse, ApiError } from './apiTypes';

// Send message to OpenRouter API
export const sendMessageToOpenRouter = async (
  model: AIModel,
  messages: Message[],
  apiKey: string
): Promise<string> => {
  try {
    // Use the model ID from the data source
    const modelId = model.openRouterModel;
    
    if (!modelId || modelId === 'custom-gemini') {
      throw new Error(`Invalid model ID for OpenRouter: ${modelId}`);
    }
    
    console.log(`Sending request to OpenRouter with model: ${modelId}`);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Code Generator'
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 2048,
      })
    });

    const responseText = await response.text();
    
    // Log the raw response for debugging
    console.log('OpenRouter raw response:', responseText);
    
    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse OpenRouter response as JSON:", e);
      throw new ApiError(`Failed to parse OpenRouter response: ${responseText.substring(0, 100)}...`, apiKey);
    }

    // Check if the response contains an error
    if (data.error) {
      const errorMessage = data.error.message || 'Unknown error from OpenRouter API';
      const errorCode = data.error.code || data.error.type;
      console.error('OpenRouter API returned an error:', errorMessage, errorCode);
      throw new ApiError(errorMessage, apiKey, errorCode);
    }
    
    // Check if the response has the expected structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('Invalid response format from OpenRouter API. Missing choices array:', data);
      throw new ApiError('Invalid response format from OpenRouter API: Missing choices', apiKey);
    }
    
    const choice = data.choices[0];
    if (!choice.message) {
      console.error('Invalid response format from OpenRouter API. Missing message in choice:', choice);
      throw new ApiError('Invalid response format from OpenRouter API: Missing message', apiKey);
    }
    
    return choice.message.content || '';
  } catch (error) {
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Wrap other errors as ApiError
    console.error('Error sending message to OpenRouter:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred', 
      apiKey
    );
  }
};
