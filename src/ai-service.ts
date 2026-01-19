import { requestUrl, RequestUrlResponsePromise } from 'obsidian';
import { 
  PluginSettings, 
  InsightMessage, 
  OpenAIModel
} from './types';

interface AIResponse {
  insights: InsightMessage[];
}

export class AIService {
  constructor(private settings: PluginSettings) {}

  async generateInsights(content: string): Promise<InsightMessage[]> {
    const provider = this.settings.aiProvider;
    
    switch (provider) {
      case 'openai':
        return this.callOpenAI(content);
      case 'gemini':
        return this.callGemini(content);
      case 'claude':
        return this.callClaude(content);
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  private async callOpenAI(content: string): Promise<InsightMessage[]> {
    const apiKey = this.settings.openaiApiKey;
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured. Please add your API key in settings.');
    }

    const model = this.settings.openaiModel;
    const isReasoningModel = this.isOpenAIReasoningModel(model);
    
    const messages = isReasoningModel
      ? [{ role: 'user', content: `${this.settings.systemPrompt}\n\n---\n\nDaily Note Content:\n${content}` }]
      : [
          { role: 'system', content: this.settings.systemPrompt },
          { role: 'user', content: `Daily Note Content:\n${content}` }
        ];

    try {
      const response = await requestUrl({
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: isReasoningModel ? 1 : 0.7,
        }),
      });

      const data = response.json;
      
      if (data.error) {
        throw new Error(`OpenAI API error: ${data.error.message}`);
      }
      
      const responseContent = data.choices[0].message.content;
      return this.parseAIResponse(responseContent);
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('OpenAI API key is invalid. Please check your API key in settings.');
      }
      throw error;
    }
  }

  private async callGemini(content: string): Promise<InsightMessage[]> {
    const apiKey = this.settings.geminiApiKey;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured. Please add your API key in settings.');
    }

    const model = this.settings.geminiModel;
    
    try {
      const response = await requestUrl({
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${this.settings.systemPrompt}\n\n---\n\nDaily Note Content:\n${content}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
          }
        }),
      });

      const data = response.json;
      
      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }
      
      const responseContent = data.candidates[0].content.parts[0].text;
      return this.parseAIResponse(responseContent);
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Gemini API key is invalid. Please check your API key in settings.');
      }
      throw error;
    }
  }

  private async callClaude(content: string): Promise<InsightMessage[]> {
    const apiKey = this.settings.claudeApiKey;
    if (!apiKey) {
      throw new Error('Claude API key is not configured. Please add your API key in settings.');
    }

    const model = this.settings.claudeModel;
    
    try {
      const response = await requestUrl({
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 2048,
          system: this.settings.systemPrompt,
          messages: [
            { role: 'user', content: `Daily Note Content:\n${content}` }
          ],
        }),
      });

      const data = response.json;
      
      if (data.error) {
        throw new Error(`Claude API error: ${data.error.message}`);
      }
      
      const responseContent = data.content[0].text;
      return this.parseAIResponse(responseContent);
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('Claude API key is invalid. Please check your API key in settings.');
      }
      throw error;
    }
  }

  private isOpenAIReasoningModel(model: OpenAIModel): boolean {
    return model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4');
  }

  private parseAIResponse(responseText: string): InsightMessage[] {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed: AIResponse = JSON.parse(jsonMatch[0]);
      
      if (!parsed.insights || !Array.isArray(parsed.insights)) {
        throw new Error('Invalid response format: missing insights array');
      }
      
      return parsed.insights.slice(0, 3).map(insight => ({
        message: insight.message || '',
        description: insight.description || ''
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
