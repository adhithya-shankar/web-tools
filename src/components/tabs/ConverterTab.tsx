import { useState, useEffect } from 'react';
import { useToolContext, useToolStatus } from '../../context/ToolContext';

export function ConverterTab() {
  const { selectedTool } = useToolContext();

  if (!selectedTool) {
    return <TabPlaceholder />;
  }

  switch (selectedTool.id) {
    case 'json-yaml':
      return <JsonYamlConverter />;
    case 'json-xml':
      return <JsonXmlConverter />;
    case 'csv-json':
      return <CsvJsonConverter />;
    case 'number-base':
      return <NumberBaseConverter />;
    case 'color-converter':
      return <ColorConverter />;
    default:
      return <TabPlaceholder />;
  }
}

function TabPlaceholder() {
  const { getTabInfo, getToolsForCurrentTab } = useToolContext();
  const tabInfo = getTabInfo();
  const tools = getToolsForCurrentTab();

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 text-primary-400">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-200">{tabInfo.label}</h2>
      <p className="mt-2 max-w-md text-slate-400">{tabInfo.description}</p>
      <p className="mt-4 text-sm text-slate-500">
        Select a tool from the sidebar • {tools.length} tools available
      </p>
    </div>
  );
}

function JsonYamlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json-to-yaml' | 'yaml-to-json'>('json-to-yaml');
  const { success, error, setStats } = useToolStatus();

  useEffect(() => {
    setStats({ Mode: mode === 'json-to-yaml' ? 'JSON → YAML' : 'YAML → JSON' });
  }, [mode, setStats]);

  const convert = () => {
    if (mode === 'json-to-yaml') {
      try {
        const parsed = JSON.parse(input);
        const yaml = jsonToYaml(parsed);
        setOutput(yaml);
        success('Converted to YAML');
        setStats({ Lines: yaml.split('\n').length });
      } catch (e) {
        error('Invalid JSON', (e as Error).message);
      }
    } else {
      try {
        const json = yamlToJson(input);
        setOutput(JSON.stringify(json, null, 2));
        success('Converted to JSON');
      } catch (e) {
        error('Invalid YAML', (e as Error).message);
      }
    }
  };

  return (
    <ToolLayout
      title="JSON ↔ YAML Converter"
      description="Convert between JSON and YAML formats"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder={mode === 'json-to-yaml' ? '{"name": "value"}' : 'name: value'}
      actions={
        <>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'json-to-yaml' | 'yaml-to-json')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
          >
            <option value="json-to-yaml">JSON → YAML</option>
            <option value="yaml-to-json">YAML → JSON</option>
          </select>
          <button onClick={convert} className="btn-primary">
            Convert
          </button>
        </>
      }
    />
  );
}

function JsonXmlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json-to-xml' | 'xml-to-json'>('json-to-xml');
  const { success, error, setStats } = useToolStatus();

  const convert = () => {
    if (mode === 'json-to-xml') {
      try {
        const parsed = JSON.parse(input);
        const xml = jsonToXml(parsed, 'root');
        setOutput(xml);
        success('Converted to XML');
        setStats({ Lines: xml.split('\n').length });
      } catch (e) {
        error('Invalid JSON', (e as Error).message);
      }
    } else {
      success('XML to JSON conversion', 'Coming soon');
    }
  };

  return (
    <ToolLayout
      title="JSON ↔ XML Converter"
      description="Convert between JSON and XML formats"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder='{"name": "value"}'
      actions={
        <>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'json-to-xml' | 'xml-to-json')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
          >
            <option value="json-to-xml">JSON → XML</option>
            <option value="xml-to-json">XML → JSON</option>
          </select>
          <button onClick={convert} className="btn-primary">
            Convert
          </button>
        </>
      }
    />
  );
}

function CsvJsonConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'csv-to-json' | 'json-to-csv'>('csv-to-json');
  const { success, error, setStats } = useToolStatus();

  const convert = () => {
    if (mode === 'csv-to-json') {
      try {
        const lines = input.trim().split('\n');
        const firstLine = lines[0] ?? '';
        const headers = firstLine.split(',').map((h) => h.trim());
        const data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          return headers.reduce(
            (obj, header, i) => {
              obj[header] = values[i] || '';
              return obj;
            },
            {} as Record<string, string>
          );
        });
        const json = JSON.stringify(data, null, 2);
        setOutput(json);
        success('Converted to JSON', `${data.length} rows`);
        setStats({ Rows: data.length, Columns: headers.length });
      } catch (e) {
        error('Invalid CSV', (e as Error).message);
      }
    } else {
      try {
        const data = JSON.parse(input);
        if (!Array.isArray(data) || data.length === 0) {
          error('Invalid JSON', 'Expected array of objects');
          return;
        }
        const headers = Object.keys(data[0]);
        const csv = [
          headers.join(','),
          ...data.map((row: Record<string, unknown>) => headers.map((h) => row[h]).join(',')),
        ].join('\n');
        setOutput(csv);
        success('Converted to CSV', `${data.length} rows`);
        setStats({ Rows: data.length, Columns: headers.length });
      } catch (e) {
        error('Invalid JSON', (e as Error).message);
      }
    }
  };

  return (
    <ToolLayout
      title="CSV ↔ JSON Converter"
      description="Convert between CSV and JSON formats"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder={mode === 'csv-to-json' ? 'name,age\nJohn,30\nJane,25' : '[{"name": "John", "age": 30}]'}
      actions={
        <>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'csv-to-json' | 'json-to-csv')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
          >
            <option value="csv-to-json">CSV → JSON</option>
            <option value="json-to-csv">JSON → CSV</option>
          </select>
          <button onClick={convert} className="btn-primary">
            Convert
          </button>
        </>
      }
    />
  );
}

