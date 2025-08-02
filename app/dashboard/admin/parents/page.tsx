'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  Baby
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Parent {
  id: string
  email: string
  full_name: string
  phone: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  children_count: number
  active_status: boolean
  last_login: string | null
}

export default function AdminParentsPage() {
  const { user, client, isAdmin } = useSupabase()
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Dummy data for testing
  const dummyParents: Parent[] = [
    {
      id: '1',
      email: 'parent1@example.com',
      full_name: 'John Smith',
      phone: '+1 (555) 111-2222',
      address: '123 Parent St, City, State',
      emergency_contact: '+1 (555) 999-8888',
      created_at: '2024-01-10',
      children_count: 2,
      active_status: true,
      last_login: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      email: 'parent2@example.com',
      full_name: 'Maria Garcia',
      phone: '+1 (555) 222-3333',
      address: '456 Family Ave, City, State',
      emergency_contact: '+1 (555) 888-7777',
      created_at: '2024-02-05',
      children_count: 1,
      active_status: true,
      last_login: '2024-03-14T15:45:00Z'
    },
    {
      id: '3',
      email: 'parent3@example.com',
      full_name: 'David Wilson',
      phone: '+1 (555) 333-4444',
      address: '789 Home Rd, City, State',
      emergency_contact: '+1 (555) 777-6666',
      created_at: '2024-01-25',
      children_count: 3,
      active_status: false,
      last_login: '2024-03-10T09:15:00Z'
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setParents(dummyParents)
    setLoading(false)
  }, [])

  const filteredParents = parents.filter(parent =>
    parent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusChange = async (parentId: string, newStatus: boolean) => {
    try {
      // Update parent status in database
      const { error } = await client
        .from('profiles')
        .update({ active_status: newStatus })
        .eq('id', parentId)

      if (error) {
        toast.error('Failed to update parent status')
        return
      }

      // Update local state
      setParents(prev => prev.map(parent => 
        parent.id === parentId 
          ? { ...parent, active_status: newStatus }
          : parent
      ))

      toast.success(`Parent ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update parent status')
    }
  }

  const handleDeleteParent = async (parentId: string, parentName: string) => {
    if (!confirm(`Are you sure you want to delete ${parentName}?`)) {
      return
    }

    try {
      // Delete parent from database
      const { error } = await client
        .from('profiles')
        .delete()
        .eq('id', parentId)

      if (error) {
        toast.error('Failed to delete parent')
        return
      }

      // Update local state
      setParents(prev => prev.filter(parent => parent.id !== parentId))
      toast.success('Parent deleted successfully')
    } catch (error) {
      toast.error('Failed to delete parent')
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Parent Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage parents and their children
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Parents</p>
                  <p className="text-2xl font-bold">{parents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Parents</p>
                  <p className="text-2xl font-bold">{parents.filter(p => p.active_status).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Baby className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Children</p>
                  <p className="text-2xl font-bold">
                    {parents.reduce((sum, p) => sum + p.children_count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Children/Parent</p>
                  <p className="text-2xl font-bold">
                    {parents.length > 0 
                      ? (parents.reduce((sum, p) => sum + p.children_count, 0) / parents.length).toFixed(1)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search parents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button asChild>
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Parent
            </div>
          </Button>
        </div>

        {/* Parents List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading parents...</p>
            </div>
          ) : filteredParents.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No parents found</p>
            </div>
          ) : (
            filteredParents.map((parent) => (
              <Card key={parent.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{parent.full_name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {parent.email}
                      </CardDescription>
                    </div>
                    <Badge variant={parent.active_status ? "default" : "secondary"}>
                      {parent.active_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{parent.phone || 'No phone'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Baby className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{parent.children_count} children enrolled</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Joined: {new Date(parent.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {parent.last_login && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Last login: {new Date(parent.last_login).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(parent.id, !parent.active_status)}
                    >
                      {parent.active_status ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* Edit parent */}}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteParent(parent.id, parent.full_name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 