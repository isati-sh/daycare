import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

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
        <Providers serverSession={session}>{children}</Providers>
      </body>
    </html>
  );
} 