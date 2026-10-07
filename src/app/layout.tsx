import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Health Buddy — AI Pre-Consultation Assistant',
  description:
    'An accessible pre-consultation assistant that listens to patients, asks simple follow-up questions, and prepares a clear summary for doctors.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-teal-500 selection:text-slate-950">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-teal-600 focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
