"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, CircleDollarSign, Target, CalendarCheck } from 'lucide-react';
import logo from '../assets/logo.svg';
import Image from 'next/image';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard',   path: '/dashboard',   icon: <LayoutDashboard size={20} /> },
  { name: 'Leads',       path: '/leads',       icon: <Target size={20} />          },
  { name: 'Actividades', path: '/actividades', icon: <CalendarCheck size={20} />   },
  { name: 'Vendedores',  path: '/vendedores',  icon: <Users size={20} />           },
  { name: 'Calendario',  path: '/calendario',  icon: <Calendar size={20} />        },
  { name: 'Ventas',      path: '/ventas',      icon: <CircleDollarSign size={20} /> },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-gray-100 dark:bg-mouse-gray-dark border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="flex items-center space-x-2 px-4 m-3">
          <div className="w-8 h-8  rounded-lg flex">
            <Image src={logo} alt="Icono" width={32} height={32} />
          </div>
          <span className="text-2xl font-extrabold tracking-tighter dark:text-white">SIMPLICITY</span>
        </div>
      
      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path} 
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              pathname === item.path 
                ? 'bg-white dark:bg-mouse-gray text-neon-green-light shadow-sm' 
                : 'text-slate-500 hover:bg-gray-200 dark:hover:bg-mouse-gray/50'
            }`}
          >
            <span className={pathname === item.path ? 'text-neon-green-light' : ''}>
              {item.icon}
            </span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
      
      {/* ... footer ... */}
    </aside>
  );
};

export default Sidebar;