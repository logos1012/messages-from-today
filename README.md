# Messages from Today

An Obsidian plugin that extracts insightful messages from your daily notes using AI and sends them to Airtable.

## Features

- **AI-Powered Insight Generation**: Analyze your daily notes and extract meaningful messages using OpenAI, Google Gemini, or Anthropic Claude
- **Airtable Integration**: Send selected insights directly to your Airtable base
- **Multiple AI Providers**: Choose from OpenAI (GPT-5.2, GPT-4o, o1, etc.), Google Gemini, or Anthropic Claude
- **Customizable Prompts**: Tailor the AI's behavior with your own system prompt

## Installation

### Using BRAT (Beta Reviewers Auto-update Tester)

1. Install the BRAT plugin from Obsidian Community Plugins
2. Open BRAT settings
3. Click "Add Beta plugin"
4. Enter the repository URL: `https://github.com/jaekwangseo/messages-from-today`

## Usage

### Generate Insights

1. Open a daily note in Obsidian
2. Click the message icon in the ribbon, or use the command palette: "Generate Insightful Messages"
3. AI will analyze your note and append up to 3 insights under "### Messages from Today"

### Send to Airtable

1. Select a message and its description in your note
2. Use the command palette: "Send Message to Airtable"
3. The selected message will be sent to your configured Airtable base

## Configuration

### AI Provider Settings

Configure your preferred AI provider and API key in the plugin settings:

- **OpenAI**: Supports GPT-5.2, GPT-4o, o1, and more
- **Google Gemini**: Supports Gemini 1.5 and 2.0 models
- **Anthropic Claude**: Supports Claude 3.5 Sonnet, Claude 3 Opus, and Claude 3 Haiku

### Airtable Settings

- **API Key**: Your Airtable Personal Access Token
- **Base ID**: The ID of your Airtable base (starts with "app")
- **Table Name**: The name of the table to send messages to
- **Field Names**: Configure the field names for message and description

## Output Format

Insights are formatted as bullet points under the "### Messages from Today" header:

```markdown
### Messages from Today
- Your insightful message here
	- Detailed description of the insight
- Another insight
	- Its description
```

## License

MIT
