
import { Message, MessageContent } from './apiTypes';

// Helper function to get plain text from message content
export const getMessageText = (content: string | MessageContent[]): string => {
  if (typeof content === 'string') {
    return content;
  }
  
  // Safely extract text from MessageContent array
  if (!Array.isArray(content)) {
    return '';
  }
  
  return content
    .filter(item => item && item.type === 'text' && item.text)
    .map(item => (item.text || ''))
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

// Mask API key for logging/display purposes
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return '****';
  return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
};

// Function to prepare message content with images if needed
export const prepareMessageContent = (message: string, imageUrl?: string | string[]): string | MessageContent[] => {
  // If no image, return plain text
  if (!imageUrl) {
    return message;
  }
  
  // Create base content with text
  const content: MessageContent[] = [
    {
      type: "text",
      text: message
    }
  ];
  
  // Handle single image
  if (typeof imageUrl === 'string') {
    content.push({
      type: "image_url",
      image_url: {
        url: imageUrl
      }
    });
  } 
  // Handle multiple images
  else if (Array.isArray(imageUrl)) {
    imageUrl.forEach(url => {
      content.push({
        type: "image_url",
        image_url: {
          url
        }
      });
    });
  }
  
  return content;
};
