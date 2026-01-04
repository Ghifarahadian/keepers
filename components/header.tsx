"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AuthModal } from "./auth-modal";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  variant?: "default" | "coming-soon";
  user?: {
    firstName: string;
  } | null;
}

export function Header({ variant = "default", user }: HeaderProps) {
  const isComingSoon = variant === "coming-soon";
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#f5f3ef] border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div
            className={`flex items-center ${
              isComingSoon ? "justify-center" : "justify-between"
            }`}
          >
            {/* Logo */}
            <div className="text-2xl font-bold tracking-tight">KEEPERS</div>

            {/* Right side - only show in default mode */}
            {!isComingSoon && (
              <div className="flex items-center gap-6">
                {/* Search icon - always visible */}
                <button className="hover:opacity-70 transition-opacity">
                  <Search className="w-6 h-6" />
                </button>

                {/* Auth section */}
                {user?.firstName ? (
                  <UserMenu firstName={user.firstName} />
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-[#d4786c] hover:bg-[#c26b5f] text-white px-5 py-2 rounded-full font-medium transition-colors"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
