
// lib/auth/access-control.ts

export type SiteRole = 'admin' | 'teacher' | 'parent'

// Define which roles can access which base paths
const roleAccessMap: Record<SiteRole, string[]> = {
  admin: ['/dashboard/admin', '/dashboard/teacher', '/dashboard/parent', '/dashboard/messages', '/dashboard/enroll'],
  teacher: ['/dashboard/teacher', '/dashboard/messages'],
  parent: ['/dashboard/parent', '/dashboard/messages', '/dashboard/enroll'],
}

/**
 * Determines if a role is allowed to access a given path.
 */
export function isAllowed(role: SiteRole, path: string | undefined | null): boolean {
  // Admin can access everything
  if (role === 'admin') return true

  if (typeof path !== 'string') return false

  // Check against allowed prefixes
  const allowedPaths = roleAccessMap[role] || []
  return allowedPaths.some((allowed) => typeof allowed === 'string' && path.startsWith(allowed))
}
