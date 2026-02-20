import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LetterPage } from '@/components/templates/LetterPage';

const TIPTAP_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'I am so proud of you every single day.' }],
    },
  ],
};

const BASE_CONTENT = {
  author_name: 'Mum',
  content_tiptap: TIPTAP_CONTENT,
  reveal_date: undefined as string | undefined,
};

describe('LetterPage — unlocked', () => {
  it('shows "Dear [childName],"', () => {
    render(<LetterPage content={BASE_CONTENT} childName="Lily" isOwner={false} />);
    expect(screen.getByText(/Dear Lily,/i)).toBeInTheDocument();
  });

  it('renders the letter body text', () => {
    render(<LetterPage content={BASE_CONTENT} childName="Lily" isOwner={false} />);
    expect(screen.getByText(/proud of you every single day/i)).toBeInTheDocument();
  });

  it('renders the author sign-off', () => {
    render(<LetterPage content={BASE_CONTENT} childName="Lily" isOwner={false} />);
    expect(screen.getByText(/With all my love,/i)).toBeInTheDocument();
    expect(screen.getByText('Mum')).toBeInTheDocument();
  });

  it('renders the author attribution in the header', () => {
    render(<LetterPage content={BASE_CONTENT} childName="Lily" isOwner={false} />);
    expect(screen.getByText(/A letter from Mum/i)).toBeInTheDocument();
  });
});

describe('LetterPage — locked (viewer, future reveal_date)', () => {
  const futureDate = '2099-01-01';
  const lockedContent = { ...BASE_CONTENT, reveal_date: futureDate };

  it('shows the wax seal lock emoji instead of the letter body', () => {
    render(<LetterPage content={lockedContent} childName="Lily" isOwner={false} />);
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('shows the unlock date', () => {
    render(<LetterPage content={lockedContent} childName="Lily" isOwner={false} />);
    expect(screen.getByText(/January 1, 2099/i)).toBeInTheDocument();
  });

  it('does NOT render the letter body text for a viewer', () => {
    render(<LetterPage content={lockedContent} childName="Lily" isOwner={false} />);
    // The sign-off "With all my love" only appears in the open state
    expect(screen.queryByText(/With all my love/i)).toBeNull();
  });
});

describe('LetterPage — owner preview of locked letter', () => {
  const futureDate = '2099-01-01';
  const lockedContent = { ...BASE_CONTENT, reveal_date: futureDate };

  it('shows the owner preview banner', () => {
    render(<LetterPage content={lockedContent} childName="Lily" isOwner={true} />);
    expect(screen.getByText(/Locked until/i)).toBeInTheDocument();
  });

  it('shows the full letter body for the owner even when locked', () => {
    render(<LetterPage content={lockedContent} childName="Lily" isOwner={true} />);
    expect(screen.getByText(/proud of you every single day/i)).toBeInTheDocument();
  });
});

describe('LetterPage — past reveal_date (unlocked for everyone)', () => {
  const pastDate = '2000-01-01';
  const pastContent = { ...BASE_CONTENT, reveal_date: pastDate };

  it('shows the full letter for a viewer once reveal_date has passed', () => {
    render(<LetterPage content={pastContent} childName="Lily" isOwner={false} />);
    expect(screen.getByText(/proud of you every single day/i)).toBeInTheDocument();
    expect(screen.queryByText('🔒')).toBeNull();
  });
});
