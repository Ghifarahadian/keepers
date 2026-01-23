export default function SettingsLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f3ef" }}>
      {/* Header Skeleton */}
      <div className="border-b border-gray-200" style={{ backgroundColor: "#f5f3ef" }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="h-6 w-16 bg-gray-300 rounded mb-4 animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Account Information Skeleton */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="h-8 w-64 bg-gray-300 rounded mb-4 animate-pulse"></div>
          <div className="space-y-4">
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-6 w-64 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Danger Zone Skeleton */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200">
          <div className="h-8 w-40 bg-gray-300 rounded mb-2 animate-pulse"></div>
          <div className="h-5 w-96 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-11 w-40 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
