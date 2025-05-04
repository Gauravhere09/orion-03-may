
import { Message, GeneratedCode, sendMessageWithFallback, enhancePrompt, parseCodeResponse, getMessageText, prepareMessageContent } from '@/services/api';
import { hasApiKeys, saveChat, getChats } from '@/services/storage';
import { useModelStore } from './modelStore';
import { useUiStore } from './uiStore';

// Enhanced system message for code generation
export const getCodeGenerationPrompt = (modelName: string, modelVersion: string) => `You are an expert web developer assistant powered by ${modelName} ${modelVersion}. 
Generate clean, well-structured, responsive HTML, CSS, and JavaScript code based on user requests.

IMPORTANT INSTRUCTIONS:
- Provide your response with code blocks ONLY - no explanations outside of code blocks
- Format your response with these exact code blocks:
\`\`\`html
<!-- HTML code here -->
\`\`\`
\`\`\`css
/* CSS code here */
\`\`\`
\`\`\`javascript
// JavaScript code here */
\`\`\`

CODE QUALITY REQUIREMENTS:
1. Use semantic HTML5 elements
2. Create responsive designs with mobile-first approach
3. Add detailed comments explaining your code
4. Ensure cross-browser compatibility
5. Follow best practices and modern standards
6. Include error handling where appropriate
7. Make all UI elements interactive and functional

Remember, your job is to generate the COMPLETE implementation, not a skeleton or placeholder.`;

// Enhanced system message for chat mode
export const getAssistantPrompt = (modelName: string, modelVersion: string) => `You are a helpful AI assistant powered by ${modelName} ${modelVersion}.
Respond concisely and accurately to questions and provide practical assistance.

When the user asks for explanations about code or technical topics:
1. Use simple, clear language avoiding unnecessary jargon
2. Break complex concepts into understandable parts
3. Provide relevant examples when appropriate
4. Keep responses focused on the specific question
5. Prioritize accuracy over verbosity

For general knowledge questions, be helpful, friendly, and direct.`;

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

// Enhanced prompt for better code generation
export const enhanceUserPrompt = (prompt: string): string => {
  // Advanced prompt engineering
  return `Create a well-structured, responsive web application with the following requirements:

${prompt}

Technical specifications:
- Use semantic HTML5 elements
- Implement responsive design (mobile-first)
- Add detailed comments explaining code logic
- Include error handling where appropriate
- Follow accessibility best practices
- Optimize for performance
- Use modern CSS features (flexbox/grid)

Please provide the complete code implementation, not just a starting point.`;
};

// Check if prompt is asking for code generation
export const isCodeGenerationRequest = (prompt: string): boolean => {
  const codeIndicators = [
    'create', 'build', 'implement', 'develop', 'generate', 
    'make a', 'code', 'application', 'component', 'website',
    'page', 'ui', 'interface', 'app', 'web'
  ];
  
  const lowercasePrompt = prompt.toLowerCase();
  return codeIndicators.some(indicator => lowercasePrompt.includes(indicator));
};
