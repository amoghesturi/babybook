import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookNav } from '@/components/book/BookNav';

// next/link renders a plain anchor in test environment
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const NAV = {
  prevPageId: 'prev-id',
  nextPageId: 'next-id',
  currentIndex: 2,   // 0-based → page 3
  totalPages: 10,
};

describe('BookNav', () => {
  it('shows the correct page counter text', () => {
    render(<BookNav nav={NAV} isOwner={false} onAddPage={vi.fn()} pageId="curr" />);
    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument();
  });

  it('renders dot indicators when totalPages ≤ 20', () => {
    render(<BookNav nav={NAV} isOwner={false} onAddPage={vi.fn()} pageId="curr" />);
    // 10 dots expected (one per page)
    const dots = document.querySelectorAll('.rounded-full.transition-all');
    expect(dots.length).toBe(10);
  });

  it('renders a progress bar instead of dots when totalPages > 20', () => {
    const nav = { ...NAV, totalPages: 25 };
    render(<BookNav nav={nav} isOwner={false} onAddPage={vi.fn()} pageId="curr" />);
    // No individual dots; a progress bar should be present
    expect(screen.queryAllByRole('button')).toHaveLength(0); // no owner buttons
  });

  it('hides Add Page and Manage Book buttons for viewers', () => {
    render(<BookNav nav={NAV} isOwner={false} onAddPage={vi.fn()} pageId="curr" />);
    expect(screen.queryByText(/Add Page/i)).toBeNull();
    expect(screen.queryByText(/Manage Book/i)).toBeNull();
  });

  it('shows Add Page and Manage Book buttons for owners', () => {
    render(<BookNav nav={NAV} isOwner={true} onAddPage={vi.fn()} pageId="curr" />);
    expect(screen.getByText(/Add Page/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Book/i)).toBeInTheDocument();
  });

  it('calls onAddPage when the Add Page button is clicked', () => {
    const onAddPage = vi.fn();
    render(<BookNav nav={NAV} isOwner={true} onAddPage={onAddPage} pageId="curr" />);
    fireEvent.click(screen.getByText(/Add Page/i));
    expect(onAddPage).toHaveBeenCalledOnce();
  });

  it('Manage Book links to /book/manage', () => {
    render(<BookNav nav={NAV} isOwner={true} onAddPage={vi.fn()} pageId="curr" />);
    const link = screen.getByText(/Manage Book/i).closest('a');
    expect(link).toHaveAttribute('href', '/book/manage');
  });
});
