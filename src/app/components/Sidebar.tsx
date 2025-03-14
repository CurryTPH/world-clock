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
    <aside className="w-64 bg-gray-850 border-r border-gray-700/50 flex flex-col">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <Image src="/globe.svg" alt="World Clock Logo" width={32} height={32} className="w-8 h-8" />
          <h2 className="text-lg font-semibold text-white">World Clock</h2>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          href="/" 
          className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
            isActive('/') 
              ? 'bg-primary-600 text-white' 
              : 'text-gray-300 hover:bg-gray-750 hover:text-white'
          }`}
          aria-current={isActive('/') ? 'page' : undefined}
        >
          World Clock
        </Link>
        <Link 
          href="/guides" 
          className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
            isActive('/guides') 
              ? 'bg-primary-600 text-white' 
              : 'text-gray-300 hover:bg-gray-750 hover:text-white'
          }`}
          aria-current={isActive('/guides') ? 'page' : undefined}
        >
          Guides
        </Link>
        <Link 
          href="/settings" 
          className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
            isActive('/settings') 
              ? 'bg-primary-600 text-white' 
              : 'text-gray-300 hover:bg-gray-750 hover:text-white'
          }`}
          aria-current={isActive('/settings') ? 'page' : undefined}
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;