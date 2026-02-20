import type { Metadata } from 'next';
import { Playfair_Display, Inter, Caveat } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import type { ThemeId } from '@babybook/shared';
import { DEFAULT_THEME_ID } from '@babybook/shared';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwritten',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Baby Book",
  description: "A beautiful digital baby book for your family",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch theme server-side to avoid flash
  let themeId: ThemeId = DEFAULT_THEME_ID;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('No Supabase URL');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: member } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (member) {
        const { data: family } = await supabase
          .from('families')
          .select('theme_id')
          .eq('id', member.family_id)
          .single();

        if (family?.theme_id) {
          themeId = family.theme_id as ThemeId;
        }
      }
    }
  } catch {
    // Use default theme if fetch fails
  }

  return (
    <html
      lang="en"
      data-theme={themeId}
      className={`${playfairDisplay.variable} ${inter.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-text-primary">
        <ThemeProvider themeId={themeId}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
