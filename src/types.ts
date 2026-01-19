export type AIProvider = 'openai' | 'gemini' | 'claude';

export type OpenAIModel = 
  | 'gpt-4o' | 'gpt-4o-mini'
  | 'gpt-4-turbo' | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'o1' | 'o1-mini' | 'o1-preview';

export type GeminiModel = 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash';

export type ClaudeModel = 'claude-3-5-sonnet-20241022' | 'claude-3-opus-20240229' | 'claude-3-haiku-20240307';

export interface PricingTier {
  input: number;
  output: number;
}

export const PRICING_PER_MILLION_TOKENS: {
  openai: Record<OpenAIModel, PricingTier>;
  gemini: Record<GeminiModel, PricingTier>;
  claude: Record<ClaudeModel, PricingTier>;
} = {
  openai: {
    'gpt-4o': { input: 2.5, output: 10 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'gpt-4': { input: 30, output: 60 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'o1': { input: 15, output: 60 },
    'o1-mini': { input: 3, output: 12 },
    'o1-preview': { input: 15, output: 60 },
  },
  gemini: {
    'gemini-1.5-flash': { input: 0.075, output: 0.3 },
    'gemini-1.5-pro': { input: 1.25, output: 5 },
    'gemini-2.0-flash': { input: 0.1, output: 0.4 },
  },
  claude: {
    'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
    'claude-3-opus-20240229': { input: 15, output: 75 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  },
};

export interface InsightMessage {
  message: string;
  description: string;
}

export interface PluginSettings {
  aiProvider: AIProvider;
  
  openaiApiKey: string;
  openaiModel: OpenAIModel;
  
  geminiApiKey: string;
  geminiModel: GeminiModel;
  
  claudeApiKey: string;
  claudeModel: ClaudeModel;
  
  airtableApiKey: string;
  airtableBaseId: string;
  airtableTableName: string;
  airtableMessageField: string;
  airtableDescriptionField: string;
  
  systemPrompt: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  aiProvider: 'openai',
  
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  
  claudeApiKey: '',
  claudeModel: 'claude-3-5-sonnet-20241022',
  
  airtableApiKey: '',
  airtableBaseId: '',
  airtableTableName: 'Messages',
  airtableMessageField: 'Message',
  airtableDescriptionField: 'Description',
  
  systemPrompt: `You are an insightful assistant that helps extract meaningful messages from daily notes.

Your role is to:
1. Read the daily note content carefully
2. Identify key insights, learnings, or meaningful observations
3. Extract up to 3 insightful messages that capture the value of the day's records
4. Each message should be a one-line statement that could inspire writing
5. Each message should have a brief description explaining the insight

Focus on:
- Personal growth moments
- Interesting ideas or connections
- Emotional insights or realizations
- Actionable wisdom
- Unique perspectives

Respond in JSON format:
{
  "insights": [
    {
      "message": "One-line insightful message",
      "description": "Brief explanation of why this is valuable"
    }
  ]
}

IMPORTANT: Respond ONLY with valid JSON, no additional text.`,
};
