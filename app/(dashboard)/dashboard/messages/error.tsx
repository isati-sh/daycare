'use client'

export default function MessagesError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Messages Error</h2>
        <p className="text-sm text-gray-700 mb-4">{error.message}</p>
        <p className="text-sm text-gray-600">Please reload the page or try again later.</p>
        <a href="/dashboard/messages" className="mt-4 inline-block text-blue-600 hover:underline">
          Return to Messages
        </a>
      </div>
    </div>
  )
}
