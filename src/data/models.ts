
import { ReactNode } from "react";

export interface AIModel {
  id: string; // Used as unique identifier and to match with OpenRouter models
  name: string; // Display name
  provider: string; // Provider name (e.g., "Anthropic", "Google", etc.)
  description: string; // Brief description
  contextTokens: number; // Maximum context size
  openRouterModel: string; // Model ID used for OpenRouter API
  version: string; // Version string
  isPaid?: boolean; // Whether this is a paid model
  isVisible?: boolean; // Whether to show in selector
  supportsImages?: boolean; // Whether model supports image input
  geminiVersion?: string; // For Gemini models, specific version
  maxTokens?: number;
  gradient?: string; // Background gradient for model cards
  visionCapable?: boolean; // Whether model can process images
  strengths?: string[]; // Model's strong capabilities
}

// Update model IDs to match OpenRouter's free tier models
export const aiModels: AIModel[] = [
  {
    id: "gemini",
    name: "Gemini",
    provider: "Google",
    description: "Multimodal model from Google with strong image understanding capabilities",
    contextTokens: 32000,
    openRouterModel: "gemini",
    version: "Pro 1.0",
    isVisible: true,
    supportsImages: true,
    geminiVersion: "gemini-pro-vision",
    maxTokens: 8192,
    visionCapable: true,
    gradient: "from-blue-400 to-purple-500",
    strengths: ["Image understanding", "General knowledge", "Reasoning"]
  },
  {
    id: "mistralai/mixtral-8x7b-instruct",
    name: "Mixtral",
    provider: "Mistral AI",
    description: "Mixtral 8x7B is a high-quality sparse mixture of experts model (SMoE)",
    contextTokens: 32000,
    openRouterModel: "mistralai/mixtral-8x7b-instruct:free",
    version: "8x7B",
    isVisible: true,
    supportsImages: false,
    maxTokens: 4096,
    visionCapable: false,
    gradient: "from-indigo-500 to-purple-600",
    strengths: ["Language tasks", "Reasoning", "Knowledge"]
  },
  {
    id: "meta-llama/llama-3-8b-instruct",
    name: "Llama 3",
    provider: "Meta",
    description: "Meta's latest Llama model with strong reasoning capabilities",
    contextTokens: 8192,
    openRouterModel: "meta-llama/llama-3-8b-instruct:free",
    version: "8B",
    isVisible: true,
    supportsImages: false,
    maxTokens: 4096,
    visionCapable: false,
    gradient: "from-pink-500 to-orange-500",
    strengths: ["Reasoning", "Language understanding", "Instruction following"]
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek",
    provider: "DeepSeek",
    description: "Advanced model with strong mathematical and reasoning capabilities",
    contextTokens: 32000,
    openRouterModel: "deepseek/deepseek-r1:free",
    version: "R1",
    isVisible: true,
    supportsImages: false,
    maxTokens: 4096,
    visionCapable: false,
    gradient: "from-green-400 to-teal-500",
    strengths: ["Mathematics", "Reasoning", "General knowledge"]
  },
  {
    id: "meta-llama/codellama-34b-instruct",
    name: "CodeLlama",
    provider: "Meta",
    description: "Specialized in code generation and understanding",
    contextTokens: 16000,
    openRouterModel: "meta-llama/codellama-34b-instruct:free",
    version: "34B",
    isVisible: true,
    supportsImages: false,
    maxTokens: 4096,
    visionCapable: false,
    gradient: "from-blue-500 to-cyan-400",
    strengths: ["Coding", "Logic", "Technical knowledge"]
  }
];
