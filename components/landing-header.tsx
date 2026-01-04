"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AuthModal } from "./auth-modal";
import { UserMenu } from "./auth-user-menu";

interface LandingHeaderProps {
  user?: {
    firstName: string;
  } | null;
}

export function LandingHeader({ user }: LandingHeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[var(--color-primary-bg)] border-b border-[var(--color-border)] z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-2xl font-bold tracking-tight text-[var(--color-primary-text)]">KEEPERS</div>

            {/* Right side */}
            <div className="flex items-center gap-6">
              {/* Search icon */}
              <button className="hover:opacity-70 transition-opacity text-[var(--color-primary-text)]">
                <Search className="w-6 h-6" />
              </button>

              {/* Auth section */}
              {user?.firstName ? (
                <UserMenu firstName={user.firstName} />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-primary-text)] px-5 py-2 rounded-full font-medium transition-colors"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
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
