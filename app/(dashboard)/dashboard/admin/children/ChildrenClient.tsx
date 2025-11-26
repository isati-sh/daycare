'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addChild, updateChild, deleteChild, assignTeacher, updateStatus } from './actions'

interface Teacher { id: string; full_name: string; email: string }
interface ChildListItem {
  id: string
  first_name: string
  last_name: string
  age_group: string
  parent_name: string | null
  parent_email: string
  teacher_name: string | null
  enrollment_date: string
  status: string
  allergies: string[] | null
}

interface Props {
  page: number
  pageSize: number
  total: number
  children: ChildListItem[]
  teachers: Teacher[]
  error: string | null
  initialQuery?: string
  initialAge?: string
  initialStatus?: string
}

export default function ChildrenClient({ page, pageSize, total, children, teachers, error, initialQuery = '', initialAge = '', initialStatus = '' }: Props) {
  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [ageFilter, setAgeFilter] = useState(initialAge)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<ChildListItem | null>(null)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    age_group: 'toddler',
    parent_name: '',
    parent_email: '',
    teacher_id: '',
    allergies: '',
    medical_notes: '',
    emergency_contact: '',
    status: 'active'
  })
  const [message, setMessage] = useState<string | null>(null)

  const totalPages = Math.ceil(total / pageSize)

  const applySearchFilter = (list: ChildListItem[]) => {
    return list.filter(c => {
      const q = searchTerm.trim().toLowerCase()
      if (q) {
        const matches = (
          c.first_name.toLowerCase().includes(q) ||
          c.last_name.toLowerCase().includes(q) ||
          (c.parent_name && c.parent_name.toLowerCase().includes(q)) ||
          (c.teacher_name && c.teacher_name.toLowerCase().includes(q))
        )
        if (!matches) return false
      }
      if (ageFilter && c.age_group !== ageFilter) return false
      if (statusFilter && c.status !== statusFilter) return false
      return true
    })
  }

  const visibleChildren = applySearchFilter(children)

  const resetForm = () => {
    setForm({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      age_group: 'toddler',
      parent_name: '',
      parent_email: '',
      teacher_id: '',
      allergies: '',
      medical_notes: '',
      emergency_contact: '',
      status: 'active'
    })
    setEditing(null)
  }

  const submitAdd = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await addChild({
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        age_group: form.age_group as any,
        parent_name: form.parent_name || undefined,
        parent_email: form.parent_email || undefined,
        teacher_id: form.teacher_id || null,
        allergies: form.allergies,
        medical_notes: form.medical_notes,
        emergency_contact: form.emergency_contact,
        status: form.status as any
      })
      if (res.error) setMessage(res.error)
      else {
        setMessage('Child added')
        resetForm()
        setShowAdd(false)
      }
    })
  }

  const submitEdit = () => {
    if (!editing) return
    setMessage(null)
    startTransition(async () => {
      const res = await updateChild(editing.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        age_group: form.age_group as any,
        teacher_id: form.teacher_id || null,
        allergies: form.allergies,
        medical_notes: form.medical_notes,
        emergency_contact: form.emergency_contact,
        status: form.status as any
      })
      if (res.error) setMessage(res.error)
      else {
        setMessage('Child updated')
        resetForm()
      }
    })
  }

  const beginEdit = (c: ChildListItem) => {
    setEditing(c)
    setForm({
      first_name: c.first_name,
      last_name: c.last_name,
      date_of_birth: '',
      age_group: c.age_group,
      parent_name: c.parent_name || '',
      parent_email: c.parent_email,
      teacher_id: teachers.find(t => t.full_name === c.teacher_name)?.id || '',
      allergies: c.allergies?.join(', ') || '',
      medical_notes: '',
      emergency_contact: '',
      status: c.status
    })
  }

  const removeChild = (id: string) => {
    if (!confirm('Delete child?')) return
    setMessage(null)
    startTransition(async () => {
      const res = await deleteChild(id)
      if (res.error) setMessage(res.error)
      else setMessage('Child deleted')
    })
  }

  const reassignTeacher = (childId: string, teacherId: string) => {
    setMessage(null)
    startTransition(async () => {
      const res = await assignTeacher(childId, teacherId || null)
      if (res.error) setMessage(res.error)
      else setMessage('Teacher updated')
    })
  }

  const changeStatus = (childId: string, status: string) => {
    setMessage(null)
    startTransition(async () => {
      const res = await updateStatus(childId, status as any)
      if (res.error) setMessage(res.error)
      else setMessage('Status updated')
    })
  }

  const ageBadge = (age: string) => {
    switch (age) {
      case 'infant': return 'bg-blue-100 text-blue-800'
      case 'toddler': return 'bg-green-100 text-green-800'
      case 'preschool': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  const statusBadge = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'waitlist': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Children</h1>
        <Button onClick={() => setShowAdd(true)}>Add Child</Button>
      </div>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      {message && <div className="mb-4 text-green-600 text-sm">{message}</div>}

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="px-3 py-2 border rounded-md">
          <option value="">All Ages</option>
          <option value="infant">Infant</option>
          <option value="toddler">Toddler</option>
          <option value="preschool">Preschool</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="waitlist">Waitlist</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleChildren.map(c => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{c.first_name} {c.last_name}</CardTitle>
                  <p className="text-gray-600 text-sm">Enrolled {new Date(c.enrollment_date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={ageBadge(c.age_group)}>{c.age_group}</Badge>
                  <Badge className={statusBadge(c.status)}>{c.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <Label className="font-semibold">Parent</Label>
                  <p>{c.parent_name || 'Unknown'}</p>
                  <p className="text-gray-500 text-xs">{c.parent_email}</p>
                </div>
                <div>
                  <Label className="font-semibold">Teacher</Label>
                  <select
                    value={teachers.find(t => t.full_name === c.teacher_name)?.id || ''}
                    onChange={e => reassignTeacher(c.id, e.target.value)}
                    className="mt-1 w-full border rounded px-2 py-1 text-xs"
                  >
                    <option value="">Not assigned</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
                {c.allergies && c.allergies.length > 0 && (
                  <div>
                    <Label className="font-semibold">Allergies</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.allergies.map((a,i) => <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>)}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => beginEdit(c)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => changeStatus(c.id, c.status === 'active' ? 'inactive' : 'active')}>{c.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
                  <Button variant="outline" size="sm" onClick={() => removeChild(c.id)}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleChildren.length === 0 && (
        <div className="text-center py-12 text-gray-500">No children match criteria.</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pg = i + 1
            const active = pg === page
            return (
              <a
                key={pg}
                href={`?page=${pg}${ageFilter ? `&age=${ageFilter}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`}
                className={`px-3 py-1 border rounded text-sm ${active ? 'bg-gray-800 text-white' : 'bg-white'}`}
              >
                {pg}
              </a>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-md w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Child</h2>
            <div className="space-y-3">
              <Input placeholder="First name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              <Input placeholder="Last name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              <Input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
              <select value={form.age_group} onChange={e => setForm({ ...form, age_group: e.target.value })} className="w-full border rounded px-2 py-2">
                <option value="infant">Infant</option>
                <option value="toddler">Toddler</option>
                <option value="preschool">Preschool</option>
              </select>
              <Input placeholder="Parent name" value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} />
              <Input placeholder="Parent email" type="email" value={form.parent_email} onChange={e => setForm({ ...form, parent_email: e.target.value })} />
              <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })} className="w-full border rounded px-2 py-2">
                <option value="">No teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
              <Input placeholder="Allergies (comma separated)" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
              <Textarea placeholder="Medical notes" value={form.medical_notes} onChange={e => setForm({ ...form, medical_notes: e.target.value })} />
              <Input placeholder="Emergency contact" value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border rounded px-2 py-2">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="waitlist">Waitlist</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={submitAdd} disabled={pending}>Add</Button>
              <Button variant="outline" onClick={() => { setShowAdd(false); resetForm() }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-md w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Child</h2>
            <div className="space-y-3">
              <Input placeholder="First name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              <Input placeholder="Last name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              <Input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
              <select value={form.age_group} onChange={e => setForm({ ...form, age_group: e.target.value })} className="w-full border rounded px-2 py-2">
                <option value="infant">Infant</option>
                <option value="toddler">Toddler</option>
                <option value="preschool">Preschool</option>
              </select>
              <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })} className="w-full border rounded px-2 py-2">
                <option value="">No teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
              <Input placeholder="Allergies (comma separated)" value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} />
              <Textarea placeholder="Medical notes" value={form.medical_notes} onChange={e => setForm({ ...form, medical_notes: e.target.value })} />
              <Input placeholder="Emergency contact" value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border rounded px-2 py-2">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="waitlist">Waitlist</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={submitEdit} disabled={pending}>Save</Button>
              <Button variant="outline" onClick={() => { setEditing(null); resetForm() }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
