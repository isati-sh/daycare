'use client';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Admin Dashboard Error</h2>
        <p className="text-sm text-gray-600 mb-4">An unexpected error occurred while loading admin data.</p>
        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-xs text-red-700 font-mono break-all">{error.message}</p>
          </div>
        )}
        <button
          onClick={reset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
