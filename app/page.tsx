import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Users, 
  BookOpen, 
  Shield, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Little Learners Daycare - Nurturing Young Minds',
  description: 'A safe, nurturing environment where children learn, grow, and thrive. Quality childcare for ages 6 weeks to 5 years.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-bg kids-pattern overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
                <Heart className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">Licensed & Accredited</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="text-primary-600">Little</span> Learners
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Where every child's journey begins with love, learning, and laughter. 
              Nurturing young minds from 6 weeks to 5 years.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-4">
                <Link href="/programs">
                  Explore Programs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                <Link href="/contact">
                  Schedule a Visit
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce-slow">
          <div className="w-8 h-8 bg-secondary-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-40 right-20 animate-bounce-slow animation-delay-200">
          <div className="w-6 h-6 bg-primary-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce-slow animation-delay-400">
          <div className="w-10 h-10 bg-accent-400 rounded-full opacity-60"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Little Learners?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a safe, nurturing environment where children can learn, grow, and develop their full potential.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nurturing Care</h3>
              <p className="text-gray-600">Loving, attentive care in a safe and secure environment.</p>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Early Learning</h3>
              <p className="text-gray-600">Age-appropriate curriculum that fosters development.</p>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Small Groups</h3>
              <p className="text-gray-600">Individual attention with low child-to-teacher ratios.</p>
            </Card>
            
            <Card className="text-center p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safety First</h3>
              <p className="text-gray-600">Licensed facility with comprehensive safety protocols.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Programs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Age-appropriate programs designed to support your child's development at every stage.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👶</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Infants</h3>
                <Badge variant="secondary">6 weeks - 12 months</Badge>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Individual care plans</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Safe sleep practices</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Development tracking</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧒</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Toddlers</h3>
                <Badge variant="secondary">12 months - 3 years</Badge>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Language development</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Social skills building</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Creative play activities</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Preschool</h3>
                <Badge variant="secondary">3 - 5 years</Badge>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>School readiness skills</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>STEM activities</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Arts & crafts</span>
                </li>
              </ul>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/programs">
                View All Programs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Parents Say
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Little Learners has been amazing for our daughter. The teachers are caring and the curriculum is excellent. She's learned so much!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 font-semibold">S</span>
                </div>
                <div>
                  <p className="font-semibold">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">Parent of Emma, 3 years</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The staff is incredibly professional and caring. My son loves coming here every day and has made great friends."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-secondary-600 font-semibold">M</span>
                </div>
                <div>
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm text-gray-500">Parent of Lucas, 4 years</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-8">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "I feel so confident leaving my baby here. The infant program is wonderful and the teachers are so attentive."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-accent-600 font-semibold">A</span>
                </div>
                <div>
                  <p className="font-semibold">Amanda Rodriguez</p>
                  <p className="text-sm text-gray-500">Parent of Sofia, 8 months</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Join Our Family?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Schedule a tour today and see why Little Learners is the perfect place for your child's early education journey.
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

      {/* Contact Info */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Little Learners</h3>
              <p className="text-gray-300 mb-4">
                Nurturing young minds with love, learning, and laughter since 2010.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>info@littlelearners.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>123 Learning Lane, City, ST 12345</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Hours</h4>
              <div className="space-y-1 text-gray-300">
                <p>Monday - Friday</p>
                <p>6:30 AM - 6:00 PM</p>
                <p className="mt-2">Saturday</p>
                <p>8:00 AM - 2:00 PM</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
                <Link href="/programs" className="block text-gray-300 hover:text-white transition-colors">
                  Programs
                </Link>
                <Link href="/gallery" className="block text-gray-300 hover:text-white transition-colors">
                  Gallery
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Little Learners Daycare. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
} 