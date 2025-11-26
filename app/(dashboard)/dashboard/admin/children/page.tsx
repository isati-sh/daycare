'use client'

import { useAuthStore } from '@/lib/auth/auth-store'
import { useChildren } from '@/lib/hooks/useChildren'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'

const getAgeGroupColor = (ageGroup: string) => {
  switch (ageGroup) {
    case 'infant': return 'bg-blue-100 text-blue-800'
    case 'toddler': return 'bg-green-100 text-green-800'
    case 'preschool': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'inactive': return 'bg-gray-100 text-gray-800'
    case 'waitlist': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function AdminChildrenPage() {
  const { profile, initialized } = useAuthStore()
  const { data: children = [], isLoading, error } = useChildren()

  if (!initialized) return <div className="p-4 text-center">Loading...</div>
  if (profile?.site_role !== 'admin') return redirect('/access-denied')
  if (isLoading) return <div className="p-4 text-center">Loading children...</div>
  if (error) return <div className="p-4 text-center text-red-600">Error loading children</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Children ({children.length})</h1>

      {children.length === 0 ? (
        <p className="text-center text-gray-500">No children found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {child.first_name} {child.last_name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Age: {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getAgeGroupColor(child.age_group)}>
                      {child.age_group}
                    </Badge>
                    <Badge className={getStatusColor(child.status)}>
                      {child.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Parent:</span> {child.parent_email || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Teacher:</span> {child.teacher_name || 'Not assigned'}
                </div>
                {child.allergies && child.allergies.length > 0 && (
                  <div>
                    <span className="font-semibold">Allergies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(Array.isArray(child.allergies) ? child.allergies : []).map(
                        (allergy: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {allergy}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
