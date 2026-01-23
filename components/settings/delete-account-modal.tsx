"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { deleteAccount } from "@/lib/auth-actions";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      setLoading(true);
      setError(null);

      const result = await deleteAccount();

      if (result?.error) {
        throw new Error(result.error);
      }

      // User will be redirected automatically by the server action
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    }}>
      <div className="rounded-2xl p-8 max-w-md w-full mx-4" style={{
        backgroundColor: "var(--color-modal-bg)"
      }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
              backgroundColor: "var(--color-danger-light)"
            }}>
              <AlertTriangle className="w-6 h-6" style={{ color: "var(--color-danger)" }} />
            </div>
            <h2 className="text-2xl font-bold" style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-serif)"
            }}>
              Delete Account
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="transition-colors disabled:opacity-50"
            style={{ color: "var(--color-text-muted)" }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.color = "var(--color-text-secondary)")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Warning Message */}
        <div className="mb-6">
          <p className="mb-4" style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)"
          }}>
            This action is <strong>permanent and cannot be undone</strong>. Deleting your account will:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4" style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)"
          }}>
            <li>Permanently delete all your projects and pages</li>
            <li>Remove all uploaded photos from storage</li>
            <li>Delete your profile and account information</li>
            <li>Sign you out immediately</li>
          </ul>
        </div>

        {/* Confirmation Input */}
        <div className="mb-6">
          <label htmlFor="confirm-delete" className="block text-sm font-medium mb-2" style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-sans)"
          }}>
            Type <span className="font-bold">DELETE</span> to confirm:
          </label>
          <input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={loading}
            placeholder="Type DELETE here"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: "var(--color-text-muted)",
              fontFamily: "var(--font-sans)",
              backgroundColor: "var(--color-white)"
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "none";
              e.currentTarget.style.borderColor = "var(--color-danger)";
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--color-danger-light)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--color-text-muted)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 border rounded-lg" style={{
            backgroundColor: "var(--color-danger-light)",
            borderColor: "var(--color-danger-border)"
          }}>
            <p className="text-sm" style={{
              color: "var(--color-danger)",
              fontFamily: "var(--font-sans)"
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            style={{
              borderColor: "var(--color-text-muted)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
              backgroundColor: "transparent"
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "var(--color-cream-bg)")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            style={{
              backgroundColor: "var(--color-danger)",
              color: "var(--color-white)",
              fontFamily: "var(--font-sans)"
            }}
            onMouseEnter={(e) => !loading && !(!isConfirmed) && (e.currentTarget.style.backgroundColor = "var(--color-danger-hover)")}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "var(--color-danger)")}
          >
            {loading ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
