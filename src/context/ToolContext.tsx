import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TabId, Tool, StatusInfo, ToolState, TABS, TOOLS } from '../types/tools';

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

