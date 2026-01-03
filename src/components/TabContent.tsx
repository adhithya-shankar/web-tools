import { useToolContext } from '../context/ToolContext';
import {
  FormatterTab,
  ConverterTab,
  EncodeDecodeTab,
  EscapeUnescapeTab,
  GeneratorTab,
  TextTab,
  TimeTab,
  MockServerTab,
} from './tabs';

export function TabContent() {
  const { selectedTab } = useToolContext();

  switch (selectedTab) {
    case 'formatter':
      return <FormatterTab />;
    case 'converter':
      return <ConverterTab />;
    case 'encode-decode':
      return <EncodeDecodeTab />;
    case 'escape-unescape':
      return <EscapeUnescapeTab />;
    case 'generator':
      return <GeneratorTab />;
    case 'text':
      return <TextTab />;
    case 'time':
      return <TimeTab />;
    case 'mock-server':
      return <MockServerTab />;
    default:
      return <FormatterTab />;
  }
}

