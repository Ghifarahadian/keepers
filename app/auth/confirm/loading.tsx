export default function ConfirmLoading() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-accent)] mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold mb-4">Verifying Your Email</h1>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}
