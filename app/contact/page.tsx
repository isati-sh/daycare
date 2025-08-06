'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactForm = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([data])

      if (error) {
        toast.error('Failed to send message. Please try again.')
      } else {
        toast.success('Message sent successfully! We\'ll get back to you soon.')
        setIsSubmitted(true)
        reset()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-sm sm:max-w-md w-full">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Thank You!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Your message has been sent successfully. We'll get back to you within 24 hours.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="w-full text-sm sm:text-base py-2 sm:py-3"
            >
              Send Another Message
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl max-w-2xl sm:max-w-3xl mx-auto px-4">
            Get in touch with us to learn more about our programs or schedule a tour
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl">Send us a Message</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-sm sm:text-base">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      className="text-sm sm:text-base"
                      {...register('name')}
                    />
                    {errors.name && (
                      <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        {errors.name.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="text-sm sm:text-base"
                      {...register('email')}
                    />
                    {errors.email && (
                      <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        {errors.email.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="text-sm sm:text-base"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        {errors.phone.message}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm sm:text-base">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your child and what you're looking for..."
                      rows={5}
                      className="text-sm sm:text-base"
                      {...register('message')}
                    />
                    {errors.message && (
                      <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        {errors.message.message}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-sm sm:text-base py-2 sm:py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Get in Touch
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">
                We'd love to hear from you! Whether you have questions about our programs, 
                want to schedule a tour, or just want to learn more about Little Learners, 
                we're here to help.
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Phone</h3>
                  <p className="text-sm sm:text-base text-gray-600">(555) 123-4567</p>
                  <p className="text-xs sm:text-sm text-gray-500">Monday - Friday, 6:30 AM - 6:00 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Email</h3>
                  <p className="text-sm sm:text-base text-gray-600">info@littlelearners.com</p>
                  <p className="text-xs sm:text-sm text-gray-500">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Address</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    123 Learning Lane<br />
                    City, ST 12345
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Located in a safe, family-friendly neighborhood</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Hours</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Monday - Friday: 6:30 AM - 6:00 PM<br />
                    Saturday: 8:00 AM - 2:00 PM<br />
                    Sunday: Closed
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">Extended hours available for working parents</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <Button asChild variant="outline" className="w-full justify-start text-sm sm:text-base py-2 sm:py-3">
                  <a href="tel:+15551234567">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Call Now
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start text-sm sm:text-base py-2 sm:py-3">
                  <a href="mailto:info@littlelearners.com">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                <Button asChild className="w-full justify-start text-sm sm:text-base py-2 sm:py-3">
                  <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 