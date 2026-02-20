import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoverPage } from '@/components/templates/CoverPage';

const BASE_CONTENT = {
  book_title: "Lily's Baby Book",
  subtitle: undefined as string | undefined,
  cover_photo_storage_path: undefined as string | undefined,
};

describe('CoverPage', () => {
  it('renders the book title', () => {
    render(<CoverPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />);
    expect(screen.getByText("Lily's Baby Book")).toBeInTheDocument();
  });

  it('renders the child date of birth', () => {
    render(<CoverPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />);
    // formatDate uses en-US locale: "March 15, 2024"
    expect(screen.getByText(/March 15, 2024/i)).toBeInTheDocument();
  });

  it('renders an optional subtitle', () => {
    const content = { ...BASE_CONTENT, subtitle: 'A year of firsts' };
    render(<CoverPage content={content} childName="Lily" childDob="2024-03-15" />);
    expect(screen.getByText('A year of firsts')).toBeInTheDocument();
  });

  it('does not render subtitle when omitted', () => {
    render(<CoverPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />);
    expect(screen.queryByText('A year of firsts')).toBeNull();
  });

  it('renders a background photo when cover_photo_storage_path is set', () => {
    const content = { ...BASE_CONTENT, cover_photo_storage_path: 'family/cover.jpg' };
    render(<CoverPage content={content} childName="Lily" childDob="2024-03-15" />);
    const img = screen.getByRole('img', { name: /cover/i });
    expect(img).toBeInTheDocument();
    // storageUrl should have turned the path into a full URL
    expect(img).toHaveAttribute('src', expect.stringContaining('cover.jpg'));
  });

  it('does not render an img element when no cover photo', () => {
    render(<CoverPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />);
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('skips the date when childDob is empty', () => {
    render(<CoverPage content={BASE_CONTENT} childName="Lily" childDob="" />);
    // "March" should not appear
    expect(screen.queryByText(/march/i)).toBeNull();
  });
});
