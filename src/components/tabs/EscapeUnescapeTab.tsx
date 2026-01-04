import { useState } from 'react';
import { useToolContext, useToolStatus } from '../../context/ToolContext';

export function EscapeUnescapeTab() {
  const { selectedTool } = useToolContext();

  if (!selectedTool) {
    return <TabPlaceholder />;
  }

  switch (selectedTool.id) {
    case 'json-escape':
      return <JsonEscapeTool />;
    case 'html-escape':
      return <HtmlEscapeTool />;
    case 'xml-escape':
      return <XmlEscapeTool />;
    case 'regex-escape':
      return <RegexEscapeTool />;
    case 'sql-escape':
      return <SqlEscapeTool />;
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

function JsonEscapeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const escape = () => {
    const escaped = JSON.stringify(input).slice(1, -1);
    setOutput(escaped);
    success('JSON escaped');
    setStats({ 'Original': input.length, 'Escaped': escaped.length });
  };

  const unescape = () => {
    try {
      const unescaped = JSON.parse(`"${input}"`);
      setOutput(unescaped);
      success('JSON unescaped');
      setStats({ 'Original': input.length, 'Unescaped': unescaped.length });
    } catch {
      // Try alternative approach
      const unescaped = input
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      setOutput(unescaped);
      success('JSON unescaped (partial)');
    }
  };

  return (
    <ToolLayout
      title="JSON Escape/Unescape"
      description="Escape or unescape special characters in JSON strings"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder='Line 1\nLine 2\tTabbed "quoted"'
      actions={
        <>
          <button onClick={escape} className="btn-primary">
            Escape
          </button>
          <button onClick={unescape} className="btn-secondary">
            Unescape
          </button>
        </>
      }
    />
  );
}

function HtmlEscapeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const escape = () => {
    const escaped = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    setOutput(escaped);
    success('HTML escaped');
    setStats({ 'Original': input.length, 'Escaped': escaped.length });
  };

  const unescape = () => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    const unescaped = textarea.value;
    setOutput(unescaped);
    success('HTML unescaped');
    setStats({ 'Original': input.length, 'Unescaped': unescaped.length });
  };

  return (
    <ToolLayout
      title="HTML Escape/Unescape"
      description="Escape or unescape HTML special characters"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder='<div class="test">Hello & goodbye</div>'
      actions={
        <>
          <button onClick={escape} className="btn-primary">
            Escape
          </button>
          <button onClick={unescape} className="btn-secondary">
            Unescape
          </button>
        </>
      }
    />
  );
}

function XmlEscapeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const escape = () => {
    const escaped = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    setOutput(escaped);
    success('XML escaped');
    setStats({ 'Original': input.length, 'Escaped': escaped.length });
  };

  const unescape = () => {
    const unescaped = input
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    setOutput(unescaped);
    success('XML unescaped');
    setStats({ 'Original': input.length, 'Unescaped': unescaped.length });
  };

  return (
    <ToolLayout
      title="XML Escape/Unescape"
      description="Escape or unescape XML special characters"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder='<element attr="value">content</element>'
      actions={
        <>
          <button onClick={escape} className="btn-primary">
            Escape
          </button>
          <button onClick={unescape} className="btn-secondary">
            Unescape
          </button>
        </>
      }
    />
  );
}

function RegexEscapeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const escape = () => {
    const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    setOutput(escaped);
    success('Regex escaped');
    setStats({ 'Original': input.length, 'Escaped': escaped.length });
  };

  const unescape = () => {
    const unescaped = input.replace(/\\([.*+?^${}()|[\]\\])/g, '$1');
    setOutput(unescaped);
    success('Regex unescaped');
    setStats({ 'Original': input.length, 'Unescaped': unescaped.length });
  };

  return (
    <ToolLayout
      title="Regex Escape/Unescape"
      description="Escape or unescape regex special characters"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder="file.txt (copy) [1]"
      actions={
        <>
          <button onClick={escape} className="btn-primary">
            Escape
          </button>
          <button onClick={unescape} className="btn-secondary">
            Unescape
          </button>
        </>
      }
    />
  );
}

function SqlEscapeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const escape = () => {
    const escaped = input
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\');
    setOutput(`'${escaped}'`);
    success('SQL escaped');
    setStats({ 'Original': input.length, 'Escaped': escaped.length + 2 });
  };

  const unescape = () => {
    let unescaped = input;
    // Remove surrounding quotes if present
    if (unescaped.startsWith("'") && unescaped.endsWith("'")) {
      unescaped = unescaped.slice(1, -1);
    }
    unescaped = unescaped
      .replace(/''/g, "'")
      .replace(/\\\\/g, '\\');
    setOutput(unescaped);
    success('SQL unescaped');
    setStats({ 'Original': input.length, 'Unescaped': unescaped.length });
  };

  return (
    <ToolLayout
      title="SQL Escape/Unescape"
      description="Escape or unescape SQL string literals"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder={'O\'Brien said "Hello"'}
      actions={
        <>
          <button onClick={escape} className="btn-primary">
            Escape
          </button>
          <button onClick={unescape} className="btn-secondary">
            Unescape
          </button>
        </>
      }
    />
  );
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

