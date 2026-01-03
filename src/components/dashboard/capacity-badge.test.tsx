import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CapacityBadge } from './capacity-badge';

describe('CapacityBadge', () => {
  describe('with showFraction=true (default)', () => {
    it('shows success variant when no slots are used', () => {
      render(<CapacityBadge used={0} total={5} />);
      expect(screen.getByText('0/5')).toBeInTheDocument();
    });

    it('shows secondary variant for normal usage', () => {
      render(<CapacityBadge used={2} total={5} />);
      expect(screen.getByText('2/5')).toBeInTheDocument();
    });

    it('shows warning variant when near full (1 slot left)', () => {
      render(<CapacityBadge used={4} total={5} />);
      expect(screen.getByText('4/5')).toBeInTheDocument();
    });

    it('shows destructive variant when fully booked', () => {
      render(<CapacityBadge used={5} total={5} />);
      expect(screen.getByText('5/5')).toBeInTheDocument();
    });

    it('shows over capacity with destructive variant', () => {
      render(<CapacityBadge used={6} total={5} />);
      expect(screen.getByText('6/5 (over)')).toBeInTheDocument();
    });
  });

  describe('with showFraction=false', () => {
    it('shows available count when no slots are used', () => {
      render(<CapacityBadge used={0} total={5} showFraction={false} />);
      expect(screen.getByText('5 available')).toBeInTheDocument();
    });

    it('shows remaining slots for normal usage', () => {
      render(<CapacityBadge used={2} total={5} showFraction={false} />);
      expect(screen.getByText('3 left')).toBeInTheDocument();
    });

    it('shows 1 left when near full', () => {
      render(<CapacityBadge used={4} total={5} showFraction={false} />);
      expect(screen.getByText('1 left')).toBeInTheDocument();
    });

    it('shows Sold out when fully booked', () => {
      render(<CapacityBadge used={5} total={5} showFraction={false} />);
      expect(screen.getByText('Sold out')).toBeInTheDocument();
    });

    it('shows Over capacity when over booked', () => {
      render(<CapacityBadge used={6} total={5} showFraction={false} />);
      expect(screen.getByText('Over capacity')).toBeInTheDocument();
    });
  });

  it('has monospace font styling', () => {
    const { container } = render(<CapacityBadge used={2} total={5} />);
    expect(container.firstChild).toHaveClass('font-mono');
  });
});
