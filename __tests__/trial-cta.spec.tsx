import { render, screen, fireEvent } from '@testing-library/react';
import Index from '@/pages/Index';
import React from 'react';

test('CTA exists and is clickable', () => {
  render(<Index />);
  const btn = screen.getByTestId('start-trial-cta');
  expect(btn).toBeInTheDocument();
  fireEvent.click(btn);
});
