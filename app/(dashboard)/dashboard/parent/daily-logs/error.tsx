"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-red-700">Something went wrong loading daily logs.</h2>
      <p className="text-gray-600 mt-2">{error?.message || 'Please try again.'}</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
