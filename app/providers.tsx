"use client";

import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

interface ProvidersProps {
  children: ReactNode;
  serverSession: Session | null;
}

// Minimal providers - just theme, auth, and toasts
// Navigation and MainContent are handled by route group layouts
export function Providers({ children, serverSession }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider serverSession={serverSession}>
        {children}
        <ToasterProvider />
      </SupabaseProvider>
    </ThemeProvider>
  );
}
