import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JournalPage } from '@/components/templates/JournalPage';

const TIPTAP = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'We had such a fun day.' }] },
  ],
};

const BASE_CONTENT = {
  title: 'Day at the park',
  content_tiptap: TIPTAP,
  mood: undefined as string | undefined,
  tags: undefined as string[] | undefined,
  header_photo_storage_path: undefined as string | undefined,
};

describe('JournalPage', () => {
  it('renders the journal title', () => {
    render(<JournalPage content={BASE_CONTENT} pageDate="2024-06-15" />);
    expect(screen.getByText('Day at the park')).toBeInTheDocument();
  });

  it('renders the page date parts in the date box', () => {
    render(<JournalPage content={BASE_CONTENT} pageDate="2024-06-15" />);
    // Date box shows day, month abbreviation, year in separate spans
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('JUN')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    // Weekday appears separately
    expect(screen.getByText('Saturday')).toBeInTheDocument();
  });

  it('renders the Tiptap body text', () => {
    render(<JournalPage content={BASE_CONTENT} pageDate="2024-06-15" />);
    expect(screen.getByText('We had such a fun day.')).toBeInTheDocument();
  });

  it('renders a mood emoji when mood is set', () => {
    const content = { ...BASE_CONTENT, mood: 'happy' };
    render(<JournalPage content={content} pageDate="2024-06-15" />);
    // "happy" maps to 😊
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('does not render a mood emoji when mood is absent', () => {
    render(<JournalPage content={BASE_CONTENT} pageDate="2024-06-15" />);
    expect(screen.queryByText('😊')).toBeNull();
  });

  it('renders tags as chips', () => {
    const content = { ...BASE_CONTENT, tags: ['family', 'outdoor'] };
    render(<JournalPage content={content} pageDate="2024-06-15" />);
    expect(screen.getByText('#family')).toBeInTheDocument();
    expect(screen.getByText('#outdoor')).toBeInTheDocument();
  });

  it('renders a header photo when provided', () => {
    const content = { ...BASE_CONTENT, header_photo_storage_path: 'family/park.jpg' };
    render(<JournalPage content={content} pageDate="2024-06-15" />);
    const img = screen.getByRole('img', { name: /journal header/i });
    expect(img).toHaveAttribute('src', expect.stringContaining('park.jpg'));
  });

  it('does not render an img when no header photo', () => {
    render(<JournalPage content={BASE_CONTENT} pageDate="2024-06-15" />);
    expect(screen.queryByRole('img')).toBeNull();
  });
});
