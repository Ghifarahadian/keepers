export default function PreviewLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-bg)' }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-secondary)] border-t-[var(--color-accent)]"></div>
        <p className="mt-4 font-medium" style={{ color: 'var(--color-primary-text)' }}>Loading preview...</p>
      </div>
    </div>
  )
}
