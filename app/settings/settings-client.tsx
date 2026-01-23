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
    <div className="min-h-screen" style={{ backgroundColor: "#f5f3ef" }}>
      {/* Header */}
      <div className="border-b border-gray-200" style={{ backgroundColor: "#f5f3ef" }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold" style={{ fontFamily: "serif" }}>
            Settings
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Account Information Section */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "serif" }}>
            Account Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <p className="text-gray-900">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Danger Zone Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-200">
          <h2 className="text-2xl font-bold mb-2 text-red-600" style={{ fontFamily: "serif" }}>
            Danger Zone
          </h2>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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
