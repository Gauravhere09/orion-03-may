
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

export interface GeneratedCode {
  html?: string;
  css?: string;
  js?: string;
  preview?: string;
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

export const generateCode = async (
  model: AIModel,
  prompt: string,
  apiKey: string
): Promise<string> => {
  const messages: Message[] = [
    {
      role: 'system',
      content: `You are an expert web developer specializing in HTML, CSS, and JavaScript. 
      Generate clean, well-commented code based on the user's request.
      Format your response as follows:
      
      \`\`\`html
      <!-- HTML code here with detailed comments -->
      <!-- Structure the HTML document with standard doctype, head, body -->
      \`\`\`
      
      \`\`\`css
      /* CSS code here with detailed comments */
      /* Use modern CSS practices and provide clear styling */
      \`\`\`
      
      \`\`\`javascript
      // JavaScript code here with detailed comments
      // Ensure the code is functional and well-structured
      \`\`\`
      
      Ensure your code is:
      1. Well-commented with explanations
      2. Properly formatted and indented
      3. Using best practices for each language
      4. Responsive for different screen sizes
      5. Cross-browser compatible
      
      If the request is unclear, create a reasonable interpretation based on common web patterns.`
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  return await sendMessageToGroq(model, messages, apiKey);
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

// Function to parse code response into HTML, CSS, and JS
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
  
  if (result.html && result.css && result.js) {
    result.preview = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${result.css}</style>
      </head>
      <body>
        ${result.html}
        <script>${result.js}</script>
      </body>
      </html>
    `;
  }
  
  return result;
};

export const abortRequest = () => {
  // This would need to be implemented with an AbortController
  // For now, we'll just provide a function signature
};
