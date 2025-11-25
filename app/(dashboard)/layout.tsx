'use client';

import Navigation from '@/components/layout/navigation';
import MainContent from '@/components/layout/main-content';

// Dashboard layout - includes Navigation and MainContent
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <MainContent>{children}</MainContent>
    </>
  );
}

