import { App, Editor, MarkdownView, Notice, Plugin } from 'obsidian';
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
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        await this.sendSelectedMessageToAirtable(editor, view);
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

  private async appendInsightsToNote(file: any, content: string, formattedInsights: string): Promise<void> {
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

  private async sendSelectedMessageToAirtable(editor: Editor, view: MarkdownView): Promise<void> {
    const selection = editor.getSelection();
    
    if (!selection.trim()) {
      new Notice('Please select a message and its description');
      return;
    }

    const insight = this.parseSelectedMessage(selection);
    
    if (!insight) {
      new Notice('Could not parse the selected message. Please select a message line and its description.');
      return;
    }

    new Notice('Sending to Airtable...');

    try {
      await this.airtableService.sendMessage(insight);
      new Notice('Message sent to Airtable successfully!');
    } catch (error) {
      console.error('Failed to send to Airtable:', error);
      new Notice(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseSelectedMessage(selection: string): InsightMessage | null {
    const lines = selection.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 1) {
      return null;
    }

    let message = '';
    let description = '';

    for (const line of lines) {
      if (line.startsWith('- ') && !line.startsWith('-\t') && !message) {
        message = line.substring(2).trim();
      } else if ((line.startsWith('\t- ') || line.startsWith('  - ') || line.startsWith('    - ')) && message) {
        const descMatch = line.match(/^[\t\s]*-\s*(.+)$/);
        if (descMatch) {
          description = descMatch[1].trim();
          break;
        }
      } else if (line.startsWith('- ') && message) {
        const descMatch = line.match(/^-\s*(.+)$/);
        if (descMatch && !description) {
          description = descMatch[1].trim();
        }
      }
    }

    if (!message) {
      const firstLine = lines[0];
      if (firstLine.startsWith('- ')) {
        message = firstLine.substring(2).trim();
      } else {
        message = firstLine;
      }
      
      if (lines.length > 1) {
        const secondLine = lines[1];
        const descMatch = secondLine.match(/^[\t\s]*-?\s*(.+)$/);
        if (descMatch) {
          description = descMatch[1].trim();
        }
      }
    }

    if (!message) {
      return null;
    }

    return { message, description };
  }
}
