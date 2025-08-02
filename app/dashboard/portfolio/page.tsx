'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Calendar, 
  BookOpen, 
  Star,
  Download,
  Camera,
  FileText,
  TrendingUp,
  Award,
  Heart,
  Activity,
  Utensils,
  Bed
} from 'lucide-react'
import { formatDate, getAge } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_group: 'infant' | 'toddler' | 'preschool'
  allergies: string[] | null
  medical_notes: string | null
}

interface PortfolioEntry {
  id: string
  child_id: string
  date: string
  type: 'milestone' | 'activity' | 'observation' | 'photo'
  title: string
  description: string
  category: string
  created_by: string
  created_at: string
}

interface DevelopmentMilestone {
  id: string
  child_id: string
  category: 'physical' | 'cognitive' | 'social' | 'language'
  milestone: string
  achieved_date: string
  notes: string
  created_at: string
}

export default function PortfolioPage() {
  const { user, client: supabase } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>([])
  const [milestones, setMilestones] = useState<DevelopmentMilestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchChildren()
    }
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      fetchPortfolioEntries()
      fetchMilestones()
    }
  }, [selectedChild])

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user?.id)

      if (error) throw error
      setChildren(data || [])
      if (data && data.length > 0) {
        setSelectedChild(data[0])
      }
    } catch (error) {
      console.error('Error fetching children:', error)
      toast.error('Failed to load children information')
    } finally {
      setLoading(false)
    }
  }

  const fetchPortfolioEntries = async () => {
    if (!selectedChild) return

    try {
      const { data, error } = await supabase
        .from('portfolio_entries')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPortfolioEntries(data || [])
    } catch (error) {
      console.error('Error fetching portfolio entries:', error)
      toast.error('Failed to load portfolio entries')
    }
  }

  const fetchMilestones = async () => {
    if (!selectedChild) return

    try {
      const { data, error } = await supabase
        .from('development_milestones')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('achieved_date', { ascending: false })

      if (error) throw error
      setMilestones(data || [])
    } catch (error) {
      console.error('Error fetching milestones:', error)
      toast.error('Failed to load development milestones')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical':
        return <Activity className="h-5 w-5 text-blue-500" />
      case 'cognitive':
        return <BookOpen className="h-5 w-5 text-green-500" />
      case 'social':
        return <Heart className="h-5 w-5 text-pink-500" />
      case 'language':
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <Star className="h-5 w-5 text-yellow-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Award className="h-5 w-5 text-yellow-500" />
      case 'activity':
        return <Activity className="h-5 w-5 text-blue-500" />
      case 'observation':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'photo':
        return <Camera className="h-5 w-5 text-purple-500" />
      default:
        return <Star className="h-5 w-5 text-gray-500" />
    }
  }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading portfolio...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Child Portfolio</h1>
          <p className="text-gray-600 mt-2">
            Track your child's development, activities, and milestones
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 0 && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Child
            </label>
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChild?.id === child.id ? 'default' : 'outline'}
                  onClick={() => setSelectedChild(child)}
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>{child.first_name} {child.last_name}</span>
                  <Badge variant="secondary">{child.age_group}</Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedChild ? (
          <div className="space-y-8">
            {/* Child Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {selectedChild.first_name} {selectedChild.last_name}
                </CardTitle>
                <CardDescription>
                  Age: {getAge(selectedChild.date_of_birth)} years old • {selectedChild.age_group}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Child Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Age Group:</span> {selectedChild.age_group}</p>
                      <p><span className="font-medium">Date of Birth:</span> {formatDate(selectedChild.date_of_birth)}</p>
                      {selectedChild.allergies && selectedChild.allergies.length > 0 && (
                        <p><span className="font-medium">Allergies:</span> {selectedChild.allergies.join(', ')}</p>
                      )}
                      {selectedChild.medical_notes && (
                        <p><span className="font-medium">Medical Notes:</span> {selectedChild.medical_notes}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button asChild size="sm" className="w-full justify-start">
                        <a href={`/dashboard/portfolio/${selectedChild.id}/download`}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Portfolio
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full justify-start">
                        <a href={`/dashboard/portfolio/${selectedChild.id}/print`}>
                          <FileText className="h-4 w-4 mr-2" />
                          Print Report
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Development Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Development Milestones
                </CardTitle>
                <CardDescription>
                  Track your child's developmental progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {milestones.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No milestones recorded yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Teachers will add milestones as your child achieves them
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {milestones.map((milestone) => (
                      <div key={milestone.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(milestone.category)}
                            <Badge variant="outline">{milestone.category}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(milestone.achieved_date)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{milestone.milestone}</h4>
                        {milestone.notes && (
                          <p className="text-sm text-gray-600">{milestone.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Entries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Portfolio Entries
                </CardTitle>
                <CardDescription>
                  Activities, observations, and special moments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {portfolioEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No portfolio entries yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Teachers will add entries as they observe your child's activities
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {portfolioEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(entry.type)}
                            <Badge variant="outline">{entry.type}</Badge>
                            {entry.category && (
                              <Badge variant="secondary">{entry.category}</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{entry.title}</h4>
                        <p className="text-gray-600">{entry.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Progress Summary
                </CardTitle>
                <CardDescription>
                  Overview of your child's development areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Physical</h4>
                    <p className="text-sm text-gray-600">
                      {milestones.filter(m => m.category === 'physical').length} milestones
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Cognitive</h4>
                    <p className="text-sm text-gray-600">
                      {milestones.filter(m => m.category === 'cognitive').length} milestones
                    </p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Social</h4>
                    <p className="text-sm text-gray-600">
                      {milestones.filter(m => m.category === 'social').length} milestones
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-gray-900">Language</h4>
                    <p className="text-sm text-gray-600">
                      {milestones.filter(m => m.category === 'language').length} milestones
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Enrolled</h3>
              <p className="text-gray-600 mb-4">
                Enroll your child to start tracking their portfolio
              </p>
              <Button asChild>
                <a href="/dashboard/enroll">Enroll Child</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 