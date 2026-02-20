import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MilestonePage } from '@/components/templates/MilestonePage';

const BASE_CONTENT = {
  milestone_name: 'First Steps',
  category: 'physical',
  achieved_at: '2024-10-01',
  notes: undefined as string | undefined,
  photo_storage_path: undefined as string | undefined,
};

describe('MilestonePage', () => {
  it('renders the milestone name', () => {
    render(
      <MilestonePage
        content={BASE_CONTENT}
        childName="Lily"
        childDob="2024-03-15"
        pageDate="2024-10-01"
      />
    );
    expect(screen.getByText('First Steps')).toBeInTheDocument();
  });

  it('renders the child name in the celebration text', () => {
    render(
      <MilestonePage
        content={BASE_CONTENT}
        childName="Lily"
        childDob="2024-03-15"
        pageDate="2024-10-01"
      />
    );
    expect(screen.getByText(/Lily did it!/i)).toBeInTheDocument();
  });

  it('renders an age badge based on DOB and achieved_at', () => {
    // Lily: 2024-03-15 → First Steps: 2024-10-01 ≈ 6-7 months
    render(
      <MilestonePage
        content={BASE_CONTENT}
        childName="Lily"
        childDob="2024-03-15"
        pageDate="2024-10-01"
      />
    );
    expect(screen.getByText(/months? old/i)).toBeInTheDocument();
  });

  it('renders notes when provided', () => {
    const content = { ...BASE_CONTENT, notes: 'She took three wobbly steps!' };
    render(
      <MilestonePage
        content={content}
        childName="Lily"
        childDob="2024-03-15"
        pageDate="2024-10-01"
      />
    );
    expect(screen.getByText(/three wobbly steps/i)).toBeInTheDocument();
  });

  it('renders a photo when photo_storage_path is set', () => {
    const content = { ...BASE_CONTENT, photo_storage_path: 'family/steps.jpg' };
    render(
      <MilestonePage
        content={content}
        childName="Lily"
        childDob="2024-03-15"
        pageDate="2024-10-01"
      />
    );
    const img = screen.getByRole('img', { name: /milestone photo/i });
    expect(img).toHaveAttribute('src', expect.stringContaining('steps.jpg'));
  });

  it('does not render photo when photo_storage_path is absent', () => {
    render(
      <MilestonePage
        content={BASE_CONTENT}
        childName="Lily"
        childDob="2024-03-15"
        pageDate="2024-10-01"
      />
    );
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows a category badge', () => {
    render(
      <MilestonePage
        content={BASE_CONTENT}
        childName="Lily"
        childDob="2024-03-15"
        pageDate="2024-10-01"
      />
    );
    // category "physical" should appear as a readable label
    expect(screen.getByText(/physical/i)).toBeInTheDocument();
  });

  it('falls back to pageDate for age when achieved_at is absent', () => {
    const content = { ...BASE_CONTENT, achieved_at: undefined as unknown as string };
    // DOB 2020-01-01, pageDate 2023-01-01 → exactly 3 years → "3 years old"
    render(
      <MilestonePage
        content={content}
        childName="Lily"
        childDob="2020-01-01"
        pageDate="2023-01-01"
      />
    );
    expect(screen.getByText(/3 years old/i)).toBeInTheDocument();
  });
});
