'use client';

// Imports using the new aliases defined in tsconfig.json
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext"; 
import { ThemeProvider } from "next-themes";
import React from "react";

// Initialize QueryClient outside the component for stability
const queryClient = new QueryClient();

// This component wraps the entire application in the necessary contexts and providers.
// It uses 'use client' and must be rendered inside the Next.js RootLayout.
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* NOTE: BrowserRouter and Routes from the original App.tsx are REMOVED. 
          Next.js App Router handles routing based on file structure.
        */}
        <AuthProvider>
          {children}
          <Toaster />
          <Sonner />
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default AppProviders;