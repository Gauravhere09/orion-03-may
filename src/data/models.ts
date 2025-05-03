
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  version: string;
  maxTokens: number;
  openRouterModel: string;
  gradient: string;
  strengths: string[];
  visionCapable?: boolean;
}

export const aiModels: AIModel[] = [
  {
    id: "llama-4-maverick",
    name: "Llama 4",
    provider: "Meta",
    description: "Meta's latest open model with powerful vision capabilities.",
    version: "Maverick",
    maxTokens: 4096,
    openRouterModel: "meta-llama/llama-4-maverick:free",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    strengths: ["Vision", "Reasoning", "Latest model"],
    visionCapable: true
  },
  {
    id: "gemini-2-flash",
    name: "Gemini",
    provider: "Google",
    description: "Google's multimodal model with vision capabilities.",
    version: "2.0 Flash",
    maxTokens: 4096,
    openRouterModel: "google/gemini-2.0-flash-exp:free",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    strengths: ["Vision", "Fast responses", "Knowledge"],
    visionCapable: true
  },
  {
    id: "deepseek-chat-v3",
    name: "DeepSeek Chat",
    provider: "DeepSeek",
    description: "Latest DeepSeek chat model with high performance.",
    version: "v3",
    maxTokens: 8192,
    openRouterModel: "deepseek/deepseek-chat-v3-0324:free",
    gradient: "from-emerald-500 via-teal-500 to-green-500",
    strengths: ["Reasoning", "Context understanding", "Knowledge"],
    visionCapable: false
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "DeepSeek",
    description: "Reliable DeepSeek chat model for various tasks.",
    version: "Standard",
    maxTokens: 8192,
    openRouterModel: "deepseek/deepseek-chat:free",
    gradient: "from-sky-500 via-cyan-500 to-blue-600",
    strengths: ["General purpose", "Code generation", "Knowledge"],
    visionCapable: false
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "Advanced reasoning model with code understanding.",
    version: "R1",
    maxTokens: 8192,
    openRouterModel: "deepseek/deepseek-r1:free",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    strengths: ["Code generation", "Reasoning", "Knowledge"],
    visionCapable: false
  },
  {
    id: "nemotron-ultra",
    name: "Nemotron Ultra",
    provider: "NVIDIA",
    description: "NVIDIA's Llama 3.1 Nemotron Ultra model with powerful capabilities.",
    version: "253B", 
    maxTokens: 8192,
    openRouterModel: "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    gradient: "from-green-600 via-teal-600 to-cyan-600",
    strengths: ["Task versatility", "Reasoning", "Advanced capabilities"],
    visionCapable: false
  }
];
