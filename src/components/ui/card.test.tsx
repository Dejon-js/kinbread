import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card components', () => {
  describe('Card', () => {
    it('renders children', () => {
      render(<Card>Card Content</Card>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Card className="custom-card">Content</Card>);
      expect(screen.getByText('Content')).toHaveClass('custom-card');
    });

    it('has correct base styles', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('rounded-xl', 'border', 'shadow');
    });
  });

  describe('CardHeader', () => {
    it('renders children', () => {
      render(<CardHeader>Header Content</CardHeader>);
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('has flex column layout', () => {
      render(<CardHeader data-testid="header">Content</CardHeader>);
      expect(screen.getByTestId('header')).toHaveClass('flex', 'flex-col');
    });
  });

  describe('CardTitle', () => {
    it('renders children', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('has font-semibold class', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      expect(screen.getByTestId('title')).toHaveClass('font-semibold');
    });
  });

  describe('CardDescription', () => {
    it('renders children', () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('has muted text styling', () => {
      render(<CardDescription data-testid="desc">Desc</CardDescription>);
      expect(screen.getByTestId('desc')).toHaveClass('text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('renders children', () => {
      render(<CardContent>Main content</CardContent>);
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });

    it('has padding styles', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      expect(screen.getByTestId('content')).toHaveClass('p-6');
    });
  });

  describe('CardFooter', () => {
    it('renders children', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('has flex items-center layout', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      expect(screen.getByTestId('footer')).toHaveClass('flex', 'items-center');
    });
  });

  describe('Full Card composition', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test Footer')).toBeInTheDocument();
    });
  });
});
