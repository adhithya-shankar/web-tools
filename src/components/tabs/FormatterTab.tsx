import { useState, useEffect } from 'react';
import { useToolContext, useToolStatus } from '../../context/ToolContext';

export function FormatterTab() {
  const { selectedTool } = useToolContext();

  if (!selectedTool) {
    return <TabPlaceholder />;
  }

  // Render specific tool based on selection
  switch (selectedTool.id) {
    case 'json-formatter':
      return <JsonFormatter />;
    case 'xml-formatter':
      return <XmlFormatter />;
    case 'html-formatter':
      return <HtmlFormatter />;
    case 'css-formatter':
      return <CssFormatter />;
    case 'sql-formatter':
      return <SqlFormatter />;
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
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-400">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-200">{tabInfo.label}</h2>
      <p className="mt-2 max-w-md text-slate-400">{tabInfo.description}</p>
      <p className="mt-4 text-sm text-slate-500">
        Select a tool from the sidebar to get started • {tools.length} tools available
      </p>
    </div>
  );
}

function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const { success, error, setStats } = useToolStatus();

  useEffect(() => {
    if (input) {
      setStats({ 'Input Length': input.length, 'Indent': `${indentSize} spaces` });
    }
  }, [input, indentSize, setStats]);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      success('JSON formatted successfully', `${formatted.split('\n').length} lines`);
      setStats({
        'Input Length': input.length,
        'Output Length': formatted.length,
        'Lines': formatted.split('\n').length,
      });
    } catch (e) {
      error('Invalid JSON', (e as Error).message);
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      const savings = Math.round((1 - minified.length / input.length) * 100);
      success('JSON minified', `Reduced by ${savings}%`);
      setStats({
        'Input Length': input.length,
        'Output Length': minified.length,
        'Savings': `${savings}%`,
      });
    } catch (e) {
      error('Invalid JSON', (e as Error).message);
    }
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format, beautify, or minify JSON data"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder='{"name": "value", "items": [1, 2, 3]}'
      actions={
        <>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 space</option>
          </select>
          <button onClick={format} className="btn-primary">
            Format
          </button>
          <button onClick={minify} className="btn-secondary">
            Minify
          </button>
        </>
      }
    />
  );
}

function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, error, setStats } = useToolStatus();

  const format = () => {
    try {
      // Simple XML formatting
      let formatted = input
        .replace(/>\s*</g, '>\n<')
        .replace(/(<[^\/].*?>)/g, '\n$1')
        .split('\n')
        .filter((line) => line.trim())
        .map((line, _, arr) => {
          let indent = 0;
          arr.slice(0, arr.indexOf(line)).forEach((l) => {
            if (l.match(/<[^\/!?].*?[^\/]>/)) indent++;
            if (l.match(/<\/.*?>/)) indent--;
          });
          return '  '.repeat(Math.max(0, indent)) + line.trim();
        })
        .join('\n');
      setOutput(formatted);
      success('XML formatted successfully');
      setStats({ Lines: formatted.split('\n').length });
    } catch (e) {
      error('Error formatting XML', (e as Error).message);
    }
  };

  return (
    <ToolLayout
      title="XML Formatter"
      description="Format and beautify XML documents"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder="<root><item>value</item></root>"
      actions={
        <button onClick={format} className="btn-primary">
          Format XML
        </button>
      }
    />
  );
}

function HtmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const format = () => {
    // Simple HTML formatting
    let formatted = input
      .replace(/>\s*</g, '>\n<')
      .split('\n')
      .filter((line) => line.trim())
      .join('\n');
    setOutput(formatted);
    success('HTML formatted');
    setStats({ Lines: formatted.split('\n').length });
  };

  return (
    <ToolLayout
      title="HTML Formatter"
      description="Format and beautify HTML markup"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder="<div><p>Hello World</p></div>"
      actions={
        <button onClick={format} className="btn-primary">
          Format HTML
        </button>
      }
    />
  );
}

function CssFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const format = () => {
    // Simple CSS formatting
    let formatted = input
      .replace(/\{/g, ' {\n  ')
      .replace(/;/g, ';\n  ')
      .replace(/\}/g, '\n}\n')
      .replace(/\n\s*\n/g, '\n');
    setOutput(formatted);
    success('CSS formatted');
    setStats({ Lines: formatted.split('\n').length });
  };

  const minify = () => {
    let minified = input
      .replace(/\s+/g, ' ')
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';')
      .replace(/;\}/g, '}');
    setOutput(minified);
    success('CSS minified');
    setStats({ 'Original': input.length, 'Minified': minified.length });
  };

  return (
    <ToolLayout
      title="CSS Formatter"
      description="Format or minify CSS stylesheets"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder=".class{color:red;margin:0}"
      actions={
        <>
          <button onClick={format} className="btn-primary">
            Format
          </button>
          <button onClick={minify} className="btn-secondary">
            Minify
          </button>
        </>
      }
    />
  );
}

function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const format = () => {
    // Simple SQL formatting
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'INSERT', 'UPDATE', 'DELETE', 'SET', 'VALUES'];
    let formatted = input.toUpperCase();
    keywords.forEach((kw) => {
      formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, 'gi'), `\n${kw}`);
    });
    formatted = formatted.trim();
    setOutput(formatted);
    success('SQL formatted');
    setStats({ Lines: formatted.split('\n').length });
  };

  return (
    <ToolLayout
      title="SQL Formatter"
      description="Format SQL queries for better readability"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder="SELECT * FROM users WHERE id = 1"
      actions={
        <button onClick={format} className="btn-primary">
          Format SQL
        </button>
      }
    />
  );
}

// Shared layout component for tools
interface ToolLayoutProps {
  title: string;
  description: string;
  input: string;
  output: string;
  onInputChange: (value: string) => void;
  inputPlaceholder?: string;
  outputPlaceholder?: string;
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
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      {/* Actions */}
      <div className="mb-4 flex flex-wrap items-center gap-3">{actions}</div>

      {/* Input/Output panels */}
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input */}
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

        {/* Output */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-400">Output</label>
            {output && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
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
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/50 p-4 font-mono text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

