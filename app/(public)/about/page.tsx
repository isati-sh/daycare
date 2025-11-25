import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Users, 
  Award, 
  Shield, 
  BookOpen, 
  Star,
  GraduationCap,
  Clock,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - Little Learners Daycare',
  description: 'Learn about our mission, values, and the dedicated team that makes Little Learners Daycare a special place for your child.',
}

const staffMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Director',
    experience: '15+ years',
    education: 'M.Ed. Early Childhood Education',
    bio: 'Sarah has dedicated her career to creating nurturing environments where children can thrive. She believes every child deserves a strong foundation for lifelong learning.',
    image: '/staff/sarah.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'Lead Teacher - Preschool',
    experience: '8 years',
    education: 'B.S. Child Development',
    bio: 'Michael specializes in school readiness and STEM activities. He loves making learning fun through hands-on experiments and creative projects.',
    image: '/staff/michael.jpg'
  },
  {
    name: 'Amanda Rodriguez',
    role: 'Infant Care Specialist',
    experience: '12 years',
    education: 'Certified Infant Care Specialist',
    bio: 'Amanda has a special passion for infant development and creating safe, loving environments for our youngest learners.',
    image: '/staff/amanda.jpg'
  },
  {
    name: 'David Thompson',
    role: 'Toddler Teacher',
    experience: '6 years',
    education: 'B.A. Early Childhood Education',
    bio: 'David excels at helping toddlers develop social skills and language through play-based learning and structured activities.',
    image: '/staff/david.jpg'
  }
]

const values = [
  {
    icon: Heart,
    title: 'Nurturing Care',
    description: 'Every child receives individual attention and care in a loving, supportive environment.'
  },
  {
    icon: BookOpen,
    title: 'Early Learning',
    description: 'Age-appropriate curriculum that fosters cognitive, social, and emotional development.'
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Comprehensive safety protocols and licensed facility ensure your child\'s well-being.'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building strong partnerships with families and creating a supportive community.'
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            About Little Learners
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-2xl sm:max-w-3xl mx-auto px-4">
            Nurturing young minds with love, learning, and laughter since 2010
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                At Little Learners Daycare, we believe every child deserves a strong foundation for lifelong learning. 
                Our mission is to provide a safe, nurturing environment where children can explore, discover, and grow 
                at their own pace.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                We are committed to fostering curiosity, creativity, and confidence in each child through 
                age-appropriate activities, structured learning, and plenty of play time.
              </p>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 flex-shrink-0" />
                <span className="text-base sm:text-lg font-semibold text-gray-900">
                  Licensed & Accredited since 2010
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-6 sm:p-8">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                    Our Promise
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    To provide exceptional care and education that prepares your child for a bright future, 
                    while giving you peace of mind knowing they are safe, happy, and thriving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Values
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-4">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <value.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Meet Our Team
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-4">
              Dedicated professionals committed to your child's growth and development
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {staffMembers.map((staff, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4 sm:pb-6">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-lg sm:text-2xl font-bold text-primary-600">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{staff.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mb-2 text-xs sm:text-sm">{staff.role}</Badge>
                    <div className="text-xs sm:text-sm text-gray-600 mt-2">
                      <p>{staff.experience} experience</p>
                      <p>{staff.education}</p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-gray-600">{staff.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">14</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-100">Years of Excellence</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">150+</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-100">Happy Families</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">8:1</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-100">Student-Teacher Ratio</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">100%</div>
              <div className="text-xs sm:text-sm md:text-base text-primary-100">Licensed & Insured</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Visit Us
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Come see our facility and meet our team
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Location</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  123 Learning Lane<br />
                  City, ST 12345
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 sm:p-8 text-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Hours</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Monday - Friday<br />
                  6:30 AM - 6:00 PM<br />
                  Saturday: 8:00 AM - 2:00 PM
                </p>
              </CardContent>
            </Card>
            
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 sm:p-8 text-center">
                <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Contact</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  (555) 123-4567<br />
                  info@littlelearners.com
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 