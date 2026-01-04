"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-actions";

interface UserMenuProps {
  firstName: string;
}

export function UserMenu({ firstName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
      >
        <span className="font-medium">{firstName}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={() => {
              // Navigate to profile
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => {
              // Navigate to settings
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
