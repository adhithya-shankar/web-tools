import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { TabId, Tool, StatusInfo, ToolState, TABS, TOOLS } from '../types/tools';

interface MockEndpoint {
  id: string;
  method: string;
  path: string;
  response: string;
  status: number;
  delay: number;
}

interface MockServerState {
  isRunning: boolean;
  port: number;
  startedAt: Date | null;
  endpoints: MockEndpoint[];
}

type Theme = 'dark' | 'light';

interface ToolContextValue extends ToolState {
  setSelectedTab: (tabId: TabId) => void;
  setSelectedTool: (tool: Tool | null) => void;
  setStatus: (status: StatusInfo) => void;
  setProcessing: (isProcessing: boolean) => void;
  setLastAction: (action: string) => void;
  setStats: (stats: Record<string, string | number>) => void;
  clearStatus: () => void;
  getTabInfo: () => (typeof TABS)[number];
  getToolsForCurrentTab: () => Tool[];
  mockServer: MockServerState;
  startMockServer: (port?: number, endpoints?: MockEndpoint[]) => Promise<boolean>;
  stopMockServer: () => Promise<void>;
  updateMockEndpoints: (endpoints: MockEndpoint[]) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const defaultStatus: StatusInfo = {
  message: 'Ready',
  type: 'info',
};

const ToolContext = createContext<ToolContextValue | null>(null);

export function ToolProvider({ children }: { children: ReactNode }) {
  const [selectedTab, setSelectedTab] = useState<TabId>('formatter');
  const [selectedTool, setSelectedToolState] = useState<Tool | null>(null);
  const [status, setStatusState] = useState<StatusInfo>(defaultStatus);
  const [isProcessing, setProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string>();
  const [stats, setStats] = useState<Record<string, string | number>>({});
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });
  const [mockServer, setMockServer] = useState<MockServerState>({
    isRunning: false,
    port: 3001,
    startedAt: null,
    endpoints: [
      { id: '1', method: 'GET', path: '/api/users', response: '{"users": []}', status: 200, delay: 0 },
      { id: '2', method: 'POST', path: '/api/users', response: '{"id": 1, "created": true}', status: 201, delay: 100 },
    ],
  });

  // Use ref to always have access to the latest endpoints (avoids closure issues)
  const endpointsRef = useRef(mockServer.endpoints);
  useEffect(() => {
    endpointsRef.current = mockServer.endpoints;
  }, [mockServer.endpoints]);

  const handleSetSelectedTab = useCallback((tabId: TabId) => {
    setSelectedTab(tabId);
    setSelectedToolState(null);
    setStatusState({
      message: `Switched to ${TABS.find((t) => t.id === tabId)?.label}`,
      type: 'info',
    });
    setStats({});
  }, []);

  const handleSetSelectedTool = useCallback((tool: Tool | null) => {
    setSelectedToolState(tool);
    if (tool) {
      setStatusState({
        message: `${tool.name} selected`,
        type: 'info',
        details: tool.description,
      });
    }
  }, []);

  const setStatus = useCallback((newStatus: StatusInfo) => {
    setStatusState(newStatus);
  }, []);

  const clearStatus = useCallback(() => {
    setStatusState(defaultStatus);
    setStats({});
  }, []);

  const getTabInfo = useCallback((): (typeof TABS)[number] => {
    const tab = TABS.find((t) => t.id === selectedTab);
    return tab ?? TABS[0]!;
  }, [selectedTab]);

  const getToolsForCurrentTab = useCallback(() => {
    return TOOLS[selectedTab] || [];
  }, [selectedTab]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const startMockServer = useCallback(async (port: number = 3001, endpoints?: MockEndpoint[]): Promise<boolean> => {
    try {
      // Use ref to get latest endpoints, avoiding stale closure issues
      const endpointsToUse = endpoints ?? endpointsRef.current;
      const response = await fetch('/api/mock-server/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port, endpoints: endpointsToUse }),
      });
      
      if (response.ok) {
        setMockServer((prev) => ({
          ...prev,
          isRunning: true,
          port,
          startedAt: new Date(),
          endpoints: endpointsToUse,
        }));
        setStatusState({
          message: `Mock server started on port ${port}`,
          type: 'success',
          details: `${endpointsToUse.length} endpoint(s) registered`,
        });
        return true;
      }
      throw new Error('Failed to start server');
    } catch (err) {
      setStatusState({
        message: 'Failed to start mock server',
        type: 'error',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
      return false;
    }
  }, []);

  const stopMockServer = useCallback(async () => {
    try {
      await fetch('/api/mock-server/stop', { method: 'POST' });
    } catch {
      // Continue even if the request fails
    }
    setMockServer((prev) => ({
      ...prev,
      isRunning: false,
      startedAt: null,
    }));
    setStatusState({
      message: 'Mock server stopped',
      type: 'info',
    });
  }, []);

  const updateMockEndpoints = useCallback((endpoints: MockEndpoint[]) => {
    setMockServer((prev) => ({ ...prev, endpoints }));
    // If server is running, sync endpoints with backend
    if (mockServer.isRunning) {
      fetch('/api/mock-server/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoints }),
      }).catch(() => {
        // Ignore errors
      });
    }
  }, [mockServer.isRunning]);

  const value: ToolContextValue = {
    selectedTab,
    selectedTool,
    status,
    isProcessing,
    lastAction,
    stats,
    setSelectedTab: handleSetSelectedTab,
    setSelectedTool: handleSetSelectedTool,
    setStatus,
    setProcessing,
    setLastAction,
    setStats,
    clearStatus,
    getTabInfo,
    getToolsForCurrentTab,
    mockServer,
    startMockServer,
    stopMockServer,
    updateMockEndpoints,
    theme,
    toggleTheme,
  };

  return <ToolContext.Provider value={value}>{children}</ToolContext.Provider>;
}

export function useToolContext() {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useToolContext must be used within a ToolProvider');
  }
  return context;
}

// Custom hook for tools to easily update status
export function useToolStatus() {
  const { setStatus, setProcessing, setStats, setLastAction } = useToolContext();

  const success = useCallback(
    (message: string, details?: string) => {
      setStatus({ message, type: 'success', details });
    },
    [setStatus]
  );

  const error = useCallback(
    (message: string, details?: string) => {
      setStatus({ message, type: 'error', details });
    },
    [setStatus]
  );

  const warning = useCallback(
    (message: string, details?: string) => {
      setStatus({ message, type: 'warning', details });
    },
    [setStatus]
  );

  const info = useCallback(
    (message: string, details?: string) => {
      setStatus({ message, type: 'info', details });
    },
    [setStatus]
  );

  const withProcessing = useCallback(
    async <T,>(action: string, fn: () => Promise<T>): Promise<T> => {
      setProcessing(true);
      setLastAction(action);
      try {
        const result = await fn();
        return result;
      } finally {
        setProcessing(false);
      }
    },
    [setProcessing, setLastAction]
  );

  return {
    success,
    error,
    warning,
    info,
    setStats,
    setProcessing,
    withProcessing,
  };
}

