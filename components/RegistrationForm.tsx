import React, { useState } from 'react'
import axios from 'axios'

interface FormData {
  fullName: string
  guardianName: string
  classGrade: string
  language: string
  location: string
  emailAddress: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  [key: string]: string
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    guardianName: '',
    classGrade: '',
    language: '',
    location: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    // Guardian Name validation
    if (!formData.guardianName.trim()) {
      newErrors.guardianName = 'Guardian name is required'
    } else if (formData.guardianName.trim().length < 2) {
      newErrors.guardianName = 'Guardian name must be at least 2 characters'
    }

    // Class/Grade validation
    if (!formData.classGrade.trim()) {
      newErrors.classGrade = 'Class/Grade is required'
    }

    // Language validation
    if (!formData.language.trim()) {
      newErrors.language = 'Language is required'
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required'
    } else if (!emailRegex.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Prepare data for webhook (excluding confirmPassword)
      const { confirmPassword, ...submitData } = formData
      
      // Temporarily use test endpoint - change back to '/api/submit-registration' after testing
      const response = await axios.post('/api/test-simple', submitData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout
      })

      setSubmitStatus('success')
      setSubmitMessage('Registration successful! Your account has been created.')
      
      // Reset form
      setFormData({
        fullName: '',
        guardianName: '',
        classGrade: '',
        language: '',
        location: '',
        emailAddress: '',
        password: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Registration error:', error)
      setSubmitStatus('error')
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setSubmitMessage('Request timeout. Please try again.')
        } else if (error.response?.data?.error) {
          // Use the error message from our API
          setSubmitMessage(error.response.data.error)
        } else if (error.response?.status === 400) {
          setSubmitMessage('Invalid data submitted. Please check your information.')
        } else if (error.response?.status && error.response.status >= 500) {
          setSubmitMessage('Server error. Please try again later.')
        } else {
          setSubmitMessage('Registration failed. Please try again.')
        }
      } else {
        setSubmitMessage('Network error. Please check your connection and try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClasses = (fieldName: string) => 
    `form-input ${errors[fieldName] ? 'border-red-500 focus:ring-red-500' : ''}`

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today! Fill in your details below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="animate-slide-up">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={inputClasses('fullName')}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="error-message">{errors.fullName}</p>}
          </div>

          {/* Guardian Name */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="guardianName" className="form-label">
              Guardian Name
            </label>
            <input
              type="text"
              id="guardianName"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleInputChange}
              className={inputClasses('guardianName')}
              placeholder="Enter guardian's name"
            />
            {errors.guardianName && <p className="error-message">{errors.guardianName}</p>}
          </div>

          {/* Class/Grade */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="classGrade" className="form-label">
              Class/Grade
            </label>
            <select
              id="classGrade"
              name="classGrade"
              value={formData.classGrade}
              onChange={handleInputChange}
              className={inputClasses('classGrade')}
            >
              <option value="">Select your class/grade</option>
              <option value="1st Grade">1st Grade</option>
              <option value="2nd Grade">2nd Grade</option>
              <option value="3rd Grade">3rd Grade</option>
              <option value="4th Grade">4th Grade</option>
              <option value="5th Grade">5th Grade</option>
              <option value="6th Grade">6th Grade</option>
              <option value="7th Grade">7th Grade</option>
              <option value="8th Grade">8th Grade</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
            </select>
            {errors.classGrade && <p className="error-message">{errors.classGrade}</p>}
          </div>

          {/* Language */}
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <label htmlFor="language" className="form-label">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className={inputClasses('language')}
            >
              <option value="">Select your preferred language</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Other">Other</option>
            </select>
            {errors.language && <p className="error-message">{errors.language}</p>}
          </div>

          {/* Location */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={inputClasses('location')}
              placeholder="Enter your location"
            />
            {errors.location && <p className="error-message">{errors.location}</p>}
          </div>

          {/* Email Address */}
          <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <label htmlFor="emailAddress" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="emailAddress"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleInputChange}
              className={inputClasses('emailAddress')}
              placeholder="Enter your email address"
            />
            {errors.emailAddress && <p className="error-message">{errors.emailAddress}</p>}
          </div>

          {/* Password */}
          <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={inputClasses('password')}
              placeholder="Create a password"
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={inputClasses('confirmPassword')}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Status Messages */}
          {submitStatus === 'success' && (
            <div className="success-message text-center font-medium">
              {submitMessage}
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="error-message text-center font-medium">
              {submitMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Register'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 