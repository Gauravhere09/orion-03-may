
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
  model?: string; // Added model property to track which AI model generated the response
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

// Updated MessageOptions interface to include selected model
export interface MessageOptions {
  message: string;
  imageUrls?: string[];
  selectedModel: any; // Model from the store
}

// Updated SendMessageParams interface for better type safety
export interface SendMessageParams {
  messages: Message[];
  options: MessageOptions;
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
