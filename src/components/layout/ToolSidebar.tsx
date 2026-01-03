import { Tool } from '../../types/tools';
import { useToolContext } from '../../context/ToolContext';

export function ToolSidebar() {
  const { selectedTool, setSelectedTool, getToolsForCurrentTab, getTabInfo } = useToolContext();
  const tools = getToolsForCurrentTab();
  const tabInfo = getTabInfo();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/30">
      <div className="sticky top-[57px] h-[calc(100vh-57px-45px)] overflow-y-auto">
        <div className="p-4">
          <h2 className="mb-1 font-display text-sm font-semibold text-slate-200">
            {tabInfo.label} Tools
          </h2>
          <p className="mb-4 text-xs text-slate-500">{tabInfo.description}</p>
          
          <div className="space-y-1">
            {tools.map((tool) => (
              <ToolButton
                key={tool.id}
                tool={tool}
                isActive={selectedTool?.id === tool.id}
                onClick={() => setSelectedTool(tool)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

interface ToolButtonProps {
  tool: Tool;
  isActive: boolean;
  onClick: () => void;
}

function ToolButton({ tool, isActive, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full rounded-lg px-3 py-2.5 text-left transition-all duration-150
        ${
          isActive
            ? 'bg-gradient-to-r from-primary-500/20 to-primary-500/10 text-white ring-1 ring-primary-500/30'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-8 w-8 items-center justify-center rounded-md transition-colors
            ${isActive ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-500 group-hover:text-slate-400'}
          `}
        >
          <ToolIcon toolId={tool.id} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{tool.name}</div>
          <div className="truncate text-xs text-slate-500">{tool.description}</div>
        </div>
      </div>
    </button>
  );
}

function ToolIcon({ toolId }: { toolId: string }) {
  // Simple icon based on tool type
  const iconMap: Record<string, JSX.Element> = {
    // Formatter icons
    'json-formatter': <span className="font-mono text-xs font-bold">{'{}'}</span>,
    'xml-formatter': <span className="font-mono text-xs font-bold">{'<>'}</span>,
    'html-formatter': <span className="font-mono text-xs font-bold">{'</>'}</span>,
    'css-formatter': <span className="font-mono text-xs font-bold">{'#'}</span>,
    'sql-formatter': <span className="font-mono text-xs font-bold">{'SQL'}</span>,
    
    // Default icon
    default: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  };

  return iconMap[toolId] || iconMap.default;
}

