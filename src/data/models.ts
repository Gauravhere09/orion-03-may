
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  version: string;
  maxTokens: number;
  groqModel: string;
  gradient: string;
  strengths: string[];
}

export const aiModels: AIModel[] = [
  {
    id: "llama3-8b",
    name: "Llama 3",
    provider: "Meta",
    description: "Meta's latest open weights model with strong performance and reasoning.",
    version: "8B",
    maxTokens: 8192,
    groqModel: "llama3-8b-8192",
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    strengths: ["Well-balanced", "Good reasoning", "Open weights"]
  },
  {
    id: "llama3-70b",
    name: "Llama 3",
    provider: "Meta",
    description: "More capable version with better reasoning and knowledge.",
    version: "70B",
    maxTokens: 8192,
    groqModel: "llama3-70b-8192",
    gradient: "from-blue-700 via-indigo-700 to-purple-700",
    strengths: ["Strong reasoning", "Content generation", "Knowledge"]
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral",
    provider: "Mistral AI",
    description: "A mixture of experts model with strong capabilities.",
    version: "8x7B",
    maxTokens: 32768,
    groqModel: "mixtral-8x7b-32768",
    gradient: "from-emerald-500 via-teal-500 to-green-500",
    strengths: ["Long context", "Code generation", "Multilingual"]
  },
  {
    id: "gemma-7b",
    name: "Gemma",
    provider: "Google",
    description: "Google's lightweight and efficient open model.",
    version: "7B", 
    maxTokens: 8192,
    groqModel: "gemma-7b-it",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    strengths: ["Efficient", "Fast responses", "Good instruction following"]
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek",
    provider: "DeepSeek AI",
    description: "Advanced large language model with strong reasoning capabilities.",
    version: "70B",
    maxTokens: 16384,
    groqModel: "deepseek-coder-33b-instruct",
    gradient: "from-sky-500 via-cyan-500 to-blue-600",
    strengths: ["Advanced reasoning", "Code generation", "Knowledge"]
  }
];
