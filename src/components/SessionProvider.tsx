"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
    // Check if NextAuth is properly configured
    // If not, just render children without session wrapper
    try {
        return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
    } catch {
        return <>{children}</>;
    }
}
