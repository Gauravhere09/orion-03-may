
export interface AIModel {
  id: string;
  name: string;
  version: string;
  provider: string;
  description: string;
  openRouterModel: string;
  contextWindow: number;
  image: string;
}

// AI models available for code generation and chat
export const aiModels: AIModel[] = [
  {
    id: 'llama-3-70b',
    name: 'Llama 3',
    version: '70B',
    provider: 'Meta',
    description: 'A powerful open-source large language model by Meta.',
    openRouterModel: 'meta-llama/llama-3-70b-instruct:free',
    contextWindow: 8192,
    image: '/placeholder.svg' // Use appropriate image when available
  },
  {
    id: 'claude-3-5',
    name: 'Claude',
    version: '3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Claude is designed to be helpful, harmless, and honest.',
    openRouterModel: 'anthropic/claude-3-5-sonnet:free',
    contextWindow: 16384,
    image: '/placeholder.svg'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    version: 'Turbo',
    provider: 'OpenAI',
    description: 'Advanced language processing for complex tasks.',
    openRouterModel: 'openai/gpt-4-turbo:free',
    contextWindow: 128000,
    image: '/placeholder.svg'
  },
  {
    id: 'mistral-large',
    name: 'Mistral',
    version: 'Large',
    provider: 'Mistral AI',
    description: 'Powerful, efficient language model for various tasks.',
    openRouterModel: 'mistral/mistral-large-latest:free',
    contextWindow: 32768,
    image: '/placeholder.svg'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    version: '2.0 Flash',
    provider: 'Google',
    description: 'Google\'s multimodal AI system with advanced reasoning capabilities.',
    openRouterModel: 'custom-gemini', // Not used directly with OpenRouter
    contextWindow: 16384,
    image: '/placeholder.svg'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek',
    version: 'Coder',
    provider: 'DeepSeek',
    description: 'Specialized model for code generation and understanding.',
    openRouterModel: 'deepseek/deepseek-coder:free',
    contextWindow: 16384,
    image: '/placeholder.svg'
  },
];
