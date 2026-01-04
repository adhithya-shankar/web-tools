import { ReactNode } from 'react';
import { Header } from './Header';
import { TabNavigation } from './TabNavigation';
import { ToolSidebar } from './ToolSidebar';
import { StatusBar } from './StatusBar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
      </div>


      {/* Header */}
      <Header />

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Main content area */}
      <div className="relative z-10 flex flex-1">
        {/* Tool Sidebar */}
        <ToolSidebar />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="h-[calc(100vh-57px-57px-45px)] overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

