import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../organisms/Sidebar/Sidebar.js';

describe('Sidebar organism', () => {
  const mockBrand = {
    name: 'WaliKelas',
    subtitle: 'Teaching Tools',
    href: '/teacher',
    badge: 'v1.0',
  };

  const mockItems = [
    {
      label: 'Dasbor',
      href: '/teacher',
      icon: <span data-testid="icon-dashboard">icon</span>,
      active: true,
    },
    {
      label: 'Perkakas Mengajar',
      href: '/teacher/tools',
      icon: <span data-testid="icon-tools">icon</span>,
      badge: '13',
    },
  ];

  it('renders brand name, subtitle, and badge in warm variant', () => {
    render(<Sidebar brand={mockBrand} items={mockItems} />);

    expect(screen.getByText('WaliKelas')).toBeDefined();
    expect(screen.getByText('Teaching Tools')).toBeDefined();
    expect(screen.getByText('v1.0')).toBeDefined();
  });

  it('renders navigation items with correct active state and badge', () => {
    render(<Sidebar brand={mockBrand} items={mockItems} />);

    const dashboardLink = screen.getByText('Dasbor').closest('a');
    expect(dashboardLink).toBeDefined();
    expect(dashboardLink?.getAttribute('aria-current')).toBe('page');

    const badge = screen.getByText('13');
    expect(badge).toBeDefined();
  });

  it('supports sections grouping', () => {
    const sections = [
      {
        title: 'Menu Utama',
        items: [mockItems[0]!],
      },
      {
        title: 'Perkakas',
        items: [mockItems[1]!],
      },
    ];

    render(<Sidebar brand={mockBrand} sections={sections} />);

    expect(screen.getByText('Menu Utama')).toBeDefined();
    expect(screen.getByText('Perkakas')).toBeDefined();
    expect(screen.getByText('Dasbor')).toBeDefined();
    expect(screen.getByText('Perkakas Mengajar')).toBeDefined();
  });

  it('renders footer when provided', () => {
    render(
      <Sidebar
        brand={mockBrand}
        items={mockItems}
        footer={<div data-testid="test-footer">Footer Content</div>}
      />,
    );

    expect(screen.getByTestId('test-footer')).toBeDefined();
    expect(screen.getByText('Footer Content')).toBeDefined();
  });

  it('supports custom renderLink function', () => {
    const renderLink = vi.fn(
      ({
        href,
        className,
        children,
        'aria-current': ariaCurrent,
      }: {
        href: string;
        className: string;
        children: React.ReactNode;
        'aria-current'?: 'page';
      }) => (
        <span data-testid="custom-link" data-href={href} aria-current={ariaCurrent} className={className}>
          {children}
        </span>
      ),
    );

    render(<Sidebar brand={mockBrand} items={mockItems} renderLink={renderLink} />);

    const customLinks = screen.getAllByTestId('custom-link');
    // 1 brand link + 2 item links = 3
    expect(customLinks.length).toBe(3);
    expect(renderLink).toHaveBeenCalledTimes(3);
  });
});
