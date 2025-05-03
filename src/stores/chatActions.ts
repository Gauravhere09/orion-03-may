import { Message, GeneratedCode, sendMessageWithFallback, enhancePrompt, parseCodeResponse, getMessageText, prepareMessageContent } from '@/services/api';
import { hasApiKeys, saveChat, getChats } from '@/services/storage';
import { useModelStore } from './modelStore';
import { useUiStore } from './uiStore';

// System message for code generation
export const getCodeGenerationPrompt = (modelName: string, modelVersion: string) => `You are an AI code generator assistant powered by ${modelName} ${modelVersion}. 
Generate clean, well-structured HTML, CSS, and JavaScript code based on user requests.
Always provide your response ONLY with the code blocks - no extra text.
Format your code with:
\`\`\`html
<!-- HTML code here -->
\`\`\`
\`\`\`css
/* CSS code here */
\`\`\`
\`\`\`javascript
// JavaScript code here
\`\`\`
Use detailed comments in the code and ensure it's well-organized.
Make the code look visually appealing with good styling and responsive design.
Focus on creating intuitive and modern user interfaces.`;

export const getAssistantPrompt = (modelName: string, modelVersion: string) => `You are a helpful AI assistant powered by ${modelName} ${modelVersion}.
Respond concisely and accurately to questions and provide assistance as needed.`;

// Initialize with a welcome message or load from storage
export const initializeChat = () => {
  // Check for existing chats
  const chats = getChats();
  
  // If there are existing chats, use the most recent one
  if (chats && chats.length > 0) {
    const mostRecentChat = chats[0]; // Chats are sorted newest first
    return {
      chatId: mostRecentChat.id,
      messages: mostRecentChat.messages
    };
  }
  
  // Otherwise create a new chat
  const chatId = Date.now().toString();
  const welcomeMessage = 'Welcome to the AI Code Generator! Describe the application or component you want me to create, and I\'ll generate HTML, CSS, and JavaScript code for you.';
  
  return {
    chatId,
    messages: [{
      role: 'assistant' as const,
      content: prepareMessageContent(welcomeMessage)
    }]
  };
};

// Parse code from a response message
export const parseCodeFromResponse = (content: string): GeneratedCode => {
  return parseCodeResponse(content);
};

// Enhance user prompt for better code generation
export const enhanceUserPrompt = (prompt: string): string => {
  return `Create a well-structured, responsive design with the following requirements:\n\n${prompt}\n\nPlease include detailed comments and ensure the code is clean and maintainable.`;
};
