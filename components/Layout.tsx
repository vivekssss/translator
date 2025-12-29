
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigateHome }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-[#282e39] bg-surface-light/80 dark:bg-[#101622]/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-3xl">language</span>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">TranslateNow</h2>
          </div>
          <div className="flex items-center gap-6">
            <button className="hidden md:flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#282e39] text-slate-600 dark:text-[#9da6b9] transition-colors">
              <span className="material-symbols-outlined">help</span>
            </button>
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-[#282e39] text-slate-600 dark:text-[#9da6b9] transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="relative group cursor-pointer">
              <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-transparent group-hover:border-primary transition-all shadow-sm" style={{ backgroundImage: 'url("https://picsum.photos/seed/user123/100/100")' }}></div>
              <div className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-white dark:border-[#101622]"></div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="w-full py-6 mt-8 border-t border-gray-200 dark:border-[#282e39] bg-surface-light dark:bg-[#101622]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-[#9da6b9]">
          <p>© 2024 TranslateNow. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
