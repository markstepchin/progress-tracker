import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "~/trpc/react";
import { Navigation } from "~/components/Navigation";

export const metadata: Metadata = {
  title: "Progress Tracker",
  description: "Track your fitness progress with photos",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-zinc-50 font-sans antialiased">
        <NuqsAdapter>
          <TRPCReactProvider>
            <Navigation />
            <main className="mx-auto min-h-screen max-w-2xl px-4 pt-6 pb-8">
              {children}
            </main>
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
