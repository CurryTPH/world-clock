import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Sidebar from "./components/Sidebar";
import { AuthProvider } from './auth/AuthContext';
import UserMenu from "./components/UserMenu";
import { ViewProvider } from './contexts/ViewContext';
import { DashboardProvider } from './contexts/DashboardContext';

export const metadata = {
  title: 'World Clock Application',
  description: 'Manage time across different timezones',
};

// Use Geist fonts
const fontClass = `${GeistSans.variable} ${GeistMono.variable} font-sans`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClass} suppressHydrationWarning>
      <head>
        {/* Ensure no duplicate scripts */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-gray-900 text-gray-100">
        {/* Wrap all providers in a single component tree */}
        <AuthProvider>
          <ViewProvider>
            <DashboardProvider>
              <div className="flex w-full h-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto relative">
                  <div className="absolute top-4 right-4 z-10">
                    <UserMenu />
                  </div>
                  {children}
                  <SpeedInsights />
                </main>
              </div>
            </DashboardProvider>
          </ViewProvider>
        </AuthProvider>
      </body>
    </html>
  );
}