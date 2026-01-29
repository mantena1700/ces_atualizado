import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';

import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PCCS NextGen',
  description: 'Sistema de Cargos e Salários Avançado',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} h-screen bg-background text-foreground flex overflow-hidden`}>
        <aside className="hidden md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
