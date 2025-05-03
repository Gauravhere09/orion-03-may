
import { AIModel } from '@/data/models';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

export const sendMessageToGroq = async (
  model: AIModel, 
  messages: Message[], 
  apiKey: string
): Promise<string> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model.groqModel,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'Failed to get response from Groq API';
      
      if (errorData.error?.code === "model_not_found" || errorData.error?.code === "model_decommissioned") {
        throw new Error(`Model unavailable: ${errorMessage}`);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json() as ChatCompletionResponse;
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error sending message to Groq:', error);
    throw error;
  }
};

// Helper function to regenerate a response
export const regenerateResponse = async (
  model: AIModel,
  messages: Message[],
  apiKey: string,
  lastUserMessageIndex: number
): Promise<string> => {
  // Remove the assistant's last message if it exists
  const messagesToSend = messages.slice(0, lastUserMessageIndex + 1);
  return sendMessageToGroq(model, messagesToSend, apiKey);
};