function NumberBaseConverter() {
  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState(10);
  const [results, setResults] = useState<Record<string, string>>({});
  const { success, error, setStats } = useToolStatus();

  const convert = () => {
    try {
      const decimal = parseInt(input, fromBase);
      if (isNaN(decimal)) {
        error('Invalid number for base ' + fromBase);
        return;
      }
      const newResults = {
        Binary: decimal.toString(2),
        Octal: decimal.toString(8),
        Decimal: decimal.toString(10),
        Hexadecimal: decimal.toString(16).toUpperCase(),
      };
      setResults(newResults);
      success('Number converted');
      setStats({ Decimal: decimal });
    } catch (e) {
      error('Conversion error', (e as Error).message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Number Base Converter</h2>
        <p className="mt-1 text-sm text-slate-400">Convert numbers between different bases</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter number"
          className="input max-w-xs"
        />
        <select
          value={fromBase}
          onChange={(e) => setFromBase(Number(e.target.value))}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
        >
          <option value={2}>Binary (2)</option>
          <option value={8}>Octal (8)</option>
          <option value={10}>Decimal (10)</option>
          <option value={16}>Hexadecimal (16)</option>
        </select>
        <button onClick={convert} className="btn-primary">
          Convert
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.entries(results).map(([base, value]) => (
            <div key={base} className="card">
              <div className="text-sm text-slate-400">{base}</div>
              <div className="mt-1 font-mono text-lg text-slate-200">{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorConverter() {
  const [hex, setHex] = useState('#22c55e');
  const [rgb, setRgb] = useState({ r: 34, g: 197, b: 94 });
  const [hsl, setHsl] = useState({ h: 142, s: 71, l: 45 });
  const { success, setStats } = useToolStatus();

  const updateFromHex = (value: string) => {
    setHex(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const r = parseInt(value.slice(1, 3), 16);
      const g = parseInt(value.slice(3, 5), 16);
      const b = parseInt(value.slice(5, 7), 16);
      setRgb({ r, g, b });
      const hslValue = rgbToHsl(r, g, b);
      setHsl(hslValue);
      success('Color updated');
      setStats({ HEX: value, RGB: `${r}, ${g}, ${b}` });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Color Converter</h2>
        <p className="mt-1 text-sm text-slate-400">Convert colors between HEX, RGB, and HSL</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Color preview */}
        <div className="card">
          <div
            className="mb-4 h-32 w-full rounded-xl"
            style={{ backgroundColor: hex }}
          />
          <input
            type="color"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg"
          />
        </div>

        {/* Values */}
        <div className="space-y-4">
          <div className="card">
            <label className="text-sm text-slate-400">HEX</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="input mt-2 font-mono"
            />
          </div>
          <div className="card">
            <label className="text-sm text-slate-400">RGB</label>
            <div className="mt-2 font-mono text-slate-200">
              rgb({rgb.r}, {rgb.g}, {rgb.b})
            </div>
          </div>
          <div className="card">
            <label className="text-sm text-slate-400">HSL</label>
            <div className="mt-2 font-mono text-slate-200">
              hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function jsonToYaml(obj: unknown, indent = 0): string {
  const spaces = '  '.repeat(indent);
  if (obj === null) return 'null';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (Array.isArray(obj)) {
    return obj.map((item) => `${spaces}- ${jsonToYaml(item, indent + 1).trim()}`).join('\n');
  }
  if (typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>)
      .map(([key, value]) => {
        const val = jsonToYaml(value, indent + 1);
        if (typeof value === 'object' && value !== null) {
          return `${spaces}${key}:\n${val}`;
        }
        return `${spaces}${key}: ${val}`;
      })
      .join('\n');
  }
  return String(obj);
}

function yamlToJson(yaml: string): unknown {
  const lines = yaml.split('\n').filter((l) => l.trim());
  const result: Record<string, unknown> = {};
  for (const line of lines) {
    const match = line.match(/^(\s*)(\w+):\s*(.*)$/);
    if (match) {
      const key = match[2];
      const value = match[3];
      if (key) {
        result[key] = value || null;
      }
    }
  }
  return result;
}

function jsonToXml(obj: unknown, rootName: string): string {
  const convert = (data: unknown, tag: string): string => {
    if (data === null || data === undefined) return `<${tag}/>`;
    if (typeof data !== 'object') return `<${tag}>${data}</${tag}>`;
    if (Array.isArray(data)) {
      return data.map((item) => convert(item, tag)).join('\n');
    }
    const children = Object.entries(data as Record<string, unknown>)
      .map(([key, value]) => convert(value, key))
      .join('\n');
    return `<${tag}>\n${children}\n</${tag}>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n${convert(obj, rootName)}`;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Shared layout
interface ToolLayoutProps {
  title: string;
  description: string;
  input: string;
  output: string;
  onInputChange: (value: string) => void;
  inputPlaceholder?: string;
  actions: React.ReactNode;
}

function ToolLayout({
  title,
  description,
  input,
  output,
  onInputChange,
  inputPlaceholder,
  actions,
}: ToolLayoutProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">{actions}</div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Input</label>
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={inputPlaceholder}
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-400">Output</label>
            {output && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/50 p-4 font-mono text-sm text-slate-300 placeholder:text-slate-600"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

