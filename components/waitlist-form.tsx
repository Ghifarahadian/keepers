"use client"

import { useState } from "react"
import { validateEmail } from "@/lib/validation"
import { joinWaitlist } from "@/lib/waitlist-actions"
import { ChevronUp } from "lucide-react"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Client-side validation
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address")
      }

      // Server action
      const result = await joinWaitlist({ email })

      if (result.error) {
        throw new Error(result.error)
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="waitlist"
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#f5f3ef]"
    >
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {!success ? (
          <>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 leading-tight">
              Get notified when
              <br />
              we&apos;re launching
            </h2>

            <p className="text-lg md:text-xl text-gray-700 font-light">
              Be Part of the Excitement: Receive Exclusive
              <br />
              Launch Updates and Notifications
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8"
            >
              <input
                type="email"
                placeholder="Email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-96 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 px-6 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d4786c] font-serif"
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#d4786c] text-white px-8 py-3 rounded-full font-medium hover:bg-[#c26b5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? "Joining..." : "Notify me"}
              </button>
            </form>

            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900">
              Thank you for joining!
            </h2>
            <p className="text-xl text-gray-700 font-light">
              We&apos;ll notify you as soon as we launch.
              <br />
              Get ready for something special.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="inline-flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors pt-8"
            >
              <ChevronUp className="w-6 h-6" />
              <p className="text-sm tracking-wide">Back to top</p>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
