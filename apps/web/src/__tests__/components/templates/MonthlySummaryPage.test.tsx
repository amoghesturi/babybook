import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MonthlySummaryPage } from '@/components/templates/MonthlySummaryPage';

const BASE_CONTENT = {
  year_month: '2024-09',
  weight_kg: undefined as number | undefined,
  height_cm: undefined as number | undefined,
  notes: undefined as string | undefined,
  highlight_page_ids: undefined as string[] | undefined,
};

describe('MonthlySummaryPage', () => {
  it('renders the month name', () => {
    render(
      <MonthlySummaryPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />
    );
    expect(screen.getByText('September')).toBeInTheDocument();
  });

  it('renders the year', () => {
    render(
      <MonthlySummaryPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />
    );
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('shows child name and age badge', () => {
    render(
      <MonthlySummaryPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />
    );
    // Lily: DOB March 2024, month September 2024 → 6 months old
    expect(screen.getByText('Lily')).toBeInTheDocument();
    expect(screen.getByText(/6 months old/i)).toBeInTheDocument();
  });

  it('renders weight stat when provided', () => {
    const content = { ...BASE_CONTENT, weight_kg: 8.2 };
    render(
      <MonthlySummaryPage content={content} childName="Lily" childDob="2024-03-15" />
    );
    expect(screen.getByText('8.2 kg')).toBeInTheDocument();
  });

  it('renders height stat when provided', () => {
    const content = { ...BASE_CONTENT, height_cm: 68 };
    render(
      <MonthlySummaryPage content={content} childName="Lily" childDob="2024-03-15" />
    );
    expect(screen.getByText('68 cm')).toBeInTheDocument();
  });

  it('does not render stats section when both weight and height are absent', () => {
    render(
      <MonthlySummaryPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />
    );
    expect(screen.queryByText(/kg/)).toBeNull();
    expect(screen.queryByText(/cm/)).toBeNull();
  });

  it('renders notes when provided', () => {
    const content = { ...BASE_CONTENT, notes: 'Started crawling!' };
    render(
      <MonthlySummaryPage content={content} childName="Lily" childDob="2024-03-15" />
    );
    expect(screen.getByText('Started crawling!')).toBeInTheDocument();
  });

  it('shows a default placeholder when notes are absent', () => {
    render(
      <MonthlySummaryPage content={BASE_CONTENT} childName="Lily" childDob="2024-03-15" />
    );
    expect(screen.getByText(/wonderful month with Lily/i)).toBeInTheDocument();
  });

  it('shows age in years for babies over 12 months', () => {
    // DOB March 2024, month = March 2025 → 12 months → 1 year
    const content = { ...BASE_CONTENT, year_month: '2025-03' };
    render(
      <MonthlySummaryPage content={content} childName="Lily" childDob="2024-03-15" />
    );
    expect(screen.getByText(/1 year/i)).toBeInTheDocument();
  });
});
