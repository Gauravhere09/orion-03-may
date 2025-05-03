import { AIModel } from '@/data/models';
import { ApiKey, getAllApiKeys } from './storage';

export interface MessageContent {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
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

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    type?: string;
  };
}

export interface GeneratedCode {
  html?: string;
  css?: string;
  js?: string;
  preview?: string;
}

// API error that includes which key was used
export class ApiError extends Error {
  apiKey: string;
  code?: string;
  
  constructor(message: string, apiKey: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.apiKey = apiKey;
    this.code = code;
  }
}

// Try each API key in order until one works
export const sendMessageWithFallback = async (
  model: AIModel,
  messages: Message[]
): Promise<string> => {
  const apiKeys = getAllApiKeys();
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error('No API keys available');
  }
  
  // Sort API keys by priority
  const sortedKeys = [...apiKeys].sort((a, b) => a.priority - b.priority);
  
  let lastError: ApiError | null = null;
  
  // Try each API key in order until one works
  for (const apiKey of sortedKeys) {
    try {
      const response = await sendMessageToOpenRouter(model, messages, apiKey.key);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error;
        console.error(`API key ${maskApiKey(error.apiKey)} failed:`, error.message);
        // Continue to next API key
      } else {
        // For non-API errors, throw immediately
        throw error;
      }
    }
  }
  
  // If we get here, all API keys failed
  if (lastError) {
    throw new Error(`All API keys failed. Last error: ${lastError.message}`);
  } else {
    throw new Error('All API keys failed with unknown errors');
  }
};

// Mask API key for logging/display purposes
const maskApiKey = (apiKey: string): string => {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '****';
  return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
};

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
    return data.choices[0].message.content;
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

// Function to enhance user prompt for code generation
export const enhancePrompt = (prompt: string): string => {
  return `Generate code for: ${prompt}
  
  Respond with well-structured, commented HTML, CSS, and JavaScript code to create this application.
  Format your response with proper code blocks:
  
  \`\`\`html
  <!-- HTML code here -->
  \`\`\`
  
  \`\`\`css
  /* CSS code here */
  \`\`\`
  
  \`\`\`javascript
  // JavaScript code here
  \`\`\`
  
  Do NOT include any explanatory text outside the code blocks.`;
};

// Parse code response into HTML, CSS, and JS
export const parseCodeResponse = (response: string): GeneratedCode => {
  const result: GeneratedCode = {};
  
  const htmlMatch = response.match(/```html\n([\s\S]*?)```/);
  if (htmlMatch && htmlMatch[1]) {
    result.html = htmlMatch[1].trim();
  }
  
  const cssMatch = response.match(/```css\n([\s\S]*?)```/);
  if (cssMatch && cssMatch[1]) {
    result.css = cssMatch[1].trim();
  }
  
  const jsMatch = response.match(/```javascript\n([\s\S]*?)```/) || response.match(/```js\n([\s\S]*?)```/);
  if (jsMatch && jsMatch[1]) {
    result.js = jsMatch[1].trim();
  }
  
  if (result.html) {
    result.preview = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${result.css || ''}</style>
      </head>
      <body>
        ${result.html}
        <script>${result.js || ''}</script>
      </body>
      </html>
    `;
  }
  
  return result;
};

// Function to prepare message content with images if needed
export const prepareMessageContent = (message: string, imageUrl?: string): string | MessageContent[] => {
  if (!imageUrl) {
    return message;
  }
  
  return [
    {
      type: "text",
      text: message
    },
    {
      type: "image_url",
      image_url: {
        url: imageUrl
      }
    }
  ];
};

// Helper function to get plain text from message content
export const getMessageText = (content: string | MessageContent[]): string => {
  if (typeof content === 'string') {
    return content;
  }
  
  // Extract text from MessageContent array
  return content
    .filter(item => item.type === 'text' && item.text)
    .map(item => item.text as string)
    .join(' ');
};

// Helper function to check if content contains code blocks
export const hasCodeBlocks = (content: string | MessageContent[]): boolean => {
  const text = getMessageText(content);
  return text.includes("```html") || 
         text.includes("```css") || 
         text.includes("```js") || 
         text.includes("```javascript");
};
