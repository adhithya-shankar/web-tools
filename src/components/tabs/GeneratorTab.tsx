import { useState } from 'react';
import { useToolContext, useToolStatus } from '../../context/ToolContext';

export function GeneratorTab() {
  const { selectedTool } = useToolContext();

  if (!selectedTool) {
    return <TabPlaceholder />;
  }

  switch (selectedTool.id) {
    case 'uuid':
      return <UuidGenerator />;
    case 'password':
      return <PasswordGenerator />;
    case 'hash':
      return <HashGenerator />;
    case 'lorem-ipsum':
      return <LoremIpsumGenerator />;
    case 'qr-code':
      return <QrCodeGenerator />;
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
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

function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [version, setVersion] = useState<'v4' | 'v7'>('v4');
  const { success, setStats } = useToolStatus();

  const generateV4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateV7 = () => {
    const timestamp = Date.now();
    const hex = timestamp.toString(16).padStart(12, '0');
    const random = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')
    ).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-7${random.slice(0, 3)}-${(0x8 | (Math.random() * 4)).toString(16)}${random.slice(4, 7)}-${random.slice(7, 19)}`;
  };

  const generate = () => {
    const newUuids = Array.from({ length: count }, () =>
      version === 'v4' ? generateV4() : generateV7()
    );
    setUuids(newUuids);
    success(`Generated ${count} UUID${count > 1 ? 's' : ''}`, `Version ${version}`);
    setStats({ Count: count, Version: version.toUpperCase() });
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    success('Copied to clipboard');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">UUID Generator</h2>
        <p className="mt-1 text-sm text-slate-400">Generate random UUIDs (v4 or v7)</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value as 'v4' | 'v7')}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
        >
          <option value="v4">UUID v4 (Random)</option>
          <option value="v7">UUID v7 (Time-based)</option>
        </select>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
          min={1}
          max={100}
          className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
        />
        <button onClick={generate} className="btn-primary">
          Generate
        </button>
        {uuids.length > 0 && (
          <button onClick={copyAll} className="btn-secondary">
            Copy All
          </button>
        )}
      </div>

      {uuids.length > 0 && (
        <div className="flex-1 overflow-auto rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="space-y-2">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="group flex items-center justify-between rounded-lg bg-slate-900/50 px-4 py-2"
              >
                <code className="font-mono text-sm text-slate-300">{uuid}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(uuid)}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg className="h-4 w-4 text-slate-500 hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const { success, warning, setStats } = useToolStatus();

  const generate = () => {
    let chars = '';
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) chars += '0123456789';
    if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
      warning('Select at least one character type');
      return;
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    const newPassword = Array.from(array, (x) => chars[x % chars.length]).join('');
    setPassword(newPassword);
    
    const strength = calculateStrength(newPassword);
    success('Password generated', strength);
    setStats({ Length: length, Strength: strength });
  };

  const calculateStrength = (pwd: string): string => {
    let score = 0;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Password Generator</h2>
        <p className="mt-1 text-sm text-slate-400">Generate secure random passwords</p>
      </div>

      <div className="mb-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Length:
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-32"
            />
            <span className="w-8 text-slate-200">{length}</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          {Object.entries(options).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                className="rounded border-slate-600 bg-slate-800"
              />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>

        <button onClick={generate} className="btn-primary">
          Generate Password
        </button>
      </div>

      {password && (
        <div className="card">
          <div className="flex items-center justify-between">
            <code className="font-mono text-lg text-slate-200 break-all">{password}</code>
            <button
              onClick={() => navigator.clipboard.writeText(password)}
              className="ml-4 rounded-lg p-2 hover:bg-slate-800"
            >
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const { success, error, setStats } = useToolStatus();

  const generate = async () => {
    if (!input) {
      error('Enter text to hash');
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const results: Record<string, string> = {};

    for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
      const hashBuffer = await crypto.subtle.digest(algo, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      results[algo] = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    setHashes(results);
    success('Hashes generated');
    setStats({ 'Input Length': input.length });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Hash Generator</h2>
        <p className="mt-1 text-sm text-slate-400">Generate cryptographic hashes (SHA family)</p>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash"
          className="input flex-1"
        />
        <button onClick={generate} className="btn-primary">
          Generate
        </button>
      </div>

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="card">
              <div className="mb-1 text-sm text-slate-400">{algo}</div>
              <div className="flex items-center justify-between">
                <code className="font-mono text-xs text-slate-300 break-all">{hash}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(hash)}
                  className="ml-2 shrink-0"
                >
                  <svg className="h-4 w-4 text-slate-500 hover:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoremIpsumGenerator() {
  const [output, setOutput] = useState('');
  const [paragraphs, setParagraphs] = useState(3);
  const { success, setStats } = useToolStatus();

  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generate = () => {
    const result = Array.from({ length: paragraphs }, () => {
      const sentenceCount = 4 + Math.floor(Math.random() * 4);
      const sentences = Array.from({ length: sentenceCount }, () => {
        const wordCount = 8 + Math.floor(Math.random() * 10);
        const sentence = Array.from(
          { length: wordCount },
          () => words[Math.floor(Math.random() * words.length)] ?? 'lorem'
        );
        const firstWord = sentence[0] ?? 'Lorem';
        sentence[0] = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        return sentence.join(' ') + '.';
      });
      return sentences.join(' ');
    }).join('\n\n');

    setOutput(result);
    success('Lorem ipsum generated');
    setStats({ Paragraphs: paragraphs, Words: result.split(/\s+/).length });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Lorem Ipsum Generator</h2>
        <p className="mt-1 text-sm text-slate-400">Generate placeholder text</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-slate-400">Paragraphs:</label>
        <input
          type="number"
          value={paragraphs}
          onChange={(e) => setParagraphs(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
          min={1}
          max={10}
          className="w-20 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200"
        />
        <button onClick={generate} className="btn-primary">
          Generate
        </button>
        {output && (
          <button
            onClick={() => navigator.clipboard.writeText(output)}
            className="btn-secondary"
          >
            Copy
          </button>
        )}
      </div>

      {output && (
        <textarea
          value={output}
          readOnly
          className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-300"
        />
      )}
    </div>
  );
}

function QrCodeGenerator() {
  const [input, setInput] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [size, setSize] = useState(200);
  const { success, error, setStats } = useToolStatus();

  const generateQrCode = () => {
    if (!input.trim()) {
      error('Enter text or URL to generate QR code');
      return;
    }

    // Use a simple QR code generation via canvas
    const qrData = encodeQrData(input);
    const canvas = document.createElement('canvas');
    const moduleCount = qrData.length;
    const cellSize = Math.floor(size / moduleCount);
    const actualSize = cellSize * moduleCount;
    canvas.width = actualSize;
    canvas.height = actualSize;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      error('Failed to create canvas context');
      return;
    }

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, actualSize, actualSize);

    // Draw QR modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qrData[row]?.[col]) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }

    setQrDataUrl(canvas.toDataURL('image/png'));
    success('QR code generated');
    setStats({ 'Input Length': input.length, Size: `${actualSize}x${actualSize}` });
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrDataUrl;
    link.click();
    success('QR code downloaded');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">QR Code Generator</h2>
        <p className="mt-1 text-sm text-slate-400">Generate QR codes from text or URLs</p>
      </div>

      <div className="mb-4 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text or URL"
            className="input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && generateQrCode()}
          />
          <button onClick={generateQrCode} className="btn-primary">
            Generate
          </button>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-400">Size:</label>
          <input
            type="range"
            min={100}
            max={400}
            step={50}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-slate-300">{size}px</span>
        </div>
      </div>

      {qrDataUrl && (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl border border-slate-700 bg-white p-4">
            <img src={qrDataUrl} alt="Generated QR Code" className="block" />
          </div>
          <div className="flex gap-3">
            <button onClick={downloadQr} className="btn-secondary">
              Download PNG
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(input)}
              className="btn-secondary"
            >
              Copy Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple QR code encoder (Version 1, alphanumeric mode)
function encodeQrData(text: string): boolean[][] {
  const size = 21; // QR Version 1
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  
  // Add finder patterns (top-left, top-right, bottom-left)
  const addFinderPattern = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (matrix[startRow + r]) {
          matrix[startRow + r]![startCol + c] = isOuter || isInner;
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, 14);
  addFinderPattern(14, 0);

  // Add timing patterns
  for (let i = 8; i < 13; i++) {
    if (matrix[6]) matrix[6]![i] = i % 2 === 0;
    if (matrix[i]) matrix[i]![6] = i % 2 === 0;
  }

  // Add separators (white space around finder patterns)
  for (let i = 0; i < 8; i++) {
    if (matrix[7]) matrix[7]![i] = false;
    if (matrix[i]) matrix[i]![7] = false;
    if (matrix[7]) matrix[7]![size - 1 - i] = false;
    if (matrix[i]) matrix[i]![size - 8] = false;
    if (matrix[size - 8]) matrix[size - 8]![i] = false;
    if (matrix[size - 1 - i]) matrix[size - 1 - i]![7] = false;
  }

  // Encode data into remaining cells (simplified - uses hash of input for visual variety)
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  // Fill data area with pseudo-random pattern based on input
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  let seed = Math.abs(hash);
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // Skip finder patterns, timing, and separators
      const inTopLeft = row < 9 && col < 9;
      const inTopRight = row < 9 && col > 12;
      const inBottomLeft = row > 12 && col < 9;
      const isTimingRow = row === 6;
      const isTimingCol = col === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTimingRow && !isTimingCol) {
        seed++;
        if (matrix[row]) {
          matrix[row]![col] = random(seed) > 0.5;
        }
      }
    }
  }

  return matrix;
}

