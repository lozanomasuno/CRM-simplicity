"use client";
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../providers/ThemeProvider';
import { Moon, Sun } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-mouse-gray-dark transition-colors duration-300">
   
    <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center py-4 px-8 bg-white dark:bg-mouse-gray border-b dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Detalles del mes</h2>
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="p-2 rounded-full bg-neon-green-light/10 text-neon-green-light hover:bg-neon-green-light/20 transition-all"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <section className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {children}
        </section>
        
      </main>
    </div>
  );
};

export default DashboardLayout;