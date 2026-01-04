import { useState, useEffect } from 'react';
import { useToolContext, useToolStatus } from '../../context/ToolContext';

export function TextTab() {
  const { selectedTool } = useToolContext();

  if (!selectedTool) {
    return <TabPlaceholder />;
  }

  switch (selectedTool.id) {
    case 'case-converter':
      return <CaseConverter />;
    case 'diff-checker':
      return <DiffChecker />;
    case 'word-counter':
      return <WordCounter />;
    case 'regex-tester':
      return <RegexTester />;
    case 'markdown-preview':
      return <MarkdownPreview />;
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
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

function CaseConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { success, setStats } = useToolStatus();

  const convert = (type: string) => {
    let result = '';
    switch (type) {
      case 'upper':
        result = input.toUpperCase();
        break;
      case 'lower':
        result = input.toLowerCase();
        break;
      case 'title':
        result = input.replace(/\w\S*/g, (txt) =>
          txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        );
        break;
      case 'sentence':
        result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        result = input.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
        break;
      case 'pascal':
        result = input.toLowerCase().replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, __, c) => c.toUpperCase());
        break;
      case 'snake':
        result = input.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        break;
      case 'kebab':
        result = input.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        break;
    }
    setOutput(result);
    success(`Converted to ${type} case`);
    setStats({ Characters: result.length });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Case Converter</h2>
        <p className="mt-1 text-sm text-slate-400">Convert text between different cases</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: 'upper', label: 'UPPER' },
          { id: 'lower', label: 'lower' },
          { id: 'title', label: 'Title Case' },
          { id: 'sentence', label: 'Sentence case' },
          { id: 'camel', label: 'camelCase' },
          { id: 'pascal', label: 'PascalCase' },
          { id: 'snake', label: 'snake_case' },
          { id: 'kebab', label: 'kebab-case' },
        ].map((c) => (
          <button key={c.id} onClick={() => convert(c.id)} className="btn-secondary text-sm">
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to convert"
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Output</label>
          <textarea
            value={output}
            readOnly
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-300"
          />
        </div>
      </div>
    </div>
  );
}

function DiffChecker() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState<{ type: string; value: string }[]>([]);
  const { success, setStats } = useToolStatus();

  const compare = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: { type: string; value: string }[] = [];
    
    const maxLen = Math.max(lines1.length, lines2.length);
    let added = 0, removed = 0, unchanged = 0;
    
    for (let i = 0; i < maxLen; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];
      
      if (line1 === line2) {
        result.push({ type: 'unchanged', value: line1 || '' });
        unchanged++;
      } else {
        if (line1 !== undefined) {
          result.push({ type: 'removed', value: line1 });
          removed++;
        }
        if (line2 !== undefined) {
          result.push({ type: 'added', value: line2 });
          added++;
        }
      }
    }
    
    setDiff(result);
    success('Comparison complete');
    setStats({ Added: added, Removed: removed, Unchanged: unchanged });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Diff Checker</h2>
        <p className="mt-1 text-sm text-slate-400">Compare two texts and see differences</p>
      </div>

      <button onClick={compare} className="btn-primary mb-4 self-start">
        Compare
      </button>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Original</label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Paste original text"
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Modified</label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Paste modified text"
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200"
          />
        </div>
      </div>

      {diff.length > 0 && (
        <div className="mt-4 max-h-48 overflow-auto rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          {diff.map((line, i) => (
            <div
              key={i}
              className={`font-mono text-sm ${
                line.type === 'added' ? 'bg-emerald-500/10 text-emerald-400' :
                line.type === 'removed' ? 'bg-rose-500/10 text-rose-400' :
                'text-slate-400'
              }`}
            >
              {line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  '}
              {line.value || ' '}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WordCounter() {
  const [input, setInput] = useState('');
  const { setStats } = useToolStatus();

  useEffect(() => {
    const text = input.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = input.length;
    const charsNoSpace = input.replace(/\s/g, '').length;
    const sentences = text ? (text.match(/[.!?]+/g) || []).length || 1 : 0;
    const paragraphs = text ? text.split(/\n\n+/).filter(Boolean).length : 0;
    const lines = text ? text.split('\n').length : 0;

    setStats({
      Words: words,
      Characters: chars,
      'No Spaces': charsNoSpace,
      Sentences: sentences,
      Paragraphs: paragraphs,
      Lines: lines,
    });
  }, [input, setStats]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Word Counter</h2>
        <p className="mt-1 text-sm text-slate-400">Count words, characters, sentences, and more</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Start typing or paste text here..."
        className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-slate-200 placeholder:text-slate-600 focus:border-primary-500 focus:outline-none"
      />

      <p className="mt-4 text-sm text-slate-500">
        Statistics are shown in the status bar below
      </p>
    </div>
  );
}

function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [input, setInput] = useState('');
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const { success, error, setStats } = useToolStatus();

  const test = () => {
    try {
      const regex = new RegExp(pattern, flags);
      const allMatches = [...input.matchAll(regex)];
      setMatches(allMatches);
      success(`Found ${allMatches.length} match(es)`);
      setStats({ Matches: allMatches.length, Pattern: `/${pattern}/${flags}` });
    } catch (e) {
      error('Invalid regex', (e as Error).message);
      setMatches([]);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Regex Tester</h2>
        <p className="mt-1 text-sm text-slate-400">Test regular expressions with live matching</p>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="flex flex-1 items-center rounded-xl border border-slate-700 bg-slate-800">
          <span className="px-3 text-slate-500">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="regex pattern"
            className="flex-1 bg-transparent py-2 text-slate-200 outline-none"
          />
          <span className="px-1 text-slate-500">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="flags"
            className="w-16 bg-transparent py-2 text-slate-200 outline-none"
          />
        </div>
        <button onClick={test} className="btn-primary">
          Test
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter test string"
        className="mb-4 h-32 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-slate-200"
      />

      {matches.length > 0 && (
        <div className="flex-1 overflow-auto rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-400">Matches:</h3>
          {matches.map((match, i) => (
            <div key={i} className="mb-2 rounded-lg bg-slate-800 p-2">
              <span className="text-primary-400">#{i + 1}</span>
              <span className="ml-2 font-mono text-slate-200">"{match[0]}"</span>
              <span className="ml-2 text-xs text-slate-500">at index {match.index}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarkdownPreview() {
  const [input, setInput] = useState(`# Hello World

This is a **bold** and *italic* text.

- List item 1
- List item 2
- List item 3

\`\`\`
code block
\`\`\`

> This is a blockquote`);
  const { setStats } = useToolStatus();

  useEffect(() => {
    setStats({ Lines: input.split('\n').length, Characters: input.length });
  }, [input, setStats]);

  const renderMarkdown = (md: string) => {
    return md
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-slate-200 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-slate-200 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-slate-100 mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 rounded text-primary-400">$1</code>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 text-slate-300">• $1</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-primary-500 pl-4 text-slate-400 italic">$1</blockquote>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Markdown Preview</h2>
        <p className="mt-1 text-sm text-slate-400">Write markdown and see live preview</p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Markdown</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Preview</label>
          <div
            className="flex-1 overflow-auto rounded-xl border border-slate-700 bg-slate-900/50 p-4"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(input) }}
          />
        </div>
      </div>
    </div>
  );
}

