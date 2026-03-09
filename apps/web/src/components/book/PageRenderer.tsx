import type { BookPage, CoverVariant, BirthStoryVariant, MilestoneVariant, JournalVariant, LetterVariant, MonthlySummaryVariant, SectionTitleVariant, SectionTitleContent } from '@babybook/shared';
import { CoverPage } from '@/components/templates/CoverPage';
import { BirthStoryPage } from '@/components/templates/BirthStoryPage';
import { MilestonePage } from '@/components/templates/MilestonePage';
import { PhotoSpreadPage } from '@/components/templates/PhotoSpreadPage';
import { JournalPage } from '@/components/templates/JournalPage';
import { LetterPage } from '@/components/templates/LetterPage';
import { MonthlySummaryPage } from '@/components/templates/MonthlySummaryPage';
import { SectionTitlePage } from '@/components/templates/SectionTitlePage';

interface Props {
  page: BookPage;
  childName: string;
  childDob: string;
  isOwner: boolean;
}

export function PageRenderer({ page, childName, childDob, isOwner }: Props) {
  const variant = page.template_variant ?? 'classic';

  switch (page.page_type) {
    case 'cover':
      return (
        <CoverPage
          content={page.content as Parameters<typeof CoverPage>[0]['content']}
          childName={childName}
          childDob={childDob}
          variant={variant as CoverVariant}
        />
      );

    case 'birth_story':
      return (
        <BirthStoryPage
          content={page.content as Parameters<typeof BirthStoryPage>[0]['content']}
          childName={childName}
          variant={variant as BirthStoryVariant}
        />
      );

    case 'milestone':
      return (
        <MilestonePage
          content={page.content as Parameters<typeof MilestonePage>[0]['content']}
          childName={childName}
          childDob={childDob}
          pageDate={page.page_date}
          variant={variant as MilestoneVariant}
        />
      );

    case 'photo_spread':
      return (
        <PhotoSpreadPage
          content={page.content as Parameters<typeof PhotoSpreadPage>[0]['content']}
          childName={childName}
        />
      );

    case 'journal':
      return (
        <JournalPage
          content={page.content as Parameters<typeof JournalPage>[0]['content']}
          pageDate={page.page_date}
          variant={variant as JournalVariant}
        />
      );

    case 'letter':
      return (
        <LetterPage
          content={page.content as Parameters<typeof LetterPage>[0]['content']}
          childName={childName}
          isOwner={isOwner}
          variant={variant as LetterVariant}
        />
      );

    case 'monthly_summary':
      return (
        <MonthlySummaryPage
          content={page.content as Parameters<typeof MonthlySummaryPage>[0]['content']}
          childName={childName}
          childDob={childDob}
          variant={variant as MonthlySummaryVariant}
        />
      );

    case 'section_title':
      return (
        <SectionTitlePage
          content={page.content as SectionTitleContent}
          variant={(page.template_variant as SectionTitleVariant) ?? 'default'}
        />
      );

    default:
      return (
        <div className="flex items-center justify-center h-full text-text-secondary p-8">
          <p>Unknown page type</p>
        </div>
      );
  }
}
