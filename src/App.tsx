import { ToolProvider } from './context/ToolContext';
import { MainLayout } from './components/layout/MainLayout';
import { TabContent } from './components/TabContent';

function App() {
  return (
    <ToolProvider>
      <MainLayout>
        <TabContent />
      </MainLayout>
    </ToolProvider>
  );
}

export default App;
