import { TABS, TabId } from '../../types/tools';
import { useToolContext } from '../../context/ToolContext';

export function TabNavigation() {
  const { selectedTab, setSelectedTab } = useToolContext();

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="w-full px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tabId={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={selectedTab === tab.id}
              onClick={() => setSelectedTab(tab.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

interface TabButtonProps {
  tabId: TabId;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium
        transition-all duration-200 ease-out
        ${
          isActive
            ? 'bg-primary-500/20 text-white shadow-lg shadow-primary-500/10'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        }
      `}
    >
      <TabIcon iconName={icon} isActive={isActive} />
      <span>{label}</span>
      {isActive && (
        <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary-400" />
      )}
    </button>
  );
}

function TabIcon({ iconName, isActive }: { iconName: string; isActive: boolean }) {
  const colorClass = isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-400';
  
  const icons: Record<string, JSX.Element> = {
    code: (
      <svg className={`h-4 w-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    repeat: (
      <svg className={`h-4 w-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    lock: (
      <svg className={`h-4 w-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    shield: (
      <svg className={`h-4 w-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    sparkles: (
      <svg className={`h-4 w-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    type: (
      <svg className={`h-4 w-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
    clock: (
      <svg className={`h-4 w-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    server: (
      <svg className={`h-4 w-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
  };

  return icons[iconName] || icons.code;
}

