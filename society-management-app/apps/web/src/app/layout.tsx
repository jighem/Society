import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Co-op Society Workspace',
  description: 'Housing society billing, management, and tracking portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-[#070b13] text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
