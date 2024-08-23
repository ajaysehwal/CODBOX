"use client";
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useAuth } from "@/context";
import { User, LogOut } from 'lucide-react';

export const Account = () => {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none group">
        <div className="relative rounded-full overflow-hidden border-2 border-transparent group-hover:border-blue-400 transition-all duration-300 ease-in-out transform group-hover:scale-105 group-focus:ring-2 group-focus:ring-blue-400 group-focus:ring-opacity-50">
          <Image
            src={user?.photoURL as string}
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <DropdownMenuItem className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-150 ease-in-out">
          <User className="mr-2 h-4 w-4" />
          <span>Account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2 border-gray-200 dark:border-gray-700" />
        <DropdownMenuItem 
          onClick={() => logout()}
          className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-150 ease-in-out"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};