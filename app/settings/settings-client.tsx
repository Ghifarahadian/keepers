"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";

interface SettingsClientProps {
  user: {
    id: string;
    email: string | undefined;
    firstName: string;
    lastName: string;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-cream-bg)" }}>
      {/* Header */}
      <div className="border-b" style={{
        backgroundColor: "var(--color-cream-bg)",
        borderColor: "rgba(0, 0, 0, 0.1)"
      }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 transition-colors mb-4"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold" style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-text-primary)"
          }}>
            Settings
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Account Information Section */}
        <div className="rounded-2xl p-6 mb-6 shadow-sm" style={{
          backgroundColor: "var(--color-white)"
        }}>
          <h2 className="text-2xl font-bold mb-4" style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-text-primary)"
          }}>
            Account Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)"
              }}>
                Name
              </label>
              <p style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-serif)"
              }}>
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-sans)"
              }}>
                Email
              </label>
              <p style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-serif)"
              }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="rounded-2xl p-6 shadow-sm border-2" style={{
          backgroundColor: "var(--color-white)",
          borderColor: "var(--color-danger-border)"
        }}>
          <h2 className="text-2xl font-bold mb-2" style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-danger)"
          }}>
            Danger Zone
          </h2>
          <p className="mb-4" style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)"
          }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: "var(--color-danger)",
              color: "var(--color-white)",
              fontFamily: "var(--font-sans)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-danger-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--color-danger)"}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
