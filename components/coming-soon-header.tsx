"use client";

export function ComingSoonHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[var(--color-primary-bg)] border-b border-[var(--color-border)] z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center">
          {/* Logo */}
          <div className="text-2xl font-bold tracking-tight text-[var(--color-primary-text)]">KEEPERS</div>
        </div>
      </div>
    </header>
  );
}
