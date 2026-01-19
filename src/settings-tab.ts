import { App, PluginSettingTab, Setting } from 'obsidian';
import MessagesFromTodayPlugin from './main';
import { 
  PRICING_PER_MILLION_TOKENS,
  OpenAIModel,
  GeminiModel,
  ClaudeModel
} from './types';

function formatCost(input: number, output: number): string {
  return `$${input}/$${output} per 1M`;
}

function getOpenAIModelLabel(model: OpenAIModel): string {
  const pricing = PRICING_PER_MILLION_TOKENS.openai[model];
  const labels: Record<OpenAIModel, string> = {
    'gpt-5.2': 'GPT-5.2 (Latest)',
    'gpt-5.2-pro': 'GPT-5.2 Pro',
    'gpt-5.1': 'GPT-5.1',
    'gpt-5': 'GPT-5',
    'gpt-5-mini': 'GPT-5 Mini',
    'gpt-5-nano': 'GPT-5 Nano',
    'gpt-5-pro': 'GPT-5 Pro',
    'gpt-4.1': 'GPT-4.1',
    'gpt-4.1-mini': 'GPT-4.1 Mini',
    'gpt-4.1-nano': 'GPT-4.1 Nano',
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'o3': 'o3 (Reasoning)',
    'o3-mini': 'o3 Mini',
    'o3-pro': 'o3 Pro',
    'o4-mini': 'o4 Mini',
    'o1': 'o1',
    'o1-pro': 'o1 Pro',
    'o1-mini': 'o1 Mini (Deprecated)',
  };
  return `${labels[model]} (${formatCost(pricing.input, pricing.output)})`;
}

function getGeminiModelLabel(model: GeminiModel): string {
  const pricing = PRICING_PER_MILLION_TOKENS.gemini[model];
  const labels: Record<GeminiModel, string> = {
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
    'gemini-2.0-flash-lite': 'Gemini 2.0 Flash Lite',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
  };
  return `${labels[model]} (${formatCost(pricing.input, pricing.output)})`;
}

function getClaudeModelLabel(model: ClaudeModel): string {
  const pricing = PRICING_PER_MILLION_TOKENS.claude[model];
  const labels: Record<ClaudeModel, string> = {
    'claude-sonnet-4-20250514': 'Claude Sonnet 4 (Latest)',
    'claude-opus-4-20250514': 'Claude Opus 4',
    'claude-3-7-sonnet-20250219': 'Claude 3.7 Sonnet',
    'claude-3-7-sonnet-latest': 'Claude 3.7 Sonnet (Latest)',
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-haiku-20240307': 'Claude 3 Haiku',
  };
  return `${labels[model]} (${formatCost(pricing.input, pricing.output)})`;
}

export class MessagesFromTodaySettingTab extends PluginSettingTab {
  plugin: MessagesFromTodayPlugin;

