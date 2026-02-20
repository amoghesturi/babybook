import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PhotoSpreadPage } from '@/components/templates/PhotoSpreadPage';

const PHOTO = {
  storage_path: 'family/a.jpg',
  public_url: 'http://localhost:54321/storage/v1/object/public/media/family/a.jpg',
  caption: 'Park day',
};

describe('PhotoSpreadPage — single layout', () => {
  it('renders the photo using public_url', () => {
    render(
      <PhotoSpreadPage
        content={{ layout: 'single', photos: [PHOTO] }}
        childName="Lily"
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', PHOTO.public_url);
  });

  it('falls back to storage_path when public_url is missing', () => {
    const photo = { storage_path: 'family/b.jpg', caption: undefined };
    render(
      <PhotoSpreadPage
        content={{ layout: 'single', photos: [photo] }}
        childName="Lily"
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'family/b.jpg');
  });

  it('renders the caption overlay when a caption is present', () => {
    render(
      <PhotoSpreadPage
        content={{ layout: 'single', photos: [PHOTO] }}
        childName="Lily"
      />
    );
    expect(screen.getByText('Park day')).toBeInTheDocument();
  });

  it('does not render caption text when caption is absent', () => {
    const photo = { storage_path: 'family/b.jpg', public_url: 'http://x/b.jpg' };
    render(
      <PhotoSpreadPage
        content={{ layout: 'single', photos: [photo] }}
        childName="Lily"
      />
    );
    expect(screen.queryByText('Park day')).toBeNull();
  });
});

describe('PhotoSpreadPage — grid layout', () => {
  const photos = [
    { ...PHOTO, caption: 'First' },
    { ...PHOTO, public_url: 'http://localhost/b.jpg', caption: 'Second' },
  ];

  it('renders all photos in the grid', () => {
    render(
      <PhotoSpreadPage
        content={{ layout: 'grid', photos }}
        childName="Lily"
      />
    );
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('renders captions for each photo', () => {
    render(
      <PhotoSpreadPage
        content={{ layout: 'grid', photos }}
        childName="Lily"
      />
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});

describe('PhotoSpreadPage — polaroid layout', () => {
  it('renders a polaroid card for each photo', () => {
    const photos = [PHOTO, { ...PHOTO, public_url: 'http://localhost/c.jpg', caption: 'Zoo' }];
    render(
      <PhotoSpreadPage
        content={{ layout: 'polaroid', photos }}
        childName="Lily"
      />
    );
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('shows childName placeholder when no caption', () => {
    const photo = { storage_path: 'family/d.jpg', public_url: 'http://localhost/d.jpg' };
    render(
      <PhotoSpreadPage
        content={{ layout: 'polaroid', photos: [photo] }}
        childName="Lily"
      />
    );
    expect(screen.getByText(/Lily/)).toBeInTheDocument();
  });
});
