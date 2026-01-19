import { requestUrl } from 'obsidian';
import { PluginSettings, InsightMessage } from './types';

export class AirtableService {
  constructor(private settings: PluginSettings) {}

  async sendMessage(insight: InsightMessage): Promise<void> {
    const { airtableApiKey, airtableBaseId, airtableTableName, airtableMessageField, airtableDescriptionField } = this.settings;

    if (!airtableApiKey) {
      throw new Error('Airtable API key is not configured');
    }
    if (!airtableBaseId) {
      throw new Error('Airtable Base ID is not configured');
    }
    if (!airtableTableName) {
      throw new Error('Airtable Table name is not configured');
    }

    const url = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`;

    const fields: Record<string, string> = {};
    fields[airtableMessageField || 'Message'] = insight.message;
    fields[airtableDescriptionField || 'Description'] = insight.description;

    const response = await requestUrl({
      url: url,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields }]
      }),
    });

    if (response.status !== 200) {
      throw new Error(`Airtable API error: ${response.status}`);
    }
  }
}
