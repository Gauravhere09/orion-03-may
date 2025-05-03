
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
    id: "claude3-opus",
    name: "Claude 3",
    provider: "Anthropic",
    description: "Flagship model from Anthropic with strong reasoning.",
    version: "Opus",
    maxTokens: 102400,
    groqModel: "claude-3-opus-20240229",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    strengths: ["Advanced reasoning", "Very long context", "Nuanced responses"]
  },
  {
    id: "claude3-sonnet",
    name: "Claude 3",
    provider: "Anthropic",
    description: "Balance of intelligence and speed from Anthropic.",
    version: "Sonnet",
    maxTokens: 102400,
    groqModel: "claude-3-sonnet-20240229",
    gradient: "from-sky-400 via-blue-400 to-indigo-400",
    strengths: ["Fast responses", "Long context", "Good value"]
  },
  {
    id: "command-r",
    name: "Command R",
    provider: "Cohere",
    description: "Specialized for reasoning and advanced tasks.",
    version: "Plus",
    maxTokens: 128000,
    groqModel: "command-r-plus",
    gradient: "from-pink-500 via-red-500 to-yellow-500",
    strengths: ["Task automation", "Summarization", "Analysis"]
  }
];
