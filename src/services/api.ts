import { Message, SendMessageParams, ApiError, MessageContent, GeneratedCode } from './apiTypes';
import { getApiKey, listApiKeys } from './apiKeyService';

// Function to extract text content from a message
export const getMessageText = (content: string | MessageContent[]): string => {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content
      .filter(item => item.type === 'text')
      .map(item => item.text)
      .join('\n');
  }
  
  return '';
};

// Function to prepare message content for API requests
export const prepareMessageContent = (message: string, imageUrls: string[] = []): string | MessageContent[] => {
  if (imageUrls.length === 0) {
    return message;
  }
  
  const content: MessageContent[] = [
    ...imageUrls.map(url => ({
      type: 'image_url',
      image_url: { url }
    })),
    { type: 'text', text: message }
  ];
  
  return content;
};

// Function to send a message to the Gemini API
const sendToGemini = async (
  messages: Message[], 
  message: string, 
  imageUrls: string[] = [],
  selectedModel: any
): Promise<Message> => {
  // Get all available Gemini API keys directly from Supabase via the apiKeyService
  const apiKey = await getApiKey('gemini');
  
  if (!apiKey) {
    throw new ApiError('Gemini API key not found', 'gemini');
  }
  
  // Prepare the conversation history
  const conversationHistory = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      parts: [{ text: getMessageText(msg.content) }]
    }));
  
  // Add the new user message
  const userMessage = {
    role: 'user' as 'user' | 'assistant' | 'system',
    parts: [] as any[]
  };
  
  // Add images if provided
  if (imageUrls.length > 0) {
    for (const url of imageUrls) {
      userMessage.parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: url.split(',')[1] // Remove the data:image/jpeg;base64, prefix
        }
      });
    }
  }
  
  // Add text message
  userMessage.parts.push({ text: message });
  
  // Add the user message to the conversation
  conversationHistory.push(userMessage);
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new ApiError(data.error.message || 'Gemini API error', 'gemini', data.error.code);
    }
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new ApiError('No response from Gemini API', 'gemini');
    }
    
    const content = data.candidates[0].content.parts[0].text;
    
    return {
      role: 'assistant',
      content,
      model: selectedModel.name // Include the model name in the response
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Gemini API error: ${error}`, 'gemini');
  }
};

// Function to send a message to the OpenRouter API
const sendToOpenRouter = async (
  messages: Message[], 
  message: string, 
  imageUrls: string[] = [],
  selectedModel: any
): Promise<Message> => {
  // Get OpenRouter API key from Supabase using apiKeyService
  const apiKey = await getApiKey('openrouter');
  
  if (!apiKey) {
    throw new ApiError('OpenRouter API key not found', 'openrouter');
  }
  
  // Prepare the conversation history
  const conversationHistory = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => {
      if (typeof msg.content === 'string') {
        return {
          role: msg.role,
          content: msg.content
        };
      } else if (Array.isArray(msg.content)) {
        return {
          role: msg.role,
          content: msg.content
        };
      }
      return msg;
    });
  
  // Add the new user message with images if provided
  const userMessage: Message = {
    role: 'user',
    content: imageUrls.length > 0
      ? [
          ...imageUrls.map(url => ({
            type: 'image_url',
            image_url: { url }
          })),
          { type: 'text', text: message }
        ]
      : message
  };
  
  // Add the user message to the conversation
  conversationHistory.push(userMessage);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Orion AI Code Generator'
      },
      body: JSON.stringify({
        model: selectedModel.id,
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new ApiError(data.error.message || 'OpenRouter API error', 'openrouter', data.error.type);
    }
    
    if (!data.choices || data.choices.length === 0) {
      throw new ApiError('No response from OpenRouter API', 'openrouter');
    }
    
    const content = data.choices[0].message.content;
    
    return {
      role: 'assistant',
      content,
      model: selectedModel.name // Include the model name in the response
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`OpenRouter API error: ${error}`, 'openrouter');
  }
};

// Function to send a message with fallback to another API if the first one fails
export const sendMessageWithFallback = async (params: SendMessageParams): Promise<Message> => {
  const { messages, options } = params;
  const { message, imageUrls = [], selectedModel } = options;

  // Show thinking message
  const isRetry = messages.length > 0 && messages[messages.length - 1].role === 'user';
  const tempResponse: Message = {
    role: 'assistant',
    content: isRetry ? "Regenerating response..." : "Thinking...",
    model: selectedModel.name // Include model name in temp response
  };

  try {
    // First, try to send to Gemini if it's selected
    if (selectedModel.id === 'gemini') {
      const geminiResponse = await sendToGemini(messages, message, imageUrls, selectedModel);
      return geminiResponse;
    } else {
      // Otherwise use OpenRouter
      const openRouterResponse = await sendToOpenRouter(messages, message, imageUrls, selectedModel);
      return openRouterResponse;
    }
  } catch (error) {
    // If primary API fails, try fallback
    console.error('Primary API failed, trying fallback:', error);
    
    try {
      // If Gemini was the first choice, try OpenRouter as fallback
      if (selectedModel.id === 'gemini') {
        const fallbackResponse = await sendToOpenRouter(messages, message, imageUrls, selectedModel);
        return fallbackResponse;
      } else {
        // If OpenRouter was first choice, try Gemini as fallback
        const fallbackResponse = await sendToGemini(messages, message, imageUrls, selectedModel);
        return fallbackResponse;
      }
    } catch (fallbackError) {
      // If both APIs fail, throw a combined error
      console.error('Fallback API also failed:', fallbackError);
      throw new ApiError(
        `All APIs failed. ${error instanceof ApiError ? error.message : error}. Fallback: ${fallbackError instanceof ApiError ? fallbackError.message : fallbackError}`,
        selectedModel.id === 'gemini' ? 'gemini' : 'openrouter'
      );
    }
  }
};

// Function to enhance a user prompt for better code generation
export const enhancePrompt = (prompt: string): string => {
  // Add specific instructions for code generation
  let enhancedPrompt = prompt.trim();
  
  // If the prompt doesn't mention specific technologies, suggest some
  if (!enhancedPrompt.toLowerCase().includes('react') && 
      !enhancedPrompt.toLowerCase().includes('vue') && 
      !enhancedPrompt.toLowerCase().includes('angular')) {
    enhancedPrompt += "\n\nPlease use modern HTML, CSS, and JavaScript. Include responsive design principles.";
  }
  
  // Add instructions for code formatting
  enhancedPrompt += "\n\nProvide the code in separate sections for HTML, CSS, and JavaScript using markdown code blocks. Make sure the code is well-commented and follows best practices.";
  
  return enhancedPrompt;
};

// Function to parse code blocks from a response
export const parseCodeResponse = (content: string): GeneratedCode => {
  const htmlRegex = /```html([\s\S]*?)```/;
  const cssRegex = /```css([\s\S]*?)```/;
  const jsRegex = /```(?:javascript|js)([\s\S]*?)```/;
  
  const htmlMatch = content.match(htmlRegex);
  const cssMatch = content.match(cssRegex);
  const jsMatch = content.match(jsRegex);
  
  const html = htmlMatch ? htmlMatch[1].trim() : '';
  const css = cssMatch ? cssMatch[1].trim() : '';
  const js = jsMatch ? jsMatch[1].trim() : '';
  
  // Create a preview HTML that combines all three
  const preview = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${css}</style>
    </head>
    <body>
      ${html}
      <script>${js}</script>
    </body>
    </html>
  `;
  
  return { html, css, js, preview };
};

// Function to check if a message contains code blocks
export const hasCodeBlocks = (content: string | any[]): boolean => {
  const text = getMessageText(content);
  return text.includes("```html") || 
         text.includes("```css") || 
         text.includes("```js") || 
         text.includes("```javascript");
};
