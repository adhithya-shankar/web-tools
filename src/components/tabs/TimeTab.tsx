import { useState, useEffect } from 'react';
import { useToolContext, useToolStatus } from '../../context/ToolContext';

export function TimeTab() {
  const { selectedTool } = useToolContext();

  if (!selectedTool) {
    return <TabPlaceholder />;
  }

  switch (selectedTool.id) {
    case 'timestamp-converter':
      return <TimestampConverter />;
    case 'timezone-converter':
      return <TimezoneConverter />;
    case 'date-calculator':
      return <DateCalculator />;
    case 'cron-parser':
      return <CronParser />;
    case 'world-clock':
      return <WorldClock />;
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});
  const { success, error, setStats } = useToolStatus();

  const now = () => {
    const ts = Date.now();
    setTimestamp(String(ts));
    convert(String(ts));
  };

  const convert = (input?: string) => {
    const ts = input || timestamp;
    try {
      let dateObj: Date;
      
      if (/^\d{10}$/.test(ts)) {
        dateObj = new Date(parseInt(ts) * 1000);
      } else if (/^\d{13}$/.test(ts)) {
        dateObj = new Date(parseInt(ts));
      } else if (ts) {
        dateObj = new Date(ts);
      } else {
        return;
      }

      if (isNaN(dateObj.getTime())) {
        error('Invalid date/timestamp');
        return;
      }

      setResults({
        'Unix (seconds)': String(Math.floor(dateObj.getTime() / 1000)),
        'Unix (milliseconds)': String(dateObj.getTime()),
        'ISO 8601': dateObj.toISOString(),
        'Local': dateObj.toLocaleString(),
        'UTC': dateObj.toUTCString(),
        'Date only': dateObj.toLocaleDateString(),
        'Time only': dateObj.toLocaleTimeString(),
      });
      success('Timestamp converted');
      setStats({ 'Year': dateObj.getFullYear(), 'Month': dateObj.getMonth() + 1, 'Day': dateObj.getDate() });
    } catch (e) {
      error('Conversion failed', (e as Error).message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Timestamp Converter</h2>
        <p className="mt-1 text-sm text-slate-400">Convert between Unix timestamps and dates</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          placeholder="Unix timestamp or date string"
          className="input flex-1"
        />
        <button onClick={() => convert()} className="btn-primary">
          Convert
        </button>
        <button onClick={now} className="btn-secondary">
          Now
        </button>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm text-slate-400">Or pick a date:</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            if (e.target.value) {
              convert(e.target.value);
            }
          }}
          className="input"
        />
      </div>

      {Object.keys(results).length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(results).map(([label, value]) => (
            <div key={label} className="card flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="font-mono text-sm text-slate-200">{value}</div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(value)}
                className="text-slate-500 hover:text-slate-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimezoneConverter() {
  const [time, setTime] = useState(new Date().toISOString().slice(0, 16));
  const [fromZone, setFromZone] = useState('UTC');
  const [toZone, setToZone] = useState('America/New_York');
  const [result, setResult] = useState('');
  const { success, setStats } = useToolStatus();

  const zones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
    'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai', 'Australia/Sydney',
  ];

  const convert = () => {
    const date = new Date(time);
    const converted = date.toLocaleString('en-US', { timeZone: toZone, dateStyle: 'full', timeStyle: 'long' });
    setResult(converted);
    success('Timezone converted');
    setStats({ From: fromZone, To: toZone });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Timezone Converter</h2>
        <p className="mt-1 text-sm text-slate-400">Convert time between different timezones</p>
      </div>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-400">Date & Time</label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-400">From Timezone</label>
          <select
            value={fromZone}
            onChange={(e) => setFromZone(e.target.value)}
            className="input"
          >
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-400">To Timezone</label>
          <select
            value={toZone}
            onChange={(e) => setToZone(e.target.value)}
            className="input"
          >
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={convert} className="btn-primary mb-4 self-start">
        Convert
      </button>

      {result && (
        <div className="card">
          <div className="text-sm text-slate-400">Converted Time ({toZone})</div>
          <div className="mt-2 text-xl text-slate-200">{result}</div>
        </div>
      )}
    </div>
  );
}

function DateCalculator() {
  const [date1, setDate1] = useState(new Date().toISOString().slice(0, 10));
  const [date2, setDate2] = useState('');
  const [addDays, setAddDays] = useState(0);
  const [result, setResult] = useState<Record<string, string | number>>({});
  const { success, setStats } = useToolStatus();

  const calculateDiff = () => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    setResult({
      Days: diffDays,
      Weeks: diffWeeks,
      Months: diffMonths,
      Years: diffYears,
      Hours: Math.floor(diffMs / (1000 * 60 * 60)),
      Minutes: Math.floor(diffMs / (1000 * 60)),
    });
    success('Difference calculated');
    setStats({ 'Total Days': diffDays });
  };

  const addToDate = () => {
    const d = new Date(date1);
    d.setDate(d.getDate() + addDays);
    setResult({
      'Result Date': d.toLocaleDateString(),
      'ISO Format': d.toISOString().slice(0, 10),
      'Day of Week': d.toLocaleDateString('en-US', { weekday: 'long' }),
    });
    success(`Added ${addDays} days`);
    setStats({ 'Days Added': addDays });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Date Calculator</h2>
        <p className="mt-1 text-sm text-slate-400">Calculate date differences or add/subtract days</p>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 font-medium text-slate-300">Calculate Difference</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Start Date</label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">End Date</label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="input"
            />
          </div>
          <button onClick={calculateDiff} className="btn-primary">
            Calculate
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 font-medium text-slate-300">Add/Subtract Days</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-400">From Date</label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Days (+/-)</label>
            <input
              type="number"
              value={addDays}
              onChange={(e) => setAddDays(parseInt(e.target.value) || 0)}
              className="input w-24"
            />
          </div>
          <button onClick={addToDate} className="btn-secondary">
            Calculate
          </button>
        </div>
      </div>

      {Object.keys(result).length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Object.entries(result).map(([label, value]) => (
            <div key={label} className="card">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="font-mono text-lg text-slate-200">{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CronParser() {
  const [cron, setCron] = useState('0 0 * * *');
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const { success, error } = useToolStatus();

  const parse = () => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) {
      error('Invalid cron format', 'Expected 5 fields: minute hour day month weekday');
      return;
    }

    const minute = parts[0] ?? '*';
    const hour = parts[1] ?? '*';
    const day = parts[2] ?? '*';
    const month = parts[3] ?? '*';
    const weekday = parts[4] ?? '*';
    const descriptions: string[] = [];

    if (minute === '*') descriptions.push('every minute');
    else if (minute === '0') descriptions.push('at the start of the hour');
    else descriptions.push(`at minute ${minute}`);

    if (hour === '*') descriptions.push('every hour');
    else descriptions.push(`at ${hour}:00`);

    if (day === '*' && month === '*') descriptions.push('every day');
    else if (day !== '*') descriptions.push(`on day ${day}`);

    if (weekday !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      descriptions.push(`on ${days[parseInt(weekday)] ?? weekday}`);
    }

    setDescription(descriptions.join(', '));
    
    // Generate next runs (simplified)
    const now = new Date();
    const runs = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      if (hour !== '*') d.setHours(parseInt(hour));
      if (minute !== '*') d.setMinutes(parseInt(minute));
      return d.toLocaleString();
    });
    setNextRuns(runs);
    success('Cron expression parsed');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">Cron Parser</h2>
        <p className="mt-1 text-sm text-slate-400">Parse and explain cron expressions</p>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          value={cron}
          onChange={(e) => setCron(e.target.value)}
          placeholder="* * * * *"
          className="input flex-1 font-mono"
        />
        <button onClick={parse} className="btn-primary">
          Parse
        </button>
      </div>

      <div className="mb-4 text-sm text-slate-500">
        Format: minute (0-59) hour (0-23) day (1-31) month (1-12) weekday (0-6)
      </div>

      {description && (
        <div className="card mb-4">
          <div className="text-sm text-slate-400">Description</div>
          <div className="mt-1 text-slate-200">{description}</div>
        </div>
      )}

      {nextRuns.length > 0 && (
        <div className="card">
          <div className="text-sm text-slate-400 mb-2">Next runs (approximate)</div>
          {nextRuns.map((run, i) => (
            <div key={i} className="text-sm text-slate-300 py-1">{run}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function WorldClock() {
  const [times, setTimes] = useState<Record<string, string>>({});

  const zones = [
    { name: 'Local', zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    { name: 'UTC', zone: 'UTC' },
    { name: 'New York', zone: 'America/New_York' },
    { name: 'Los Angeles', zone: 'America/Los_Angeles' },
    { name: 'London', zone: 'Europe/London' },
    { name: 'Paris', zone: 'Europe/Paris' },
    { name: 'Tokyo', zone: 'Asia/Tokyo' },
    { name: 'Sydney', zone: 'Australia/Sydney' },
    { name: 'Dubai', zone: 'Asia/Dubai' },
    { name: 'Singapore', zone: 'Asia/Singapore' },
  ];

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const newTimes: Record<string, string> = {};
      zones.forEach(({ name, zone }) => {
        newTimes[name] = now.toLocaleString('en-US', {
          timeZone: zone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      });
      setTimes(newTimes);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-slate-200">World Clock</h2>
        <p className="mt-1 text-sm text-slate-400">Current time in major cities around the world</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {zones.map(({ name, zone }) => (
          <div key={zone} className="card text-center">
            <div className="text-sm text-slate-400">{name}</div>
            <div className="mt-1 font-mono text-xl tabular-nums text-slate-200">
              {times[name] || '--:--:--'}
            </div>
            <div className="mt-1 text-xs text-slate-600">{zone}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

