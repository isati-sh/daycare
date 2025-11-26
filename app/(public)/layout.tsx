import Navigation from '@/components/layout/navigation'

// Public layout - includes top navigation
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}

