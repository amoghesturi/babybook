import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BirthStoryPage } from '@/components/templates/BirthStoryPage';

const BASE_CONTENT = {
  date_of_birth: '2024-03-15',
  weight_kg: 3.5,
  height_cm: 51,
  time_of_birth: undefined as string | undefined,
  hospital: undefined as string | undefined,
  story_text: undefined as string | undefined,
  photo_storage_path: undefined as string | undefined,
};

describe('BirthStoryPage', () => {
  it('renders "The arrival of" header and the child name', () => {
    render(<BirthStoryPage content={BASE_CONTENT} childName="Lily" />);
    expect(screen.getByText(/The arrival of/i)).toBeInTheDocument();
    expect(screen.getByText('Lily')).toBeInTheDocument();
  });

  it('renders the date of birth', () => {
    render(<BirthStoryPage content={BASE_CONTENT} childName="Lily" />);
    expect(screen.getByText(/March 15, 2024/i)).toBeInTheDocument();
  });

  it('renders weight and height stats', () => {
    render(<BirthStoryPage content={BASE_CONTENT} childName="Lily" />);
    expect(screen.getByText('3.50 kg')).toBeInTheDocument();
    expect(screen.getByText('51 cm')).toBeInTheDocument();
  });

  it('renders "Home" as the born-at location when hospital is omitted', () => {
    render(<BirthStoryPage content={BASE_CONTENT} childName="Lily" />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders the hospital name when provided', () => {
    const content = { ...BASE_CONTENT, hospital: 'City Medical Center' };
    render(<BirthStoryPage content={content} childName="Lily" />);
    expect(screen.getByText('City Medical Center')).toBeInTheDocument();
  });

  it('renders time of birth when provided (formatted as 12h)', () => {
    const content = { ...BASE_CONTENT, time_of_birth: '14:32' };
    render(<BirthStoryPage content={content} childName="Lily" />);
    // formatTime converts 14:32 → "2:32 PM"
    expect(screen.getByText(/2:32 PM/)).toBeInTheDocument();
  });

  it('renders story text when provided', () => {
    const content = { ...BASE_CONTENT, story_text: 'She arrived on a sunny afternoon.' };
    render(<BirthStoryPage content={content} childName="Lily" />);
    expect(screen.getByText('She arrived on a sunny afternoon.')).toBeInTheDocument();
  });

  it('renders a placeholder when no story and no photo', () => {
    render(<BirthStoryPage content={BASE_CONTENT} childName="Lily" />);
    expect(screen.getByText(/story.*just beginning/i)).toBeInTheDocument();
  });

  it('renders a photo when photo_storage_path is provided', () => {
    const content = { ...BASE_CONTENT, photo_storage_path: 'family/newborn.jpg' };
    render(<BirthStoryPage content={content} childName="Lily" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', expect.stringContaining('newborn.jpg'));
  });
});
