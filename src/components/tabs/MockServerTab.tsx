import { useState } from 'react';
import { useToolContext, useToolStatus } from '../../context/ToolContext';

export function MockServerTab() {
  const { selectedTool } = useToolContext();

  if (!selectedTool) {
    return <TabPlaceholder />;
  }

  switch (selectedTool.id) {
    case 'endpoint-manager':
      return <EndpointManager />;
    case 'response-builder':
      return <ResponseBuilder />;
    case 'request-log':
      return <RequestLog />;
    case 'schema-validator':
      return <SchemaValidator />;
    case 'delay-simulator':
      return <DelaySimulator />;
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
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

interface Endpoint {
  id: string;
  method: string;
  path: string;
  response: string;
  status: number;
  delay: number;
}

function EndpointManager() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { id: '1', method: 'GET', path: '/api/users', response: '{"users": []}', status: 200, delay: 0 },
    { id: '2', method: 'POST', path: '/api/users', response: '{"id": 1, "created": true}', status: 201, delay: 100 },
  ]);
  const [editing, setEditing] = useState<Endpoint | null>(null);
  const { success, setStats } = useToolStatus();

  const addEndpoint = () => {
    const newEndpoint: Endpoint = {
      id: Date.now().toString(),
      method: 'GET',
      path: '/api/new',
      response: '{}',
      status: 200,
      delay: 0,
    };
    setEndpoints([...endpoints, newEndpoint]);
    setEditing(newEndpoint);
    success('Endpoint added');
    setStats({ 'Total Endpoints': endpoints.length + 1 });
  };

  const deleteEndpoint = (id: string) => {
    setEndpoints(endpoints.filter((e) => e.id !== id));
    success('Endpoint deleted');
    setStats({ 'Total Endpoints': endpoints.length - 1 });
  };

  const saveEndpoint = (endpoint: Endpoint) => {
    setEndpoints(endpoints.map((e) => (e.id === endpoint.id ? endpoint : e)));
    setEditing(null);
    success('Endpoint saved');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-200">Endpoint Manager</h2>
          <p className="mt-1 text-sm text-slate-400">Create and manage mock API endpoints</p>
        </div>
        <button onClick={addEndpoint} className="btn-primary">
          + Add Endpoint
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="card">
            {editing?.id === endpoint.id ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <select
                    value={endpoint.method}
                    onChange={(e) => setEditing({ ...editing, method: e.target.value })}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                  >
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editing.path}
                    onChange={(e) => setEditing({ ...editing, path: e.target.value })}
                    placeholder="/api/path"
                    className="input flex-1"
                  />
                  <input
                    type="number"
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: parseInt(e.target.value) })}
                    className="input w-20"
                    placeholder="Status"
                  />
                </div>
                <textarea
                  value={editing.response}
                  onChange={(e) => setEditing({ ...editing, response: e.target.value })}
                  placeholder="Response body (JSON)"
                  className="input h-24 resize-none font-mono text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={() => saveEndpoint(editing)} className="btn-primary text-sm">
                    Save
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-secondary text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`rounded px-2 py-1 text-xs font-bold ${
                    endpoint.method === 'GET' ? 'bg-sky-500/20 text-sky-400' :
                    endpoint.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                    endpoint.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                    endpoint.method === 'DELETE' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-slate-200">{endpoint.path}</span>
                  <span className="text-xs text-slate-500">→ {endpoint.status}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(endpoint)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteEndpoint(endpoint.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResponseBuilder() {
  const [status, setStatus] = useState(200);
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{\n  "success": true,\n  "data": {}\n}');
  const [preview, setPreview] = useState('');
  const { success, error, setStats } = useToolStatus();

  const build = () => {
    try {
      const headersObj = JSON.parse(headers);
      const bodyObj = JSON.parse(body);
      
      const response = {
        status,
        headers: headersObj,
        body: bodyObj,
      };
      
      setPreview(JSON.stringify(response, null, 2));
      success('Response built successfully');
      setStats({ Status: status, 'Headers': Object.keys(headersObj).length });
    } catch (e) {
      error('Invalid JSON', (e as Error).message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Response Builder</h2>
        <p className="mt-1 text-sm text-slate-400">Build and preview mock API responses</p>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-slate-400">Status Code:</label>
        <select
          value={status}
          onChange={(e) => setStatus(parseInt(e.target.value))}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
        >
          <option value={200}>200 OK</option>
          <option value={201}>201 Created</option>
          <option value={204}>204 No Content</option>
          <option value={400}>400 Bad Request</option>
          <option value={401}>401 Unauthorized</option>
          <option value={403}>403 Forbidden</option>
          <option value={404}>404 Not Found</option>
          <option value={500}>500 Internal Server Error</option>
        </select>
        <button onClick={build} className="btn-primary">
          Build Response
        </button>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Headers (JSON)</label>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Body (JSON)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Preview</label>
          <textarea
            value={preview}
            readOnly
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900/50 p-4 font-mono text-sm text-slate-300"
          />
        </div>
      </div>
    </div>
  );
}

function RequestLog() {
  const [logs] = useState([
    { id: 1, time: '10:23:45', method: 'GET', path: '/api/users', status: 200, duration: 45 },
    { id: 2, time: '10:23:52', method: 'POST', path: '/api/users', status: 201, duration: 123 },
    { id: 3, time: '10:24:01', method: 'GET', path: '/api/users/1', status: 200, duration: 32 },
    { id: 4, time: '10:24:15', method: 'DELETE', path: '/api/users/1', status: 204, duration: 89 },
    { id: 5, time: '10:24:30', method: 'GET', path: '/api/posts', status: 404, duration: 12 },
  ]);
  const { setStats } = useToolStatus();

  useState(() => {
    setStats({ 'Total Requests': logs.length, 'Avg Duration': '60ms' });
  });

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-200">Request Log</h2>
          <p className="mt-1 text-sm text-slate-400">View incoming requests to mock endpoints</p>
        </div>
        <button className="btn-secondary text-sm">
          Clear Log
        </button>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-800/50 text-left text-sm text-slate-400">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Duration</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                <td className="px-4 py-3 font-mono text-slate-500">{log.time}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                    log.method === 'GET' ? 'bg-sky-500/20 text-sky-400' :
                    log.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                    log.method === 'DELETE' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {log.method}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-300">{log.path}</td>
                <td className="px-4 py-3">
                  <span className={`font-mono ${
                    log.status < 300 ? 'text-emerald-400' :
                    log.status < 400 ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-500">{log.duration}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SchemaValidator() {
  const [schema, setSchema] = useState('{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" },\n    "age": { "type": "number" }\n  },\n  "required": ["name"]\n}');
  const [data, setData] = useState('{\n  "name": "John",\n  "age": 30\n}');
  const [result, setResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const { success, error, setStats } = useToolStatus();

  const validate = () => {
    try {
      const schemaObj = JSON.parse(schema);
      const dataObj = JSON.parse(data);
      const errors: string[] = [];

      // Simple validation logic
      if (schemaObj.type === 'object' && typeof dataObj !== 'object') {
        errors.push('Data must be an object');
      }

      if (schemaObj.required) {
        for (const field of schemaObj.required) {
          if (!(field in dataObj)) {
            errors.push(`Missing required field: ${field}`);
          }
        }
      }

      if (schemaObj.properties) {
        for (const [key, prop] of Object.entries(schemaObj.properties)) {
          if (key in dataObj) {
            const propSchema = prop as { type?: string };
            const actualType = typeof dataObj[key];
            if (propSchema.type && actualType !== propSchema.type) {
              errors.push(`Field "${key}" should be ${propSchema.type}, got ${actualType}`);
            }
          }
        }
      }

      setResult({ valid: errors.length === 0, errors });
      
      if (errors.length === 0) {
        success('Validation passed');
        setStats({ Valid: 'Yes', Errors: 0 });
      } else {
        error('Validation failed', `${errors.length} error(s)`);
        setStats({ Valid: 'No', Errors: errors.length });
      }
    } catch (e) {
      error('Invalid JSON', (e as Error).message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Schema Validator</h2>
        <p className="mt-1 text-sm text-slate-400">Validate JSON data against a schema</p>
      </div>

      <button onClick={validate} className="btn-primary mb-4 self-start">
        Validate
      </button>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">JSON Schema</label>
          <textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-slate-400">Data to Validate</label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/50 p-4 font-mono text-sm text-slate-200"
          />
        </div>
      </div>

      {result && (
        <div className={`mt-4 rounded-xl border p-4 ${
          result.valid 
            ? 'border-emerald-500/30 bg-emerald-500/10' 
            : 'border-rose-500/30 bg-rose-500/10'
        }`}>
          <div className={`font-medium ${result.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
            {result.valid ? '✓ Valid' : '✗ Invalid'}
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-rose-300">
              {result.errors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function DelaySimulator() {
  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { success, info, setStats } = useToolStatus();

  const simulate = async () => {
    setIsRunning(true);
    setElapsed(0);
    info(`Simulating ${delay}ms delay...`);

    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 50);

    await new Promise((resolve) => setTimeout(resolve, delay));

    clearInterval(interval);
    setElapsed(delay);
    setIsRunning(false);
    success(`Completed after ${delay}ms`);
    setStats({ 'Simulated Delay': `${delay}ms` });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Delay Simulator</h2>
        <p className="mt-1 text-sm text-slate-400">Simulate network latency and delays</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400">Delay (ms):</label>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={delay}
            onChange={(e) => setDelay(parseInt(e.target.value))}
            className="w-48"
          />
          <span className="w-16 font-mono text-slate-200">{delay}ms</span>
        </div>
        <button onClick={simulate} disabled={isRunning} className="btn-primary">
          {isRunning ? 'Running...' : 'Simulate'}
        </button>
      </div>

      <div className="flex-1">
        <div className="card">
          <div className="mb-4 text-sm text-slate-400">Progress</div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-100"
              style={{ width: `${(elapsed / delay) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-center font-mono text-2xl text-slate-200">
            {elapsed}ms / {delay}ms
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {[100, 500, 1000, 2000, 3000, 5000].map((d) => (
            <button
              key={d}
              onClick={() => setDelay(d)}
              className={`card text-center transition-colors ${
                delay === d ? 'ring-1 ring-primary-500' : ''
              }`}
            >
              <span className="font-mono text-slate-200">{d}ms</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

