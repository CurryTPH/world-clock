"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };
  
  return (
    <aside className="w-64 bg-gray-800 p-4 h-full shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Image src="/globe.svg" alt="World Clock Logo" width={32} height={32} />
        <h2 className="text-xl font-bold">World Clock App</h2>
      </div>
      
      <nav className="space-y-4">
        <Link 
          href="/" 
          className={`block p-2 rounded hover:bg-blue-500 transition-colors ${isActive('/') ? 'bg-blue-500' : 'bg-gray-700'}`}
          aria-current={isActive('/') ? 'page' : undefined}
        >
          World Clock
        </Link>
        <Link 
          href="/world-clock-2" 
          className={`block p-2 rounded hover:bg-blue-500 transition-colors ${isActive('/world-clock-2') ? 'bg-blue-500' : 'bg-gray-700'}`}
          aria-current={isActive('/world-clock-2') ? 'page' : undefined}
        >
          World Clock 2 (Test)
        </Link>
        <Link 
          href="/another-tab" 
          className={`block p-2 rounded hover:bg-blue-500 transition-colors ${isActive('/another-tab') ? 'bg-blue-500' : 'bg-gray-700'}`}
          aria-current={isActive('/another-tab') ? 'page' : undefined}
        >
          Another Tab (Demo)
        </Link>
        <Link 
          href="/settings" 
          className={`block p-2 rounded hover:bg-blue-500 transition-colors ${isActive('/settings') ? 'bg-blue-500' : 'bg-gray-700'}`}
          aria-current={isActive('/settings') ? 'page' : undefined}
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
