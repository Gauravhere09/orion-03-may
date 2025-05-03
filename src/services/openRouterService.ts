
import { AIModel } from '@/data/models';
import { Message, ChatCompletionResponse, ErrorResponse, ApiError } from './apiTypes';

// Send message to OpenRouter API
export const sendMessageToOpenRouter = async (
  model: AIModel,
  messages: Message[],
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model.openRouterModel,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      })
    });

    if (!response.ok) {
      const errorData = await response.json() as ErrorResponse;
      const errorMessage = errorData.error?.message || 'Failed to get response from OpenRouter API';
      const errorCode = errorData.error?.code || errorData.error?.type;
      
      throw new ApiError(errorMessage, apiKey, errorCode);
    }

    const data = await response.json() as ChatCompletionResponse;
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    throw new ApiError('Invalid response format from OpenRouter API', apiKey);
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
