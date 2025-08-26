# Tailwind LLM Provider

[![npm version](https://badge.fury.io/js/tailwind-llm-provider.svg)](https://www.npmjs.com/package/tailwind-llm-provider)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, customizable modal component that lets users configure their OpenAI-compatible API provider (OpenRouter, Gemini, Ollama, Aipipe, etc.) with a beautiful Tailwind CSS interface.

## Features

- 🎨 **Beautiful UI** - Clean, responsive modal built with Tailwind CSS
- 🔧 **Highly Configurable** - Customize labels, help text, and available providers
- 💾 **Persistent Storage** - Automatically saves configuration to localStorage
- ✅ **API Validation** - Tests API endpoints and fetches available models
- 🌐 **Multiple Providers** - Support for any OpenAI-compatible API
- 📱 **Mobile Friendly** - Responsive design that works on all devices
- ⚡ **Zero Dependencies** - Pure JavaScript with no external dependencies

## Installation

```bash
npm install tailwind-llm-provider
```

Or via CDN:

```html
<script src="https://unpkg.com/tailwind-llm-provider@latest/dist/index.global.min.js"></script>
```

## Quick Start

### ES Modules

```javascript
import { openaiConfig } from 'tailwind-llm-provider';

// Show configuration modal
const config = await openaiConfig({ show: true });
console.log(config);
// { baseUrl: "https://api.openai.com/v1", apiKey: "sk-...", models: [...] }
```

### Global Script

```html
<script src="https://unpkg.com/tailwind-llm-provider@latest/dist/index.global.min.js"></script>
<script>
  // Show configuration modal
  LLMProvider.openaiConfig({ show: true }).then(config => {
    console.log(config);
  });
</script>
```

## Usage Examples

### Basic Usage

```javascript
import { openaiConfig } from 'tailwind-llm-provider';

// Get stored config or show modal if none exists
const config = await openaiConfig();

// Use the configuration with your preferred HTTP client
const response = await fetch(`${config.baseURL}/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: config.models[0], // Use first available model
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

### Custom Provider List

```javascript
const config = await openaiConfig({
  show: true,
  title: "Choose Your AI Provider",
  baseUrls: [
    { name: "OpenAI", url: "https://api.openai.com/v1" },
    { name: "OpenRouter", url: "https://openrouter.ai/api/v1" },
    { name: "Local Ollama", url: "http://localhost:11434/v1" },
    { name: "Aipipe", url: "https://api.aipipe.ai/v1" }
  ]
});
```

### Custom Labels and Help Text

```javascript
const config = await openaiConfig({
  show: true,
  title: "AI Configuration",
  baseUrlLabel: "Provider URL",
  apiKeyLabel: "Your API Key",
  buttonLabel: "Connect",
  help: "Choose your preferred AI provider and enter your API key. Your credentials are stored locally and never shared."
});
```

### Force Show Modal

```javascript
// Always show the modal, even if config exists
const config = await openaiConfig({ show: true });
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `show` | `boolean` | `false` | Force show modal even if config exists |
| `storage` | `Storage` | `localStorage` | Storage mechanism for persistence |
| `key` | `string` | `"bootstrapLLMProvider_openaiConfig"` | Storage key |
| `title` | `string` | `"OpenAI API Configuration"` | Modal title |
| `baseUrlLabel` | `string` | `"API Base URL"` | Label for URL input |
| `apiKeyLabel` | `string` | `"API Key"` | Label for API key input |
| `buttonLabel` | `string` | `"Save & Test"` | Submit button text |
| `help` | `string` | `""` | Help text shown above inputs |
| `defaultBaseUrls` | `string[]` | `["https://api.openai.com/v1"]` | Default URLs for datalist |
| `baseUrls` | `Array<{name: string, url: string}>` | `undefined` | Custom provider dropdown |

## Return Value

The `openaiConfig` function returns a Promise that resolves to:

```javascript
{
  baseUrl: string,     // The configured base URL
  baseURL: string,     // Alias for baseUrl (OpenAI SDK compatibility)
  apiKey: string,      // The API key
  models: string[]     // Array of available model names
}
```

## Supported Providers

This library works with any OpenAI-compatible API, including:

- **OpenAI** - `https://api.openai.com/v1`
- **OpenRouter** - `https://openrouter.ai/api/v1`
- **Ollama** - `http://localhost:11434/v1`
- **Aipipe** - `https://api.aipipe.ai/v1`
- **Together AI** - `https://api.together.xyz/v1`
- **Groq** - `https://api.groq.com/openai/v1`
- **Anthropic** (via proxy)
- **Google Gemini** (via proxy)
- Any other OpenAI-compatible endpoint

## Styling

The modal uses Tailwind CSS classes and requires Tailwind to be loaded in your project. If you're not using Tailwind, you can include it via CDN:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

## Error Handling

```javascript
try {
  const config = await openaiConfig({ show: true });
  // Use config...
} catch (error) {
  if (error.message === 'cancelled') {
    console.log('User cancelled the configuration');
  } else {
    console.error('Configuration error:', error.message);
  }
}
```

## TypeScript Support

Type definitions are included in the package:

```typescript
interface Config {
  baseUrl: string;
  baseURL: string;
  apiKey: string;
  models: string[];
}

interface Options {
  show?: boolean;
  storage?: Storage;
  key?: string;
  title?: string;
  baseUrlLabel?: string;
  apiKeyLabel?: string;
  buttonLabel?: string;
  help?: string;
  defaultBaseUrls?: string[];
  baseUrls?: Array<{ name: string; url: string }>;
}

declare function openaiConfig(options?: Options): Promise<Config>;
```

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Any browser with ES2020 support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Aayansh Yadav](https://github.com/aayanshyadav)

## Links

- [npm package](https://www.npmjs.com/package/tailwind-llm-provider)
- [GitHub repository](https://github.com/aayanshyadav/tailwind-llm-provider)
