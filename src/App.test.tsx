import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText('WebTools')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(screen.getByText('Developer Utilities')).toBeInTheDocument();
  });

  it('renders the tab navigation with Formatter tab', () => {
    render(<App />);
    const nav = screen.getByRole('navigation');
    const formatterTab = within(nav).getByRole('button', { name: /formatter/i });
    expect(formatterTab).toBeInTheDocument();
  });

  it('renders multiple tool tabs in navigation', () => {
    render(<App />);
    const nav = screen.getByRole('navigation');
    expect(within(nav).getByRole('button', { name: /formatter/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /converter/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /generator/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /^text$/i })).toBeInTheDocument();
  });

  it('has a theme toggle button', () => {
    render(<App />);
    // In dark mode (default), the button title says "Switch to light mode"
    expect(screen.getByTitle(/switch to light mode/i)).toBeInTheDocument();
  });
});
