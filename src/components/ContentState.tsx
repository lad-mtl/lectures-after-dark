export function ContentState({
  loading,
  error,
  stale,
}: {
  loading: boolean;
  error: boolean;
  stale?: boolean;
}) {
  if (loading)
    return (
      <p className="lad-status" role="status">
        Loading the latest content…
      </p>
    );
  if (error)
    return (
      <div className="lad-status" role="alert">
        <p>Content is temporarily unavailable. Please try again.</p>
        <button
          className="lad-text-button"
          onClick={() => window.location.reload()}
        >
          Retry →
        </button>
      </div>
    );
  if (stale)
    return (
      <p className="lad-status" role="status">
        We could not refresh these listings. Showing cached content; event
        availability may have changed.
      </p>
    );
  return null;
}
