import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopyLinkButton } from './copy-link-button';

describe('CopyLinkButton', () => {
  beforeAll(() => {
    // Set up clipboard mock once for all tests
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it('renders the slug', () => {
    render(<CopyLinkButton slug="sweet-baker" />);
    expect(screen.getByText('/sweet-baker')).toBeInTheDocument();
  });

  it('renders as a button', () => {
    render(<CopyLinkButton slug="test-slug" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows check icon after copying (verifies clipboard interaction)', async () => {
    const user = userEvent.setup();

    const { container } = render(<CopyLinkButton slug="my-bakery" />);

    // Initially should show the Copy icon, not the Check icon
    expect(container.querySelector('.text-green-600')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    // After clicking, the check icon should appear (indicates successful copy)
    await waitFor(() => {
      const greenIcon = container.querySelector('.text-green-600');
      expect(greenIcon).toBeInTheDocument();
    });
  });

  it('has monospace font for the slug', () => {
    render(<CopyLinkButton slug="test-bakery" />);
    expect(screen.getByRole('button')).toHaveClass('font-mono');
  });

  it('displays the slug in the button', () => {
    render(<CopyLinkButton slug="my-awesome-bakery" />);
    expect(screen.getByText('/my-awesome-bakery')).toBeInTheDocument();
  });
});
