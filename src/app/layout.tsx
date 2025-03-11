import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Sidebar from "./components/Sidebar";
import { IntegrationsProvider } from './contexts/IntegrationsContext';

export const metadata = {
  title: 'World Clock Application',
  description: 'Manage time across different timezones',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/react-select@5.7.0/dist/react-select.min.css"
          as="style"
          crossOrigin="anonymous"
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/react-select@5.7.0/dist/react-select.min.css"
          crossOrigin="anonymous" 
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <IntegrationsProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <header className="bg-gray-800/80 backdrop-blur supports-[backdrop-filter]:bg-gray-800/80 p-4 flex justify-between items-center sticky top-0 z-10 shadow-lg border-b border-gray-700/50">
                <div>
                  <h1 className="text-xl font-semibold">World Clock Application</h1>
                  <p className="text-gray-400 text-sm">Manage time across different timezones</p>
                </div>
              </header>
              <div className="container mx-auto px-4 py-6">
                {children}
              </div>
            </main>
          </div>
        </IntegrationsProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}