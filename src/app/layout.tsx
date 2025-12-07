import type { Metadata } from "next";
import { Inter, DotGothic16 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import SessionProvider from "@/components/SessionProvider";
import { AISettingsProvider } from "@/contexts/AISettingsContext";
import { GamificationProvider } from "@/contexts/GamificationContext";

const inter = Inter({ subsets: ["latin"] });
const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dotgothic",
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Personal Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${dotGothic.variable}`}>
        <SessionProvider>
          <ThemeProvider>
            <AISettingsProvider>
              <GamificationProvider>
                {children}
              </GamificationProvider>
            </AISettingsProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

