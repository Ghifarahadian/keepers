export default function ProfileLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f3ef" }}>
      {/* Header Skeleton */}
      <div className="border-b border-gray-200" style={{ backgroundColor: "#f5f3ef" }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="h-6 w-16 bg-gray-300 rounded mb-4 animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Form Skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-8 w-64 bg-gray-300 rounded mb-6 animate-pulse"></div>

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* First Name Field */}
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-10 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Last Name Field */}
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-10 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Address Field */}
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-24 w-full bg-gray-300 rounded animate-pulse"></div>
            </div>

            {/* Postal Code and Phone Number Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-10 w-full bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-28 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-10 w-full bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Save Button Skeleton */}
          <div className="mt-6">
            <div className="h-11 w-40 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
