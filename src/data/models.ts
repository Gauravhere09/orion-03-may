
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
    id: "llama2-70b",
    name: "Llama 2",
    provider: "Meta",
    description: "Previous generation of Meta's powerful open model.",
    version: "70B",
    maxTokens: 4096,
    groqModel: "llama2-70b-4096",
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    strengths: ["Versatile", "Well-documented", "Stable"]
  },
  {
    id: "mixtral-medium",
    name: "Mixtral",
    provider: "Mistral AI",
    description: "A mixture of experts model with strong capabilities.",
    version: "Medium",
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
  }
];
