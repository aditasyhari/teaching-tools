import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../atoms/Button/Button.js';

describe('Button atom', () => {
  it('renders button with children', () => {
    render(<Button>Klik Saya</Button>);
    const button = screen.getByRole('button', { name: 'Klik Saya' });
    expect(button).toBeDefined();
    expect(button.textContent).toBe('Klik Saya');
  });

  it('handles loading state with spinner and disabled state', () => {
    render(<Button isLoading>Simpan</Button>);
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('renders with custom variant and size classes', () => {
    render(
      <Button variant="danger" size="lg">
        Hapus
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Hapus' });
    expect(button.className).toContain('bg-red-600');
    expect(button.className).toContain('h-12');
  });
});
