'use client'

export default function ChildrenError({ error }: { error: Error }) {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Children Management Error</h2>
      <p className="text-sm text-red-600 mb-4">{error.message}</p>
      <p className="text-sm text-gray-600">Please try reloading the page. If the problem persists, contact support.</p>
    </div>
  )
}
