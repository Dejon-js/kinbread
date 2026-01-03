import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SoldOutBadge } from './sold-out-badge';

describe('SoldOutBadge', () => {
  it('renders with "Sold Out" text', () => {
    render(<SoldOutBadge />);
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });

  it('uses destructive variant', () => {
    const { container } = render(<SoldOutBadge />);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });

  it('has small text styling', () => {
    const { container } = render(<SoldOutBadge />);
    expect(container.firstChild).toHaveClass('text-xs');
  });
});
