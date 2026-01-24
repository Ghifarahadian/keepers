"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { validateEmail, validatePassword } from "@/lib/validation";
import type { AuthModalProps, AuthView } from "@/types/auth";
import { signIn, signUp } from "@/lib/auth-actions";

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!validateEmail(formData.email)) {
        throw new Error("Invalid email address");
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors[0]);
      }

      if (!formData.firstName || !formData.lastName) {
        throw new Error("First and last name are required");
      }

      // Register user with Supabase
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Check if email confirmation is required
      if (result.needsEmailConfirmation) {
        setRegisteredEmail(formData.email);
        setVerificationPending(true);
      } else {
        // User is automatically signed in after signup
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        throw new Error("Invalid email or password");
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Verification Pending View */}
        {verificationPending ? (
          <div className="text-center py-8">
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Check Your Email</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Thank you for registering! We've sent a verification link to{" "}
              <span className="font-semibold text-gray-900">{registeredEmail}</span>.
            </p>
            <p className="text-gray-600 text-sm mb-8">
              Please click the link in the email to verify your account and complete your
              registration.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-3 rounded-lg font-medium transition-colors"
            >
              Got It
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <h2 className="text-3xl font-bold mb-6 text-center">
              {view === "login" ? "Welcome Back" : "Create Account"}
            </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={view === "login" ? handleEmailLogin : handleEmailSignup}>
          {view === "signup" && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                required
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
            required
          />

          {view === "login" && (
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[var(--color-accent)] border-gray-300 rounded focus:ring-[var(--color-accent)]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : view === "login"
              ? "Sign In"
              : "Sign Up"}
          </button>
        </form>

            {/* Toggle view */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {view === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setView("signup")}
                    className="text-[var(--color-accent)] hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => setView("login")}
                    className="text-[var(--color-accent)] hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
