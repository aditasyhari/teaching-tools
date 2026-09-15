import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../atoms/Card/Card.js';
import { Badge } from '../atoms/Badge/Badge.js';
import { Button } from '../atoms/Button/Button.js';
import { Tabs, TabsList, TabsTrigger } from '../atoms/Tabs/Tabs.js';

describe('Shared UI Primitives', () => {
  describe('Card primitive', () => {
    it('renders card with header, title, description and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Kartu Belajar</CardTitle>
            <CardDescription>Deskripsi aktivitas belajar</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Konten aktivitas</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Mulai</Button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText('Kartu Belajar')).toBeDefined();
      expect(screen.getByText('Deskripsi aktivitas belajar')).toBeDefined();
      expect(screen.getByText('Konten aktivitas')).toBeDefined();
      expect(screen.getByRole('button', { name: 'Mulai' })).toBeDefined();
    });
  });

  describe('Badge CVA variants', () => {
    it('renders secondary and warning variants', () => {
      render(
        <>
          <Badge variant="secondary">Sekunder</Badge>
          <Badge variant="warning">Peringatan</Badge>
        </>,
      );

      expect(screen.getByText('Sekunder')).toBeDefined();
      expect(screen.getByText('Peringatan')).toBeDefined();
    });
  });

  describe('Button CVA enhancements', () => {
    it('renders with size="icon" and accessible label', () => {
      render(
        <Button size="icon" aria-label="Pengaturan">
          <span>⚙</span>
        </Button>,
      );

      const btn = screen.getByRole('button', { name: 'Pengaturan' });
      expect(btn).toBeDefined();
      expect(btn.className).toContain('h-10');
      expect(btn.className).toContain('w-10');
    });

    it('renders polymorphic asChild when requested', () => {
      render(
        <Button asChild variant="outline">
          <a href="/teacher">Tautan Guru</a>
        </Button>,
      );

      const link = screen.getByRole('link', { name: 'Tautan Guru' });
      expect(link).toBeDefined();
      expect(link.getAttribute('href')).toBe('/teacher');
    });
  });

  describe('Tabs primitive', () => {
    it('renders tabs list with triggers', () => {
      render(
        <Tabs defaultValue="tab-1">
          <TabsList>
            <TabsTrigger value="tab-1">Umum</TabsTrigger>
            <TabsTrigger value="tab-2">Lanjutan</TabsTrigger>
          </TabsList>
        </Tabs>,
      );

      expect(screen.getByRole('tab', { name: 'Umum' })).toBeDefined();
      expect(screen.getByRole('tab', { name: 'Lanjutan' })).toBeDefined();
    });
  });
});

