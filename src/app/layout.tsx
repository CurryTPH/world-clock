import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Sidebar from "./components/Sidebar";
import DarkModeToggle from "./components/DarkModeToggle";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/react-select@5.7.0/dist/react-select.min.css"
          as="style"
        />
      </head>
      <body className="bg-gray-900 text-white">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <header className="bg-gray-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
              <div>
                <h1 className="text-lg font-semibold">World Clock Application</h1>
                <p className="text-gray-400 text-sm">Manage time across different timezones</p>
              </div>
              <DarkModeToggle />
            </header>
            <div className="container mx-auto">
              {children}
            </div>
          </main>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
