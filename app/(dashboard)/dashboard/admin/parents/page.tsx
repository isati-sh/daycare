'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'
import { useParents, useUpdateParent, useDeactivateParent } from '@/lib/hooks/useParents'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { redirect } from 'next/navigation'
import { Edit2, Trash2, Mail } from 'lucide-react'

export default function AdminParentsPage() {
  const { profile, initialized } = useAuthStore()
  const { data: parents = [], isLoading: parentsLoading } = useParents()

  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingParentId, setEditingParentId] = useState<string | null>(null)
  const [parentForm, setParentForm] = useState({
    full_name: '',
    email: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !initialized) {
    return <div className="p-4 text-center">Loading...</div>
  }

  if (profile?.site_role !== 'admin') {
    return redirect('/access-denied')
  }

  const filteredParents = parents.filter(parent =>
    parent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditParent = async () => {
    if (!editingParentId) return

    try {
      const updateMutation = useUpdateParent(editingParentId)
      await updateMutation.mutateAsync({
        full_name: parentForm.full_name,
      })

      setShowEditForm(false)
      setEditingParentId(null)
      setParentForm({ full_name: '', email: '' })
    } catch (error) {
      console.error('Error updating parent:', error)
    }
  }

  const openEditForm = (parent: any) => {
    setEditingParentId(parent.id)
    setParentForm({
      full_name: parent.full_name || '',
      email: parent.email || '',
    })
    setShowEditForm(true)
  }

  if (parentsLoading) {
    return <div className="p-4 text-center">Loading parents...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Parents Management</h1>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search parents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParents.map((parent) => (
          <Card key={parent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{parent.full_name}</CardTitle>
              <Badge className={parent.active_status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {parent.active_status ? 'Active' : 'Inactive'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <p className="text-sm text-gray-600">{parent.email}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(parent)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const deactivateMutation = useDeactivateParent(parent.id)
                      deactivateMutation.mutate()
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredParents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No parents found.</p>
        </div>
      )}

      {showEditForm && editingParentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Parent</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={parentForm.full_name}
                  onChange={(e) =>
                    setParentForm({ ...parentForm, full_name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (read-only)</Label>
                <Input
                  id="email"
                  value={parentForm.email}
                  disabled
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleEditParent}
                className="flex-1"
              >
                Update
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditForm(false)
                  setEditingParentId(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
