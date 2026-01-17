// Tab definitions
export type TabId =
  | 'formatter'
  | 'converter'
  | 'encode-decode'
  | 'escape-unescape'
  | 'generator'
  | 'text'
  | 'time'
  | 'mock-server';

export interface Tab {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}

// Tool definitions
export interface Tool {
  id: string;
  name: string;
  description: string;
  tabId: TabId;
  icon?: string;
}

// Status bar state
export interface StatusInfo {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  details?: string;
}

// Tool state that can be passed to status bar
export interface ToolState {
  selectedTab: TabId;
  selectedTool: Tool | null;
  status: StatusInfo;
  isProcessing: boolean;
  lastAction?: string;
  stats?: Record<string, string | number>;
}

// Check if MockServer feature is enabled via environment variable
const isMockServerEnabled = import.meta.env.VITE_ENABLE_MOCK_SERVER === 'true';

// Tab configuration
const ALL_TABS: Tab[] = [
  {
    id: 'formatter',
    label: 'Formatter',
    icon: 'code',
    description: 'Format and beautify code in various languages',
  },
  {
    id: 'converter',
    label: 'Converter',
    icon: 'repeat',
    description: 'Convert between different data formats',
  },
  {
    id: 'encode-decode',
    label: 'Encode / Decode',
    icon: 'lock',
    description: 'Encode and decode data in various formats',
  },
  {
    id: 'escape-unescape',
    label: 'Escape / Unescape',
    icon: 'shield',
    description: 'Escape and unescape special characters',
  },
  {
    id: 'generator',
    label: 'Generator',
    icon: 'sparkles',
    description: 'Generate random data, UUIDs, passwords, and more',
  },
  {
    id: 'text',
    label: 'Text',
    icon: 'type',
    description: 'Text manipulation and analysis tools',
  },
  {
    id: 'time',
    label: 'Time',
    icon: 'clock',
    description: 'Date and time conversion utilities',
  },
  {
    id: 'mock-server',
    label: 'Mock Server',
    icon: 'server',
    description: 'Create and manage mock API endpoints',
  },
];

// Export filtered TABS based on feature flags
export const TABS: Tab[] = isMockServerEnabled
  ? ALL_TABS
  : ALL_TABS.filter((tab) => tab.id !== 'mock-server');

// Tools organized by tab
export const TOOLS: Record<TabId, Tool[]> = {
  formatter: [
    { id: 'json-formatter', name: 'JSON Formatter', description: 'Format and beautify JSON', tabId: 'formatter' },
    { id: 'xml-formatter', name: 'XML Formatter', description: 'Format and beautify XML', tabId: 'formatter' },
    { id: 'html-formatter', name: 'HTML Formatter', description: 'Format and beautify HTML', tabId: 'formatter' },
    { id: 'css-formatter', name: 'CSS Formatter', description: 'Format and beautify CSS', tabId: 'formatter' },
    { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format and beautify SQL queries', tabId: 'formatter' },
  ],
  converter: [
    { id: 'json-yaml', name: 'JSON ↔ YAML', description: 'Convert between JSON and YAML', tabId: 'converter' },
    { id: 'json-xml', name: 'JSON ↔ XML', description: 'Convert between JSON and XML', tabId: 'converter' },
    { id: 'csv-json', name: 'CSV ↔ JSON', description: 'Convert between CSV and JSON', tabId: 'converter' },
    { id: 'number-base', name: 'Number Base', description: 'Convert between number bases', tabId: 'converter' },
    { id: 'color-converter', name: 'Color Converter', description: 'Convert between color formats', tabId: 'converter' },
  ],
  'encode-decode': [
    { id: 'base64', name: 'Base64', description: 'Encode/decode Base64', tabId: 'encode-decode' },
    { id: 'url-encode', name: 'URL Encode', description: 'Encode/decode URLs', tabId: 'encode-decode' },
    { id: 'jwt-decode', name: 'JWT Decode', description: 'Decode JWT tokens', tabId: 'encode-decode' },
    { id: 'html-entities', name: 'HTML Entities', description: 'Encode/decode HTML entities', tabId: 'encode-decode' },
    { id: 'unicode', name: 'Unicode', description: 'Encode/decode Unicode', tabId: 'encode-decode' },
  ],
  'escape-unescape': [
    { id: 'json-escape', name: 'JSON Escape', description: 'Escape/unescape JSON strings', tabId: 'escape-unescape' },
    { id: 'html-escape', name: 'HTML Escape', description: 'Escape/unescape HTML', tabId: 'escape-unescape' },
    { id: 'xml-escape', name: 'XML Escape', description: 'Escape/unescape XML', tabId: 'escape-unescape' },
    { id: 'regex-escape', name: 'Regex Escape', description: 'Escape regex special characters', tabId: 'escape-unescape' },
    { id: 'sql-escape', name: 'SQL Escape', description: 'Escape SQL strings', tabId: 'escape-unescape' },
  ],
  generator: [
    { id: 'uuid', name: 'UUID Generator', description: 'Generate UUIDs v1, v4, v7', tabId: 'generator' },
    { id: 'password', name: 'Password Generator', description: 'Generate secure passwords', tabId: 'generator' },
    { id: 'hash', name: 'Hash Generator', description: 'Generate MD5, SHA hashes', tabId: 'generator' },
    { id: 'lorem-ipsum', name: 'Lorem Ipsum', description: 'Generate placeholder text', tabId: 'generator' },
    { id: 'qr-code', name: 'QR Code', description: 'Generate QR codes', tabId: 'generator' },
  ],
  text: [
    { id: 'case-converter', name: 'Case Converter', description: 'Convert text case', tabId: 'text' },
    { id: 'diff-checker', name: 'Diff Checker', description: 'Compare two texts', tabId: 'text' },
    { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, lines', tabId: 'text' },
    { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions', tabId: 'text' },
    { id: 'markdown-preview', name: 'Markdown Preview', description: 'Preview markdown', tabId: 'text' },
  ],
  time: [
    { id: 'timestamp-converter', name: 'Timestamp Converter', description: 'Convert timestamps', tabId: 'time' },
    { id: 'timezone-converter', name: 'Timezone Converter', description: 'Convert between timezones', tabId: 'time' },
    { id: 'date-calculator', name: 'Date Calculator', description: 'Calculate date differences', tabId: 'time' },
    { id: 'cron-parser', name: 'Cron Parser', description: 'Parse and explain cron expressions', tabId: 'time' },
    { id: 'world-clock', name: 'World Clock', description: 'View time in different zones', tabId: 'time' },
  ],
  'mock-server': [
    { id: 'endpoint-manager', name: 'Endpoint Manager', description: 'Manage mock endpoints', tabId: 'mock-server' },
    { id: 'response-builder', name: 'Response Builder', description: 'Build mock responses', tabId: 'mock-server' },
    { id: 'request-log', name: 'Request Log', description: 'View incoming requests', tabId: 'mock-server' },
    { id: 'schema-validator', name: 'Schema Validator', description: 'Validate JSON schemas', tabId: 'mock-server' },
    { id: 'delay-simulator', name: 'Delay Simulator', description: 'Simulate network delays', tabId: 'mock-server' },
  ],
};

