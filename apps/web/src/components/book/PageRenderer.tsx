import type { BookPage } from '@babybook/shared';
import { CoverPage } from '@/components/templates/CoverPage';
import { BirthStoryPage } from '@/components/templates/BirthStoryPage';
import { MilestonePage } from '@/components/templates/MilestonePage';
import { PhotoSpreadPage } from '@/components/templates/PhotoSpreadPage';
import { JournalPage } from '@/components/templates/JournalPage';
import { LetterPage } from '@/components/templates/LetterPage';
import { MonthlySummaryPage } from '@/components/templates/MonthlySummaryPage';

interface Props {
  page: BookPage;
  childName: string;
  childDob: string;
  isOwner: boolean;
}

export function PageRenderer({ page, childName, childDob, isOwner }: Props) {
  switch (page.page_type) {
    case 'cover':
      return (
        <CoverPage
          content={page.content as Parameters<typeof CoverPage>[0]['content']}
          childName={childName}
          childDob={childDob}
        />
      );

    case 'birth_story':
      return (
        <BirthStoryPage
          content={page.content as Parameters<typeof BirthStoryPage>[0]['content']}
          childName={childName}
        />
      );

    case 'milestone':
      return (
        <MilestonePage
          content={page.content as Parameters<typeof MilestonePage>[0]['content']}
          childName={childName}
          childDob={childDob}
          pageDate={page.page_date}
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
        />
      );

    case 'letter':
      return (
        <LetterPage
          content={page.content as Parameters<typeof LetterPage>[0]['content']}
          childName={childName}
          isOwner={isOwner}
        />
      );

    case 'monthly_summary':
      return (
        <MonthlySummaryPage
          content={page.content as Parameters<typeof MonthlySummaryPage>[0]['content']}
          childName={childName}
          childDob={childDob}
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
