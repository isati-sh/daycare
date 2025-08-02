'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Image,
  Heart,
  Users,
  BookOpen
} from 'lucide-react'

// Mock gallery data - in a real app, these would come from Supabase storage
const galleryImages = [
  {
    id: 1,
    src: '/gallery/classroom-1.jpg',
    alt: 'Bright and colorful classroom',
    category: 'classrooms',
    title: 'Infant Classroom',
    description: 'Our cozy infant room with soft lighting and age-appropriate toys'
  },
  {
    id: 2,
    src: '/gallery/classroom-2.jpg',
    alt: 'Toddler classroom with learning centers',
    category: 'classrooms',
    title: 'Toddler Classroom',
    description: 'Structured learning environment with various activity centers'
  },
  {
    id: 3,
    src: '/gallery/classroom-3.jpg',
    alt: 'Preschool classroom with art supplies',
    category: 'classrooms',
    title: 'Preschool Classroom',
    description: 'School-ready environment with art, science, and reading areas'
  },
  {
    id: 4,
    src: '/gallery/playground-1.jpg',
    alt: 'Outdoor playground equipment',
    category: 'outdoor',
    title: 'Outdoor Playground',
    description: 'Safe, age-appropriate playground with climbing structures and slides'
  },
  {
    id: 5,
    src: '/gallery/playground-2.jpg',
    alt: 'Children playing in sandbox',
    category: 'outdoor',
    title: 'Sand and Water Play',
    description: 'Sensory play areas for hands-on learning and exploration'
  },
  {
    id: 6,
    src: '/gallery/activities-1.jpg',
    alt: 'Children doing art projects',
    category: 'activities',
    title: 'Art and Creativity',
    description: 'Children expressing themselves through painting and crafts'
  },
  {
    id: 7,
    src: '/gallery/activities-2.jpg',
    alt: 'Story time with teacher',
    category: 'activities',
    title: 'Story Time',
    description: 'Building literacy skills through interactive reading sessions'
  },
  {
    id: 8,
    src: '/gallery/activities-3.jpg',
    alt: 'Science experiment with children',
    category: 'activities',
    title: 'Science Exploration',
    description: 'Hands-on STEM activities that spark curiosity and learning'
  },
  {
    id: 9,
    src: '/gallery/meals-1.jpg',
    alt: 'Children eating healthy meals',
    category: 'meals',
    title: 'Healthy Meals',
    description: 'Nutritious, balanced meals prepared fresh daily'
  },
  {
    id: 10,
    src: '/gallery/facility-1.jpg',
    alt: 'Clean, modern facility entrance',
    category: 'facility',
    title: 'Main Entrance',
    description: 'Secure, welcoming entrance with safety protocols'
  },
  {
    id: 11,
    src: '/gallery/facility-2.jpg',
    alt: 'Nap room with individual cots',
    category: 'facility',
    title: 'Rest Area',
    description: 'Comfortable nap areas with individual sleeping spaces'
  },
  {
    id: 12,
    src: '/gallery/facility-3.jpg',
    alt: 'Bathroom with child-sized fixtures',
    category: 'facility',
    title: 'Child-Sized Facilities',
    description: 'Age-appropriate bathrooms and changing areas'
  }
]

const categories = [
  { id: 'all', name: 'All Photos', icon: Image },
  { id: 'classrooms', name: 'Classrooms', icon: BookOpen },
  { id: 'outdoor', name: 'Outdoor Areas', icon: Heart },
  { id: 'activities', name: 'Activities', icon: Users },
  { id: 'meals', name: 'Meals', icon: Heart },
  { id: 'facility', name: 'Facility', icon: Image }
]

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory)

  const startSlideshow = () => {
    setIsPlaying(true)
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredImages.length)
    }, 3000)
    return () => clearInterval(interval)
  }

  const stopSlideshow = () => {
    setIsPlaying(false)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Photo Gallery
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Take a virtual tour of our facility and see our children in action
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <Card 
                key={image.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-t-lg flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-12 w-12 text-primary-600 mx-auto mb-2" />
                    <p className="text-sm text-primary-600 font-medium">{image.title}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                  <p className="text-sm text-gray-600">{image.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {image.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Slideshow Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full bg-white rounded-lg overflow-hidden">
            <div className="relative">
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <div className="text-center">
                  <Image className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <p className="text-lg text-primary-600 font-medium">{selectedImage.title}</p>
                </div>
              </div>
              
              {/* Navigation */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={isPlaying ? stopSlideshow : startSlideshow}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedImage.title}</h2>
              <p className="text-gray-600 mb-4">{selectedImage.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{selectedImage.category}</Badge>
                <Button variant="outline" onClick={() => setSelectedImage(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              A Day in the Life
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our gallery showcases the daily activities, learning environments, and happy moments 
              that make Little Learners a special place for your child.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Safe Environment</h3>
                <p className="text-gray-600">
                  Every photo shows our commitment to safety and security in all areas of our facility.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Learning Through Play</h3>
                <p className="text-gray-600">
                  Our activities are designed to be both fun and educational, supporting all areas of development.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-accent-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Happy Children</h3>
                <p className="text-gray-600">
                  The smiles and laughter in our photos reflect the joy of learning and growing together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
} 