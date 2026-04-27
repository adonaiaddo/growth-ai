export interface AdCopy {
  primaryText: string;
  headline: string;
  description: string;
  callToAction: string;
}

export interface TargetingSuggestion {
  countries: string[];
  ageMin: number;
  ageMax: number;
  interests: string[];
  optimizationGoal: string;
  objective: string;
  reasoning: string;
}

export interface GeneratedImage {
  url: string;
  revisedPrompt: string;
}
