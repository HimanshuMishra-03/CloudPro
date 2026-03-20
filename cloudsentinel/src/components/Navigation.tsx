"use client";

import Link from "next/link";
import { Shield, Bell, Settings, User, Search } from "lucide-react";

export default function Navigation() {
  return (
    <header className="px-6 lg:px-12 h-16 flex items-center border-b border-gray-100 dark:border-gray-900/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <Link className="flex items-center justify-center gap-2 group" href="/dashboard">
        <div className="bg-blue-600 p-1 rounded-md group-hover:bg-blue-700 transition-colors">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight dark:text-white">CloudSentinel</span>
      </Link>
      
      <nav className="ml-10 hidden md:flex gap-8">
        <Link 
          href="/dashboard" 
          className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Overview
        </Link>
        <Link 
          href="/dashboard/import" 
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          Infrastructure
        </Link>
        <Link 
          href="#" 
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          Policies
        </Link>
        <Link 
          href="#" 
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          Chaos Logs
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-blue-600 rounded-full border-2 border-white dark:border-gray-950" />
        </button>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 border border-white dark:border-gray-800 shadow-sm cursor-pointer hover:opacity-80 transition-opacity" />
      </div>
    </header>
  );
}
