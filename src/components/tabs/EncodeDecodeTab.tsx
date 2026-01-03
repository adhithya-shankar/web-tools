import { useState, useEffect } from 'react';
import { useToolContext, useToolStatus } from '../../context/ToolContext';

export function EncodeDecodeTab() {
  const { selectedTool } = useToolContext();

  if (!selectedTool) {
    return <TabPlaceholder />;
  }

  switch (selectedTool.id) {
    case 'base64':
      return <Base64Tool />;
    case 'url-encode':
      return <UrlEncodeTool />;
    case 'jwt-decode':
      return <JwtDecodeTool />;
    case 'html-entities':
      return <HtmlEntitiesTool />;
    case 'unicode':
      return <UnicodeTool />;
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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

function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, error, setStats } = useToolStatus();

  const encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
      success('Encoded to Base64');
      setStats({ 'Input': input.length, 'Output': encoded.length });
    } catch (e) {
      error('Encoding failed', (e as Error).message);
    }
  };

  const decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
      success('Decoded from Base64');
      setStats({ 'Input': input.length, 'Output': decoded.length });
    } catch (e) {
      error('Invalid Base64', (e as Error).message);
    }
  };

  return (
    <ToolLayout
      title="Base64 Encode/Decode"
      description="Encode text to Base64 or decode Base64 strings"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder="Enter text to encode or Base64 to decode"
      actions={
        <>
          <button onClick={encode} className="btn-primary">
            Encode
          </button>
          <button onClick={decode} className="btn-secondary">
            Decode
          </button>
        </>
      }
    />
  );
}

function UrlEncodeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, error, setStats } = useToolStatus();

  const encode = () => {
    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
      success('URL encoded');
      setStats({ 'Original': input.length, 'Encoded': encoded.length });
    } catch (e) {
      error('Encoding failed', (e as Error).message);
    }
  };

  const decode = () => {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
      success('URL decoded');
      setStats({ 'Original': input.length, 'Decoded': decoded.length });
    } catch (e) {
      error('Decoding failed', (e as Error).message);
    }
  };

  return (
    <ToolLayout
      title="URL Encode/Decode"
      description="Encode or decode URL components"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder="Hello World! → Hello%20World%21"
      actions={
        <>
          <button onClick={encode} className="btn-primary">
            Encode
          </button>
          <button onClick={decode} className="btn-secondary">
            Decode
          </button>
        </>
      }
    />
  );
}

function JwtDecodeTool() {
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');
  const { success, error, setStats } = useToolStatus();

  useEffect(() => {
    if (!input.trim()) {
      setHeader('');
      setPayload('');
      setSignature('');
      return;
    }

    try {
      const parts = input.split('.');
      if (parts.length !== 3) {
        error('Invalid JWT format', 'JWT must have 3 parts');
        return;
      }

      const decodeBase64Url = (str: string) => {
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      };

      const headerJson = JSON.parse(decodeBase64Url(parts[0] ?? ''));
      const payloadJson = JSON.parse(decodeBase64Url(parts[1] ?? ''));

      setHeader(JSON.stringify(headerJson, null, 2));
      setPayload(JSON.stringify(payloadJson, null, 2));
      setSignature(parts[2] ?? '');

      success('JWT decoded successfully');
      setStats({
        'Algorithm': headerJson.alg || 'Unknown',
        'Type': headerJson.typ || 'Unknown',
      });

      // Check expiration
      if (payloadJson.exp) {
        const expDate = new Date(payloadJson.exp * 1000);
        const isExpired = expDate < new Date();
        if (isExpired) {
          error('Token expired', `Expired on ${expDate.toLocaleString()}`);
        }
      }
    } catch (e) {
      error('Failed to decode JWT', (e as Error).message);
    }
  }, [input, success, error, setStats]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">JWT Decode</h2>
        <p className="mt-1 text-sm text-slate-400">Decode and inspect JSON Web Tokens</p>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-slate-400">JWT Token</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="h-24 w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          spellCheck={false}
        />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-rose-400">Header</label>
          <textarea
            value={header}
            readOnly
            className="flex-1 resize-none rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 font-mono text-sm text-slate-300"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-primary-400">Payload</label>
          <textarea
            value={payload}
            readOnly
            className="flex-1 resize-none rounded-xl border border-primary-500/30 bg-primary-500/5 p-4 font-mono text-sm text-slate-300"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-sky-400">Signature</label>
          <textarea
            value={signature}
            readOnly
            className="flex-1 resize-none rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 font-mono text-sm text-slate-300 break-all"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

function HtmlEntitiesTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const encode = () => {
    const encoded = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    setOutput(encoded);
    success('HTML entities encoded');
    setStats({ 'Original': input.length, 'Encoded': encoded.length });
  };

  const decode = () => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    const decoded = textarea.value;
    setOutput(decoded);
    success('HTML entities decoded');
    setStats({ 'Original': input.length, 'Decoded': decoded.length });
  };

  return (
    <ToolLayout
      title="HTML Entities"
      description="Encode or decode HTML entities"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder="<div> → &lt;div&gt;"
      actions={
        <>
          <button onClick={encode} className="btn-primary">
            Encode
          </button>
          <button onClick={decode} className="btn-secondary">
            Decode
          </button>
        </>
      }
    />
  );
}

function UnicodeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, error, setStats } = useToolStatus();

  const toUnicode = () => {
    const unicode = input
      .split('')
      .map((char) => '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4))
      .join('');
    setOutput(unicode);
    success('Converted to Unicode');
    setStats({ Characters: input.length });
  };

  const fromUnicode = () => {
    try {
      const text = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
        String.fromCharCode(parseInt(code, 16))
      );
      setOutput(text);
      success('Converted from Unicode');
      setStats({ Characters: text.length });
    } catch (e) {
      error('Invalid Unicode', (e as Error).message);
    }
  };

  return (
    <ToolLayout
      title="Unicode Encode/Decode"
      description="Convert text to/from Unicode escape sequences"
      input={input}
      output={output}
      onInputChange={setInput}
      inputPlaceholder="Hello → \u0048\u0065\u006c\u006c\u006f"
      actions={
        <>
          <button onClick={toUnicode} className="btn-primary">
            To Unicode
          </button>
          <button onClick={fromUnicode} className="btn-secondary">
            From Unicode
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