  constructor(app: App, plugin: MessagesFromTodayPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Messages from Today Settings' });

    new Setting(containerEl)
      .setName('AI Provider')
      .setDesc('Select the AI provider to use for insight generation')
      .addDropdown(dropdown => dropdown
        .addOption('openai', 'OpenAI')
        .addOption('gemini', 'Google Gemini')
        .addOption('claude', 'Anthropic Claude')
        .setValue(this.plugin.settings.aiProvider)
        .onChange(async (value: 'openai' | 'gemini' | 'claude') => {
          this.plugin.settings.aiProvider = value;
          await this.plugin.saveSettings();
          this.display();
        }));

    if (this.plugin.settings.aiProvider === 'openai') {
      containerEl.createEl('h3', { text: 'OpenAI Settings' });
      
      new Setting(containerEl)
        .setName('OpenAI API Key')
        .setDesc('Your OpenAI API key')
        .addText(text => text
          .setPlaceholder('sk-...')
          .setValue(this.plugin.settings.openaiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.openaiApiKey = value;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('OpenAI Model')
        .setDesc('Model for insight generation. Cost shown as input/output per 1M tokens.')
        .addDropdown(dropdown => {
          const models: OpenAIModel[] = [
            'gpt-5.2', 'gpt-5.2-pro', 'gpt-5.1', 'gpt-5', 'gpt-5-mini', 'gpt-5-nano', 'gpt-5-pro',
            'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
            'gpt-4o', 'gpt-4o-mini',
            'o3', 'o3-mini', 'o3-pro', 'o4-mini',
            'o1', 'o1-pro', 'o1-mini'
          ];
          models.forEach(model => {
            dropdown.addOption(model, getOpenAIModelLabel(model));
          });
          dropdown.setValue(this.plugin.settings.openaiModel)
            .onChange(async (value) => {
              this.plugin.settings.openaiModel = value as OpenAIModel;
              await this.plugin.saveSettings();
            });
        });
    }

    if (this.plugin.settings.aiProvider === 'gemini') {
      containerEl.createEl('h3', { text: 'Google Gemini Settings' });
      
      new Setting(containerEl)
        .setName('Gemini API Key')
        .setDesc('Your Google Gemini API key')
        .addText(text => text
          .setPlaceholder('API key')
          .setValue(this.plugin.settings.geminiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.geminiApiKey = value;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('Gemini Model')
        .setDesc('Model for insight generation. Cost shown as input/output per 1M tokens.')
        .addDropdown(dropdown => {
          const models: GeminiModel[] = [
            'gemini-2.0-flash', 'gemini-2.0-flash-lite',
            'gemini-1.5-flash', 'gemini-1.5-pro'
          ];
          models.forEach(model => {
            dropdown.addOption(model, getGeminiModelLabel(model));
          });
          dropdown.setValue(this.plugin.settings.geminiModel)
            .onChange(async (value) => {
              this.plugin.settings.geminiModel = value as GeminiModel;
              await this.plugin.saveSettings();
            });
        });
    }

    if (this.plugin.settings.aiProvider === 'claude') {
      containerEl.createEl('h3', { text: 'Anthropic Claude Settings' });
      
      new Setting(containerEl)
        .setName('Claude API Key')
        .setDesc('Your Anthropic Claude API key')
        .addText(text => text
          .setPlaceholder('sk-ant-...')
          .setValue(this.plugin.settings.claudeApiKey)
          .onChange(async (value) => {
            this.plugin.settings.claudeApiKey = value;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('Claude Model')
        .setDesc('Model for insight generation. Cost shown as input/output per 1M tokens.')
        .addDropdown(dropdown => {
          const models: ClaudeModel[] = [
            'claude-sonnet-4-20250514', 'claude-opus-4-20250514',
            'claude-3-7-sonnet-20250219', 'claude-3-7-sonnet-latest',
            'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022',
            'claude-3-opus-20240229', 'claude-3-haiku-20240307'
          ];
          models.forEach(model => {
            dropdown.addOption(model, getClaudeModelLabel(model));
          });
          dropdown.setValue(this.plugin.settings.claudeModel)
            .onChange(async (value) => {
              this.plugin.settings.claudeModel = value as ClaudeModel;
              await this.plugin.saveSettings();
            });
        });
    }

    containerEl.createEl('h3', { text: 'Airtable Settings' });

    new Setting(containerEl)
      .setName('Airtable API Key')
      .setDesc('Your Airtable Personal Access Token')
      .addText(text => text
        .setPlaceholder('pat...')
        .setValue(this.plugin.settings.airtableApiKey)
        .onChange(async (value) => {
          this.plugin.settings.airtableApiKey = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Airtable Base ID')
      .setDesc('The ID of your Airtable base (starts with "app")')
      .addText(text => text
        .setPlaceholder('appXXXXXXXXXXXXXX')
        .setValue(this.plugin.settings.airtableBaseId)
        .onChange(async (value) => {
          this.plugin.settings.airtableBaseId = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Airtable Table Name')
      .setDesc('The name of the table to send messages to')
      .addText(text => text
        .setPlaceholder('Messages')
        .setValue(this.plugin.settings.airtableTableName)
        .onChange(async (value) => {
          this.plugin.settings.airtableTableName = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Message Field Name')
      .setDesc('The field name for the message in Airtable')
      .addText(text => text
        .setPlaceholder('Message')
        .setValue(this.plugin.settings.airtableMessageField)
        .onChange(async (value) => {
          this.plugin.settings.airtableMessageField = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Description Field Name (Optional)')
      .setDesc('The field name for the description in Airtable. Leave empty to skip sending description.')
      .addText(text => text
        .setPlaceholder('(optional)')
        .setValue(this.plugin.settings.airtableDescriptionField)
        .onChange(async (value) => {
          this.plugin.settings.airtableDescriptionField = value;
          await this.plugin.saveSettings();
        }));

    containerEl.createEl('h3', { text: 'Prompt Settings' });

    new Setting(containerEl)
      .setName('System Prompt')
      .setDesc('The prompt used to generate insights from daily notes.')
      .addTextArea(text => {
        text
          .setPlaceholder('Enter your system prompt...')
          .setValue(this.plugin.settings.systemPrompt)
          .onChange(async (value) => {
            this.plugin.settings.systemPrompt = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.rows = 10;
        text.inputEl.cols = 50;
      });
  }
}
