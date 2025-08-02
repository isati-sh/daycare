import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Baby, 
  Users, 
  BookOpen, 
  Palette, 
  Music, 
  Heart,
  Clock,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Our Programs - Little Learners Daycare',
  description: 'Explore our age-appropriate programs designed to support your child\'s development at every stage.',
}

const programs = [
  {
    id: 'infant',
    title: 'Infant Care',
    ageRange: '6 weeks - 12 months',
    icon: Baby,
    color: 'primary',
    description: 'Individualized care plans for our youngest learners with focus on safe sleep practices and developmental milestones.',
    features: [
      'Individual care plans',
      'Safe sleep practices',
      'Development tracking',
      'Feeding schedules',
      'Tummy time activities',
      'Sensory exploration'
    ],
    schedule: 'Flexible hours to accommodate your schedule',
    ratio: '4:1 student-teacher ratio',
    price: '$1,200/month'
  },
  {
    id: 'toddler',
    title: 'Toddler Program',
    ageRange: '12 months - 3 years',
    icon: Users,
    color: 'secondary',
    description: 'Structured learning through play with emphasis on language development, social skills, and independence.',
    features: [
      'Language development',
      'Social skills building',
      'Creative play activities',
      'Potty training support',
      'Music and movement',
      'Outdoor exploration'
    ],
    schedule: 'Full-day program with structured activities',
    ratio: '6:1 student-teacher ratio',
    price: '$1,100/month'
  },
  {
    id: 'preschool',
    title: 'Preschool Program',
    ageRange: '3 - 5 years',
    icon: BookOpen,
    color: 'accent',
    description: 'School readiness program with STEM activities, arts & crafts, and foundational academic skills.',
    features: [
      'School readiness skills',
      'STEM activities',
      'Arts & crafts',
      'Letter and number recognition',
      'Social-emotional learning',
      'Field trips and special events'
    ],
    schedule: 'Full-day program with structured curriculum',
    ratio: '8:1 student-teacher ratio',
    price: '$1,000/month'
  }
]

const curriculumAreas = [
  {
    title: 'Cognitive Development',
    description: 'Problem-solving, critical thinking, and academic readiness',
    activities: ['Puzzles', 'Building blocks', 'Science experiments', 'Math games']
  },
  {
    title: 'Social-Emotional Learning',
    description: 'Building confidence, empathy, and positive relationships',
    activities: ['Group activities', 'Conflict resolution', 'Emotion recognition', 'Team building']
  },
  {
    title: 'Physical Development',
    description: 'Gross and fine motor skills, coordination, and healthy habits',
    activities: ['Outdoor play', 'Dance and movement', 'Art projects', 'Sports activities']
  },
  {
    title: 'Language & Communication',
    description: 'Vocabulary building, listening skills, and self-expression',
    activities: ['Story time', 'Show and tell', 'Conversation practice', 'Reading readiness']
  },
  {
    title: 'Creative Expression',
    description: 'Art, music, drama, and imaginative play',
    activities: ['Painting and drawing', 'Music and singing', 'Dramatic play', 'Craft projects']
  },
  {
    title: 'Cultural Awareness',
    description: 'Understanding diversity, traditions, and global perspectives',
    activities: ['Cultural celebrations', 'Multilingual exposure', 'Global stories', 'Community connections']
  }
]

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Our Programs
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Age-appropriate programs designed to support your child's development at every stage
          </p>
        </div>
      </section>

      {/* Programs Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose the Right Program
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each program is carefully designed to meet the developmental needs of children at different ages
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <Card key={program.id} className="hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-20 h-20 bg-${program.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <program.icon className={`h-10 w-10 text-${program.color}-600`} />
                  </div>
                  <CardTitle className="text-2xl">{program.title}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mb-2">{program.ageRange}</Badge>
                    <p className="mt-4 text-gray-600">{program.description}</p>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Schedule:</span>
                      <span className="font-medium">{program.schedule}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ratio:</span>
                      <span className="font-medium">{program.ratio}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Monthly Rate:</span>
                      <span className="font-medium">{program.price}</span>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="font-semibold mb-3">Program Features:</h4>
                      <ul className="space-y-2">
                        {program.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button asChild className="w-full mt-6">
                      <Link href="/contact">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Areas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Curriculum
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive approach to early childhood education that addresses all areas of development
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {curriculumAreas.map((area, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{area.title}</CardTitle>
                  <CardDescription>{area.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-3">Sample Activities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {area.activities.map((activity, activityIndex) => (
                      <Badge key={activityIndex} variant="outline" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Schedule */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Daily Schedule
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A typical day at Little Learners includes a balance of structured learning and free play
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Morning Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">6:30 - 8:00 AM</span>
                    <span className="text-gray-600">Arrival & Free Play</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">8:00 - 8:30 AM</span>
                    <span className="text-gray-600">Breakfast</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">8:30 - 9:00 AM</span>
                    <span className="text-gray-600">Circle Time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">9:00 - 10:30 AM</span>
                    <span className="text-gray-600">Structured Activities</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">10:30 - 11:00 AM</span>
                    <span className="text-gray-600">Snack Time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">11:00 - 12:00 PM</span>
                    <span className="text-gray-600">Outdoor Play</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Afternoon Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">12:00 - 12:30 PM</span>
                    <span className="text-gray-600">Lunch</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">12:30 - 2:30 PM</span>
                    <span className="text-gray-600">Nap Time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">2:30 - 3:00 PM</span>
                    <span className="text-gray-600">Snack Time</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">3:00 - 4:00 PM</span>
                    <span className="text-gray-600">Creative Activities</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">4:00 - 5:00 PM</span>
                    <span className="text-gray-600">Outdoor Play</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">5:00 - 6:00 PM</span>
                    <span className="text-gray-600">Free Play & Pickup</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Enroll?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Schedule a tour to see our programs in action and meet our dedicated teachers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                Schedule a Tour
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
              <Link href="/login">
                Parent Portal
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 