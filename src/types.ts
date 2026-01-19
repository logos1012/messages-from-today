export type AIProvider = 'openai' | 'gemini' | 'claude';

export type OpenAIModel = 
  | 'gpt-5.2' | 'gpt-5.2-pro' | 'gpt-5.1' | 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'gpt-5-pro'
  | 'gpt-4.1' | 'gpt-4.1-mini' | 'gpt-4.1-nano'
  | 'gpt-4o' | 'gpt-4o-mini'
  | 'o3' | 'o3-mini' | 'o3-pro' | 'o4-mini'
  | 'o1' | 'o1-pro' | 'o1-mini';

export type GeminiModel = 
  | 'gemini-2.0-flash' | 'gemini-2.0-flash-lite' 
  | 'gemini-1.5-flash' | 'gemini-1.5-pro';

export type ClaudeModel = 
  | 'claude-sonnet-4-20250514' | 'claude-opus-4-20250514'
  | 'claude-3-7-sonnet-20250219' | 'claude-3-7-sonnet-latest'
  | 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229' | 'claude-3-haiku-20240307';

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
    'gpt-5.2': { input: 2, output: 8 },
    'gpt-5.2-pro': { input: 10, output: 40 },
    'gpt-5.1': { input: 1.5, output: 6 },
    'gpt-5': { input: 2, output: 8 },
    'gpt-5-mini': { input: 0.3, output: 1.2 },
    'gpt-5-nano': { input: 0.1, output: 0.4 },
    'gpt-5-pro': { input: 10, output: 40 },
    'gpt-4.1': { input: 2, output: 8 },
    'gpt-4.1-mini': { input: 0.4, output: 1.6 },
    'gpt-4.1-nano': { input: 0.1, output: 0.4 },
    'gpt-4o': { input: 2.5, output: 10 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'o3': { input: 10, output: 40 },
    'o3-mini': { input: 1.1, output: 4.4 },
    'o3-pro': { input: 20, output: 80 },
    'o4-mini': { input: 1.1, output: 4.4 },
    'o1': { input: 15, output: 60 },
    'o1-pro': { input: 150, output: 600 },
    'o1-mini': { input: 1.1, output: 4.4 },
  },
  gemini: {
    'gemini-2.0-flash': { input: 0.1, output: 0.4 },
    'gemini-2.0-flash-lite': { input: 0.075, output: 0.3 },
    'gemini-1.5-flash': { input: 0.075, output: 0.3 },
    'gemini-1.5-pro': { input: 1.25, output: 5 },
  },
  claude: {
    'claude-sonnet-4-20250514': { input: 3, output: 15 },
    'claude-opus-4-20250514': { input: 15, output: 75 },
    'claude-3-7-sonnet-20250219': { input: 3, output: 15 },
    'claude-3-7-sonnet-latest': { input: 3, output: 15 },
    'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
    'claude-3-5-haiku-20241022': { input: 0.8, output: 4 },
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
  
  systemPrompt: `당신은 데일리 노트에서 의미 있는 메시지를 추출하는 인사이트 전문가입니다.

역할:
1. 데일리 노트 내용을 주의 깊게 읽기
2. 핵심 인사이트, 배움, 의미 있는 관찰 식별하기
3. 하루 기록의 가치를 담은 최대 3개의 인사이트 메시지 추출하기
4. 각 메시지는 글쓰기 영감을 줄 수 있는 한 줄 문장이어야 함
5. 각 메시지에는 인사이트를 설명하는 간단한 설명 포함

집중할 영역:
- 개인적 성장의 순간
- 흥미로운 아이디어나 연결고리
- 감정적 통찰이나 깨달음
- 실천 가능한 지혜
- 독특한 관점

JSON 형식으로 응답:
{
  "insights": [
    {
      "message": "한 줄 인사이트 메시지",
      "description": "이 인사이트가 가치 있는 이유에 대한 간단한 설명"
    }
  ]
}

중요: 반드시 한글로 응답하고, 유효한 JSON만 반환하세요. 다른 텍스트는 포함하지 마세요.`,
};
