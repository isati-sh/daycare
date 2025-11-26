"use client";

import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

interface ProvidersProps {
  children: ReactNode;
  serverSession: Session | null;
}

// Provider chain: Theme → Supabase → Auth → React Query → Children + Toasts
export function Providers({ children, serverSession }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider serverSession={serverSession}>
        <AuthProvider>
          <ReactQueryProvider>
            {children}
            <ToasterProvider />
          </ReactQueryProvider>
        </AuthProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}

