import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PDF Master heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/pdf master/i);
  expect(headingElement).toBeInTheDocument();
});
