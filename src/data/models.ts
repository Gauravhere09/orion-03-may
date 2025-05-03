
export interface AIModel {
  id: string;
  name: string;
  version: string;
  provider: string;
  description: string;
  openRouterModel: string;
  contextWindow: number;
  image: string;
  gradient: string;
  visionCapable: boolean;
  strengths: string[];
  supportsImages: boolean; // Added this property
}

// AI models available for code generation and chat
export const aiModels: AIModel[] = [
  {
    id: 'llama-4',
    name: 'Llama 4',
    version: 'Maverick',
    provider: 'Meta',
    description: 'Latest powerful open-source large language model by Meta with vision capabilities.',
    openRouterModel: 'meta-llama/llama-4-maverick:free',
    contextWindow: 128000,
    image: '/placeholder.svg',
    gradient: 'from-blue-400 to-blue-600',
    visionCapable: true,
    strengths: ['Fast', 'Vision', 'Cutting Edge'],
    supportsImages: true
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek',
    version: 'Chat',
    provider: 'DeepSeek',
    description: 'Versatile language model by DeepSeek with strong reasoning capabilities.',
    openRouterModel: 'deepseek/deepseek-chat:free',
    contextWindow: 16384,
    image: '/placeholder.svg',
    gradient: 'from-amber-400 to-amber-600',
    visionCapable: false,
    strengths: ['Reasoning', 'Precise', 'Efficient'],
    supportsImages: false
  },
  {
    id: 'deepseek-chat-v3',
    name: 'DeepSeek',
    version: 'Chat v3',
    provider: 'DeepSeek',
    description: 'Latest DeepSeek Chat model with enhanced conversational abilities.',
    openRouterModel: 'deepseek/deepseek-chat-v3-0324:free',
    contextWindow: 32768,
    image: '/placeholder.svg',
    gradient: 'from-purple-400 to-purple-600',
    visionCapable: false,
    strengths: ['Chat', 'Knowledge', 'Reasoning'],
    supportsImages: false
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek',
    version: 'R1',
    provider: 'DeepSeek',
    description: 'Advanced reasoning model with robust knowledge capabilities.',
    openRouterModel: 'deepseek/deepseek-r1:free',
    contextWindow: 32768,
    image: '/placeholder.svg',
    gradient: 'from-teal-400 to-emerald-600',
    visionCapable: false,
    strengths: ['Knowledge', 'Detailed', 'Reliable'],
    supportsImages: false
  },
  {
    id: 'nemotron-ultra',
    name: 'Nemotron',
    version: 'Ultra 253B',
    provider: 'NVIDIA',
    description: 'NVIDIA\'s massive 253B parameter model based on Llama 3.1 architecture.',
    openRouterModel: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    contextWindow: 32768,
    image: '/placeholder.svg',
    gradient: 'from-green-400 to-green-600',
    visionCapable: false,
    strengths: ['Powerful', 'Comprehensive', 'Advanced'],
    supportsImages: false
  },
  {
    id: 'gemini',
    name: 'Gemini',
    version: '2.0 Flash',
    provider: 'Google',
    description: 'Google\'s multimodal AI system with advanced reasoning capabilities.',
    openRouterModel: 'custom-gemini', // Not used directly with OpenRouter
    contextWindow: 16384,
    image: '/placeholder.svg',
    gradient: 'from-red-400 to-red-600',
    visionCapable: true,
    strengths: ['Multimodal', 'Reasoning', 'Comprehensive'],
    supportsImages: true
  }
];
