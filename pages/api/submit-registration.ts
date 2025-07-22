import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

interface RegistrationData {
  fullName: string
  guardianName: string
  classGrade: string
  language: string
  location: string
  emailAddress: string
  password: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const registrationData: RegistrationData = req.body

    // Validate required fields
    const requiredFields = ['fullName', 'guardianName', 'classGrade', 'language', 'location', 'emailAddress', 'password']
    const missingFields = requiredFields.filter(field => !registrationData[field as keyof RegistrationData])
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      })
    }

    // Log the data being sent (remove sensitive info for production)
    console.log('Sending registration data:', {
      ...registrationData,
      password: '[REDACTED]' // Don't log the actual password
    })

    // Make request to the external webhook
    const webhookResponse = await axios.post(
      'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY-MAIN',
      registrationData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout
      }
    )

    console.log('Webhook response:', {
      status: webhookResponse.status,
      statusText: webhookResponse.statusText,
      data: webhookResponse.data
    })

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Registration submitted successfully',
      data: webhookResponse.data
    })

  } catch (error) {
    console.error('Registration API Error:', error)

    if (axios.isAxiosError(error)) {
      console.error('Axios Error Details:', {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })

      if (error.code === 'ECONNABORTED') {
        return res.status(408).json({ 
          error: 'Request timeout. Please try again.' 
        })
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'Unable to connect to registration service. Please try again later.' 
        })
      } else if (error.response?.status === 400) {
        return res.status(400).json({ 
          error: 'Invalid data submitted. Please check your information.' 
        })
      } else if (error.response?.status === 404) {
        return res.status(502).json({ 
          error: 'Registration service not found. Please contact support.' 
        })
      } else if (error.response?.status && error.response.status >= 500) {
        return res.status(502).json({ 
          error: 'External server error. Please try again later.' 
        })
      } else {
        return res.status(500).json({ 
          error: `Registration failed: ${error.message}. Please try again.` 
        })
      }
    } else {
      console.error('Non-Axios Error:', error)
      return res.status(500).json({ 
        error: 'Internal server error. Please try again.' 
      })
    }
  }
} 