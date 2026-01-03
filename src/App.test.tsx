import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    expect(screen.getByText('WebTools')).toBeInTheDocument();
  });

  it('renders the counter with initial value of 0', () => {
    render(<App />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('increments the counter when increase button is clicked', () => {
    render(<App />);
    const increaseButton = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(increaseButton);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('decrements the counter when decrease button is clicked', () => {
    render(<App />);
    const decreaseButton = screen.getByRole('button', { name: /decrement/i });
    fireEvent.click(decreaseButton);
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('renders technology badges', () => {
    render(<App />);
    expect(screen.getByText('React 18')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Vite')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
    expect(screen.getByText('Vitest')).toBeInTheDocument();
  });
});

