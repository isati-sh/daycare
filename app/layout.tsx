import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SupabaseProvider } from '@/components/providers/supabase-provider'
import Navigation from '@/components/layout/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Little Learners Daycare - Nurturing Young Minds',
  description: 'A safe, nurturing environment where children learn, grow, and thrive. Quality childcare for ages 6 weeks to 5 years.',
  keywords: 'daycare, childcare, preschool, early education, kids, learning',
  authors: [{ name: 'Little Learners Daycare' }],
  creator: 'Little Learners Daycare',
  publisher: 'Little Learners Daycare',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Little Learners Daycare - Nurturing Young Minds',
    description: 'A safe, nurturing environment where children learn, grow, and thrive.',
    url: '/',
    siteName: 'Little Learners Daycare',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Little Learners Daycare',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Little Learners Daycare - Nurturing Young Minds',
    description: 'A safe, nurturing environment where children learn, grow, and thrive.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider serverSession={session}>
            <Navigation />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 