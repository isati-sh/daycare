export default function QuickActions() {
  const actions = [
    { label: 'Add Teacher', href: '/dashboard/admin/teachers' },
    { label: 'Add Child', href: '/dashboard/admin/children' },
    { label: 'Send Announcement', href: '/dashboard/admin/announcements' },
    { label: 'Generate Daily Report', href: '/dashboard/admin/reports' },
  ]
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium mb-2">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <a key={a.label} href={a.href} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">
            + {a.label}
          </a>
        ))}
      </div>
    </div>
  )
}
