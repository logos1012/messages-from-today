import { App, MarkdownView, Notice, Plugin, TFile } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS, InsightMessage } from './types';
import { AIService } from './ai-service';
import { AirtableService } from './airtable-service';
import { MessagesFromTodaySettingTab } from './settings-tab';

const MESSAGES_HEADER = '### Messages from Today';

export default class MessagesFromTodayPlugin extends Plugin {
  settings: PluginSettings;
  private aiService: AIService;
  private airtableService: AirtableService;

  async onload() {
    await this.loadSettings();

    this.aiService = new AIService(this.settings);
    this.airtableService = new AirtableService(this.settings);

    this.addRibbonIcon('message-square', 'Generate Insightful Messages', async () => {
      await this.generateInsights();
    });

    this.addCommand({
      id: 'generate-insightful-messages',
      name: 'Generate Insightful Messages',
      callback: async () => {
        await this.generateInsights();
      }
    });

    this.addCommand({
      id: 'send-message-to-airtable',
      name: 'Send Message to Airtable',
      callback: async () => {
        await this.sendMessagesToAirtable();
      }
    });

    this.addSettingTab(new MessagesFromTodaySettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.aiService = new AIService(this.settings);
    this.airtableService = new AirtableService(this.settings);
  }

  private async generateInsights(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('No active file open');
      return;
    }

    const content = await this.app.vault.read(activeFile);
    if (!content.trim()) {
      new Notice('The current note is empty');
      return;
    }

    new Notice('Generating insights...');

    try {
      const insights = await this.aiService.generateInsights(content);
      
      if (insights.length === 0) {
        new Notice('No insights generated');
        return;
      }

      const formattedInsights = this.formatInsights(insights);
      await this.appendInsightsToNote(activeFile, content, formattedInsights);
      
      new Notice(`Generated ${insights.length} insight(s)`);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      new Notice(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatInsights(insights: InsightMessage[]): string {
    const lines: string[] = [];
    
    for (const insight of insights) {
      lines.push(`- ${insight.message}`);
      lines.push(`\t- ${insight.description}`);
    }
    
    return lines.join('\n');
  }

  private async appendInsightsToNote(file: TFile, content: string, formattedInsights: string): Promise<void> {
    const headerIndex = content.indexOf(MESSAGES_HEADER);
    
    let newContent: string;
    
    if (headerIndex !== -1) {
      const beforeHeader = content.substring(0, headerIndex + MESSAGES_HEADER.length);
      const afterHeader = content.substring(headerIndex + MESSAGES_HEADER.length);
      
      const nextSectionMatch = afterHeader.match(/\n(#{1,3}\s)/);
      
      if (nextSectionMatch) {
        const insertPoint = nextSectionMatch.index!;
        const existingContent = afterHeader.substring(0, insertPoint);
        const remainingContent = afterHeader.substring(insertPoint);
        newContent = beforeHeader + existingContent.trimEnd() + '\n' + formattedInsights + '\n' + remainingContent;
      } else {
        newContent = beforeHeader + '\n' + formattedInsights + '\n' + afterHeader.trimEnd();
      }
    } else {
      newContent = content.trimEnd() + '\n\n' + MESSAGES_HEADER + '\n' + formattedInsights;
    }
    
    await this.app.vault.modify(file, newContent);
  }

  private async sendMessagesToAirtable(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile) {
      new Notice('No active file open');
      return;
    }

    const content = await this.app.vault.read(activeFile);
    const insights = this.parseMessagesFromNote(content);
    
    if (insights.length === 0) {
      new Notice('No messages found in "### Messages from Today" section');
      return;
    }

    new Notice(`Sending ${insights.length} message(s) to Airtable...`);

    let successCount = 0;
    let failCount = 0;

    for (const insight of insights) {
      try {
        await this.airtableService.sendMessage(insight);
        successCount++;
      } catch (error) {
        console.error('Failed to send message to Airtable:', error);
        failCount++;
      }
    }

    if (failCount === 0) {
      new Notice(`Successfully sent ${successCount} message(s) to Airtable!`);
    } else {
      new Notice(`Sent ${successCount} message(s), ${failCount} failed`);
    }
  }

  private parseMessagesFromNote(content: string): InsightMessage[] {
    const insights: InsightMessage[] = [];
    
    const headerIndex = content.indexOf(MESSAGES_HEADER);
    if (headerIndex === -1) {
      return insights;
    }

    const afterHeader = content.substring(headerIndex + MESSAGES_HEADER.length);
    
    const nextSectionMatch = afterHeader.match(/\n#{1,3}\s/);
    const sectionContent = nextSectionMatch 
      ? afterHeader.substring(0, nextSectionMatch.index)
      : afterHeader;

    const lines = sectionContent.split('\n');
    
    let currentMessage: string | null = null;
    let currentDescription: string | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- ') && !line.startsWith('\t') && !line.startsWith('  ')) {
        if (currentMessage) {
          insights.push({
            message: currentMessage,
            description: currentDescription || ''
          });
        }
        currentMessage = trimmedLine.substring(2).trim();
        currentDescription = null;
      } else if ((line.startsWith('\t-') || line.startsWith('\t\t-') || line.startsWith('  -') || line.startsWith('    -')) && currentMessage) {
        const descMatch = trimmedLine.match(/^-\s*(.+)$/);
        if (descMatch) {
          currentDescription = descMatch[1].trim();
        }
      }
    }

    if (currentMessage) {
      insights.push({
        message: currentMessage,
        description: currentDescription || ''
      });
    }

    return insights;
  }
}
