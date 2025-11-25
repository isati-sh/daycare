'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText,
  Baby,
  Calendar,
  Clock,
  Utensils,
  Coffee,
  Bed,
  Activity,
  Heart,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Filter,
  X
} from 'lucide-react'
import { Database } from '@/types/database'
import RoleGuard from '@/components/guards/roleGuard'
import toast from 'react-hot-toast'

type ActivityWithImage = {
  name: string
  imageUrl?: string
}

type Child = Database['public']['Tables']['children']['Row']
type DailyLog = Omit<Database['public']['Tables']['daily_logs']['Row'], 'activities'> & {
  activities?: (string | ActivityWithImage)[]
}

export default function TeacherDailyLogsPage() {
  const { user, client } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [activityImages, setActivityImages] = useState<{ [logId: string]: string[] }>({})

  const fetchData = useCallback(async () => {
    if (!user || !client) return

    try {
      setLoading(true)

      // Fetch assigned children
      const { data: childrenData, error: childrenError } = await client
        .from('children')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('status', 'active')

      if (childrenError) throw childrenError
      setChildren(childrenData || [])

      // Fetch daily logs for selected date
      const { data: logsData, error: logsError } = await client
        .from('daily_logs')
        .select(`
          *,
          child:children!daily_logs_child_id_fkey(first_name, last_name)
        `)
        .eq('teacher_id', user.id)
        .eq('date', selectedDate)
        .order('created_at', { ascending: false })

      if (logsError) throw logsError
      setDailyLogs(logsData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load daily logs')
    } finally {
      setLoading(false)
    }
  }, [user, client, selectedDate])

  useEffect(() => {
    if (user && client) {
      fetchData()
    }
  }, [user, client, selectedDate, fetchData])

  const filteredLogs = dailyLogs.filter(log => 
    selectedChild === 'all' || log.child_id === selectedChild
  )

  const createNewLog = async (childId: string) => {
    if (!user || !client) return

    try {
      const { error } = await client
        .from('daily_logs')
        .insert({
          child_id: childId,
          teacher_id: user.id,
          date: selectedDate,
          meals: [],
          drinks: [],
          naps: {
            morning_start: null,
            morning_end: null,
            afternoon_start: null,
            afternoon_end: null
          },
          activities: [],
          mood: 'neutral',
          bathroom_visits: 0
        })

      if (error) throw error
      
      toast.success('Daily log created successfully')
      fetchData()
    } catch (error) {
      console.error('Error creating daily log:', error)
      toast.error('Failed to create daily log')
    }
  }

  const deleteLog = async (logId: string) => {
    if (!user || !client) return
    if (!confirm('Are you sure you want to delete this daily log?')) return

    try {
      const { error } = await client
        .from('daily_logs')
        .delete()
        .eq('id', logId)

      if (error) throw error
      
      toast.success('Daily log deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting daily log:', error)
      toast.error('Failed to delete daily log')
    }
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊'
      case 'sad': return '😢'
      case 'tired': return '😴'
      case 'energetic': return '⚡'
      case 'fussy': return '😤'
      case 'excited': return '🤩'
      default: return '😐'
    }
  }

  const getChildWithoutLog = () => {
    return children.filter(child => 
      !dailyLogs.some(log => log.child_id === child.id)
    )
  }

  const editLog = async (log: DailyLog) => {
    const child = children.find(c => c.id === log.child_id)
    if (!child) return

    // Transform activities to array of ActivityWithImage
    let activities: (string | ActivityWithImage)[] = []
    if (Array.isArray(log.activities)) {
      activities = log.activities.map((a: any) =>
        typeof a === 'string' ? a : { name: a?.name || '', imageUrl: a?.imageUrl }
      )
    }
    setEditingLog({ ...log, activities })
    setEditingChild(child)
    setShowEditForm(true)
  }

  const updateDailyLog = async (logData: Partial<DailyLog>, logId?: string) => {
    if (!user || !client || !logId) return

    try {
      // Transform activities back to string array
      const activities = logData.activities?.map(activity => 
        typeof activity === 'string' ? activity : activity
      ) || []

      const dbLogData = {
        meals: logData.meals || [],
        drinks: logData.drinks || [],
        naps: logData.naps || {
          morning_start: null,
          morning_end: null,
          afternoon_start: null,
          afternoon_end: null
        },
        activities,
        notes: logData.notes || null,
        mood: logData.mood || 'neutral',
        behavior: logData.behavior || null,
        sickness: logData.sickness || null,
        medications: logData.medications || null,
        bathroom_visits: logData.bathroom_visits || 0,
        diaper_changes: logData.diaper_changes || null,
        photos: logData.photos || null
      }

      const { error } = await client
        .from('daily_logs')
        .update(dbLogData)
        .eq('id', logId)

      if (error) throw error

      toast.success('Daily log updated successfully')
      setShowEditForm(false)
      setEditingLog(null)
      setEditingChild(null)
      fetchData()
    } catch (error) {
      console.error('Error updating daily log:', error)
      toast.error('Failed to update daily log')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading daily logs...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard path="/dashboard/teacher/daily-logs">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Logs</h1>
            <p className="text-gray-600">Record and manage daily activities for your children</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-48"
            >
              <option value="all">All Children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.first_name} {child.last_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Actions for Missing Logs */}
        {getChildWithoutLog().length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Missing Daily Logs
              </CardTitle>
              <CardDescription className="text-orange-700">
                These children don't have daily logs for {new Date(selectedDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {getChildWithoutLog().map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="font-medium">{child.first_name} {child.last_name}</span>
                    <Button size="sm" onClick={() => createNewLog(child.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create Log
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Logs */}
        <div className="space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Baby className="h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-lg">
                          {log.child?.first_name} {log.child?.last_name}
                        </CardTitle>
                        <CardDescription>
                          {new Date(log.date).toLocaleDateString()} • Last updated: {new Date(log.updated_at).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <span className="text-lg">{getMoodIcon(log.mood)}</span>
                        <span className="capitalize">{log.mood}</span>
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => editLog(log)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteLog(log.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Meals */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Utensils className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-sm">Meals ({log.meals?.length || 0})</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.meals?.slice(0, 2).map((meal, index) => (
                          <div key={index}>
                            {meal.type}: {meal.food}
                          </div>
                        ))}
                        {(log.meals?.length || 0) > 2 && (
                          <div className="text-xs text-gray-500">+{(log.meals?.length || 0) - 2} more</div>
                        )}
                      </div>
                    </div>

                    {/* Drinks */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Coffee className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">Drinks ({log.drinks?.length || 0})</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.drinks?.slice(0, 2).map((drink, index) => (
                          <div key={index}>
                            {drink.quantity} {drink.unit} {drink.type}
                          </div>
                        ))}
                        {(log.drinks?.length || 0) > 2 && (
                          <div className="text-xs text-gray-500">+{(log.drinks?.length || 0) - 2} more</div>
                        )}
                      </div>
                    </div>

                    {/* Naps */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Bed className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-sm">Naps</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.naps?.morning_start && (
                          <div>Morning: {log.naps.morning_start} - {log.naps.morning_end}</div>
                        )}
                        {log.naps?.afternoon_start && (
                          <div>Afternoon: {log.naps.afternoon_start} - {log.naps.afternoon_end}</div>
                        )}
                        {!log.naps?.morning_start && !log.naps?.afternoon_start && (
                          <div className="text-gray-400">No naps recorded</div>
                        )}
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">Activities ({log.activities?.length || 0})</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.activities?.slice(0, 2).map((activity, index) => (
                          <div key={index}>
                            {typeof activity === 'string' ? activity : activity.name}
                          </div>
                        ))}
                        {(log.activities?.length || 0) > 2 && (
                          <div className="text-xs text-gray-500">+{(log.activities?.length || 0) - 2} more</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-sm">
                      <span className="font-medium">Bathroom visits:</span> {Array.isArray(log.bathroom_visits) ? log.bathroom_visits.length : (log.bathroom_visits || 0)}
                    </div>
                    {log.diaper_changes && (
                      <div className="text-sm">
                        <span className="font-medium">Diaper changes:</span> {log.diaper_changes}
                      </div>
                    )}
                    {log.behavior && (
                      <div className="text-sm">
                        <span className="font-medium">Behavior:</span> 
                        <Badge variant="outline" className="ml-1 capitalize">{log.behavior}</Badge>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {log.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm">
                        <span className="font-medium">Notes:</span>
                        <p className="mt-1 text-gray-600">{log.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Photos */}
                  {log.photos && log.photos.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm mb-2">
                        <span className="font-medium">Photos ({log.photos.length})</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {log.photos.slice(0, 4).map((photo, index) => (
                          <img 
                            key={index} 
                            src={photo} 
                            alt="Daily log" 
                            className="w-full h-16 object-cover rounded"
                          />
                        ))}
                        {log.photos.length > 4 && (
                          <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                            +{log.photos.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Daily Logs</h3>
                <p className="text-gray-500">
                  No daily logs found for {new Date(selectedDate).toLocaleDateString()}
                </p>
                <div className="mt-4 space-x-2">
                  {children.map((child) => (
                    <Button 
                      key={child.id}
                      size="sm" 
                      onClick={() => createNewLog(child.id)}
                      className="mb-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Log for {child.first_name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Form Modal */}
        {showEditForm && editingChild && editingLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    Edit Daily Log - {editingChild.first_name} {editingChild.last_name}
                  </h2>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingLog(null)
                      setEditingChild(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <EditDailyLogForm
                  child={editingChild}
                  log={editingLog}
                  onSubmit={updateDailyLog}
                  onClose={() => {
                    setShowEditForm(false)
                    setEditingLog(null)
                    setEditingChild(null)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}

// EditDailyLogForm with activity photo upload (copied from dashboard UI)
function EditDailyLogForm({
  child,
  log,
  onSubmit,
  onClose
}: {
  child: Child
  log: DailyLog
  onSubmit: (data: Partial<DailyLog>, logId: string) => void
  onClose: () => void
}) {
  const { client } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    meals: log.meals || [],
    drinks: log.drinks || [],
    naps: log.naps || {
      morning_start: null,
      morning_end: null,
      afternoon_start: null,
      afternoon_end: null
    },
    activities: Array.isArray(log.activities)
      ? log.activities.map((a: any) =>
          typeof a === 'string' ? { name: a, imageUrl: '' } : { name: a?.name || '', imageUrl: a?.imageUrl || '' }
        )
      : [],
    notes: log.notes || '',
    mood: log.mood,
    behavior: log.behavior,
    sickness: log.sickness || '',
    medications: log.medications || '',
    bathroom_visits: Array.isArray(log.bathroom_visits) ? log.bathroom_visits : [],
    diaper_changes: log.diaper_changes || null,
    photos: log.photos || []
  })
  const [newActivity, setNewActivity] = useState('')
  const fileInputs = useRef<(HTMLInputElement | null)[]>([])

  const addMeal = () => {
    setFormData(prev => ({
      ...prev,
      meals: [...prev.meals, {
        type: 'breakfast',
        food: '',
        quantity: '',
        unit: 'oz',
        time: new Date().toTimeString().slice(0, 5)
      }]
    }))
  }

  const updateMeal = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const meals = [...prev.meals]
      // @ts-ignore
      meals[index][field] = value
      return { ...prev, meals }
    })
  }

  const removeMeal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index)
    }))
  }

  const addDrink = () => {
    setFormData((prev) => ({
      ...prev,
      drinks: [
        ...prev.drinks,
        {
          type: '',
          quantity: '',
          unit: 'oz',
          time: new Date().toISOString().slice(11, 16) // Current time in HH:MM format
        },
      ],
    }));
  }

  const updateDrink = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const drinks = [...prev.drinks]
      // @ts-ignore
      drinks[index][field] = value
      return { ...prev, drinks }
    })
  }

  const removeDrink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      drinks: prev.drinks.filter((_, i) => i !== index)
    }))
  }

  const addActivity = () => {
    if (newActivity.trim()) {
      setFormData(prev => ({
        ...prev,
        activities: [...prev.activities, { name: newActivity.trim(), imageUrl: '' }]
      }))
      setNewActivity('')
    }
  }

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }))
  }

  const updateActivityName = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((a, i) =>
        i === index ? { ...a, name: value } : a
      )
    }))
  }

  const uploadActivityImage = async (index: number, file: File) => {
    if (!client) return
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${child.id}/activity_${index}_${Date.now()}.${fileExt}`
      const { error } = await client.storage
        .from('daily-photos')
        .upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = client.storage
        .from('daily-photos')
        .getPublicUrl(fileName)
      setFormData(prev => ({
        ...prev,
        activities: prev.activities.map((a, i) =>
          i === index ? { ...a, imageUrl: publicUrl } : a
        )
      }))
    } catch (e) {
      toast.error('Failed to upload activity image')
    } finally {
      setUploading(false)
    }
  }

  const handleActivityImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadActivityImage(index, file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(
        {
          ...formData,
          activities: formData.activities.map(a => a.imageUrl ? { name: a.name, imageUrl: a.imageUrl } : a.name)
        },
        log.id
      )
    } catch (error) {
      toast.error('Failed to update daily log')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mood & Behavior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
          <select
            value={formData.mood}
            onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="happy">Happy 😊</option>
            <option value="sad">Sad 😢</option>
            <option value="tired">Tired 😴</option>
            <option value="energetic">Energetic ⚡</option>
            <option value="neutral">Neutral 😐</option>
            <option value="fussy">Fussy 😤</option>
            <option value="excited">Excited 🤩</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Behavior</label>
          <select
            value={formData.behavior || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, behavior: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select behavior</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="needs_attention">Needs Attention</option>
          </select>
        </div>
      </div>

      {/* Meals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Meals</h3>
          <Button type="button" onClick={addMeal} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Meal
          </Button>
        </div>
        <div className="space-y-3">
          {formData.meals.map((meal, index) => (
            <div key={index} className="border rounded p-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                <div>
                  <label className="text-xs font-medium text-gray-700">Type</label>
                  <select
                    value={meal.type}
                    onChange={(e) => updateMeal(index, 'type', e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snack">Snack</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Food</label>
                  <Input
                    value={meal.food}
                    onChange={(e) => updateMeal(index, 'food', e.target.value)}
                    className="text-sm"
                    placeholder="Food item"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Quantity</label>
                  <Input
                    value={meal.quantity}
                    onChange={(e) => updateMeal(index, 'quantity', e.target.value)}
                    className="text-sm"
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Time</label>
                  <Input
                    type="time"
                    value={meal.time}
                    onChange={(e) => updateMeal(index, 'time', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMeal(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drinks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Drinks</h3>
          <Button type="button" onClick={addDrink} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Drink
          </Button>
        </div>
        <div className="space-y-3">
          {formData.drinks.map((drink, index) => (
            <div key={index} className="border rounded p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                <div>
                  <label className="text-xs font-medium text-gray-700">Type</label>
                  <select
                    value={drink.type}
                    onChange={(e) => updateDrink(index, 'type', e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="water">Water</option>
                    <option value="milk">Milk</option>
                    <option value="juice">Juice</option>
                    <option value="formula">Formula</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Quantity</label>
                  <Input
                    value={drink.quantity}
                    onChange={(e) => updateDrink(index, 'quantity', e.target.value)}
                    className="text-sm"
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Time</label>
                  <Input
                    type="time"
                    value={drink.time}
                    onChange={(e) => updateDrink(index, 'time', e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeDrink(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Naps */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Naps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="border rounded p-3">
            <label className="text-sm font-medium">Morning Nap</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-xs">Start</label>
                <Input
                  type="time"
                  value={formData.naps.morning_start || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    naps: { ...prev.naps, morning_start: e.target.value }
                  }))}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs">End</label>
                <Input
                  type="time"
                  value={formData.naps.morning_end || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    naps: { ...prev.naps, morning_end: e.target.value }
                  }))}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
          <div className="border rounded p-3">
            <label className="text-sm font-medium">Afternoon Nap</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-xs">Start</label>
                <Input
                  type="time"
                  value={formData.naps.afternoon_start || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    naps: { ...prev.naps, afternoon_start: e.target.value }
                  }))}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs">End</label>
                <Input
                  type="time"
                  value={formData.naps.afternoon_end || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    naps: { ...prev.naps, afternoon_end: e.target.value }
                  }))}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities with image upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Activities</h3>
        <div className="flex gap-2 mt-2 mb-3">
          <Input
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            placeholder="Add activity"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActivity())}
          />
          <Button type="button" onClick={addActivity}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-2 border rounded p-2 bg-gray-50">
              <Input
                value={activity.name}
                onChange={e => updateActivityName(index, e.target.value)}
                className="w-32"
                placeholder="Activity name"
              />
              {activity.imageUrl && (
                <img src={activity.imageUrl} alt="activity" className="w-10 h-10 object-cover rounded" />
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={el => { fileInputs.current[index] = el }}
                onChange={e => handleActivityImageChange(index, e)}
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => fileInputs.current[index]?.click()}
                disabled={uploading}
                title="Upload image"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => removeActivity(index)}
                title="Remove activity"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Care Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bathroom Visits</label>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Total visits: {formData.bathroom_visits.length}
            </div>
            {formData.bathroom_visits.length > 0 && (
              <div className="max-h-20 overflow-y-auto text-xs space-y-1">
                {formData.bathroom_visits.map((visit, index) => (
                  <div key={index} className="text-gray-500">
                    {visit.time} - {visit.type} {visit.type === 'pee' && visit.pee_color ? `(${visit.pee_color})` : ''}
                    {visit.type === 'poop' && visit.poop_type ? `(${visit.poop_type})` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diaper Changes</label>
          <Input
            type="number"
            min="0"
            value={formData.diaper_changes || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, diaper_changes: parseInt(e.target.value) || null }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sickness/Symptoms</label>
          <Input
            value={formData.sickness}
            onChange={(e) => setFormData(prev => ({ ...prev, sickness: e.target.value }))}
            placeholder="Any symptoms"
          />
        </div>
      </div>

      {/* Medications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medications Given</label>
        <textarea
          value={formData.medications}
          onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
          placeholder="List any medications given with time and dosage"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes for Parents</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes about the child's day"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Log'}
        </Button>
      </div>
    </form>
  )
}
