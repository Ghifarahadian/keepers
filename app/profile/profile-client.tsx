"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { updateProfile } from "@/lib/auth-actions";
import type { UserProfile } from "@/types/auth";

interface ProfileClientProps {
  user: UserProfile;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    address: user.address || "",
    postalCode: user.postalCode || "",
    phoneNumber: user.phoneNumber || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      postalCode: formData.postalCode,
      phoneNumber: formData.phoneNumber,
    });

    setIsSaving(false);

    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

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
            Profile
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Profile Information Section */}
          <div className="rounded-2xl p-6 mb-6 shadow-sm" style={{
            backgroundColor: "var(--color-white)"
          }}>
            <h2 className="text-2xl font-bold mb-6" style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-text-primary)"
            }}>
              Personal Information
            </h2>

            <div className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)"
                }}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-text-secondary)",
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    cursor: "not-allowed"
                  }}
                />
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)"
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-text-primary)"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-accent)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)"}
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)"
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-text-primary)"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-accent)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)"}
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2" style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)"
                }}>
                  Address
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-text-primary)",
                    resize: "vertical"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-accent)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)"}
                />
              </div>

              {/* Postal Code and Phone Number Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium mb-2" style={{
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-sans)"
                  }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    maxLength={20}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-text-primary)"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-accent)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)"}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium mb-2" style={{
                    color: "var(--color-text-secondary)",
                    fontFamily: "var(--font-sans)"
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    maxLength={30}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      fontFamily: "var(--font-sans)",
                      color: "var(--color-text-primary)"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--color-accent)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)"}
                  />
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mt-4 p-3 rounded-lg" style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                color: "#16a34a",
                fontFamily: "var(--font-sans)"
              }}>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg" style={{
                backgroundColor: "var(--color-danger-light)",
                color: "var(--color-danger)",
                fontFamily: "var(--font-sans)"
              }}>
                {errorMessage}
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: isSaving ? "rgba(255, 111, 97, 0.5)" : "var(--color-accent)",
                  color: "var(--color-white)",
                  fontFamily: "var(--font-sans)",
                  cursor: isSaving ? "not-allowed" : "pointer"
                }}
                onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = "var(--color-accent-hover)")}
                onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = "var(--color-accent)")}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
