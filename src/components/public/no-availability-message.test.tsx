import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoAvailabilityMessage } from './no-availability-message';

describe('NoAvailabilityMessage', () => {
  it('renders default "no-dates" message', () => {
    render(<NoAvailabilityMessage />);
    expect(screen.getByText('No availability posted')).toBeInTheDocument();
    expect(screen.getByText('Check back later for available dates.')).toBeInTheDocument();
  });

  it('renders "no-dates" message explicitly', () => {
    render(<NoAvailabilityMessage type="no-dates" />);
    expect(screen.getByText('No availability posted')).toBeInTheDocument();
    expect(screen.getByText('Check back later for available dates.')).toBeInTheDocument();
  });

  it('renders "all-sold-out" message', () => {
    render(<NoAvailabilityMessage type="all-sold-out" />);
    expect(screen.getByText('All dates are sold out')).toBeInTheDocument();
    expect(screen.getByText('Check back later for new availability.')).toBeInTheDocument();
  });

  it('renders "no-upcoming" message', () => {
    render(<NoAvailabilityMessage type="no-upcoming" />);
    expect(screen.getByText('No upcoming availability')).toBeInTheDocument();
    expect(screen.getByText('Check back later for new dates.')).toBeInTheDocument();
  });

  it('renders a calendar icon', () => {
    const { container } = render(<NoAvailabilityMessage />);
    // lucide-react renders SVG icons
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('has centered text styling', () => {
    const { container } = render(<NoAvailabilityMessage />);
    expect(container.firstChild).toHaveClass('text-center');
  });
});
