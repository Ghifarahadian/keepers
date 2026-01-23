"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Check if already verified (came from /auth/callback)
        const verified = searchParams.get("verified");
        if (verified === "true") {
          setStatus("success");
          setTimeout(() => {
            router.push("/");
          }, 3000);
          return;
        }

        // Handle token_hash verification (direct link from email)
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (!token_hash || type !== "email") {
          setStatus("error");
          setErrorMessage("Invalid confirmation link");
          return;
        }

        const supabase = createClient();

        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        });

        if (error) {
          setStatus("error");
          setErrorMessage(error.message);
          return;
        }

        setStatus("success");

        // Redirect to home page after 3 seconds
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setErrorMessage("An unexpected error occurred");
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
        {status === "loading" && (
          <div>
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-accent)] mx-auto"></div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Verifying Your Email</h1>
            <p className="text-gray-600">Please wait while we confirm your email address...</p>
          </div>
        )}

        {status === "success" && (
          <div>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Email Verified!</h1>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Your email has been successfully verified. Welcome to KEEPERS!
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the home page...
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="mb-6">
              <svg
                className="w-20 h-20 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">Verification Failed</h1>
            <p className="text-gray-700 mb-6 leading-relaxed">
              {errorMessage || "We couldn't verify your email address. The link may have expired or is invalid."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-3 rounded-lg font-medium transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
