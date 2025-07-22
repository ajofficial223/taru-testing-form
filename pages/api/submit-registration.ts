import type { NextApiRequest, NextApiResponse } from 'next'

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
  if (req.method !== 'GET') {
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

    // Make request to the external webhook
    const params = new URLSearchParams(registrationData as unknown as Record<string, string>).toString()
    const webhookResponse = await fetch(`https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY-MAIN?${params}`, {
      method: "GET"
    })

    if (!webhookResponse.ok) {
      throw new Error(`HTTP error! status: ${webhookResponse.status}`)
    }

    const responseData = await webhookResponse.text()

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Registration submitted successfully',
      data: responseData
    })

  } catch (error) {
    console.error('Registration API Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return res.status(408).json({ 
          error: 'Request timeout. Please try again.' 
        })
      } else if (error.message.includes('status: 400')) {
        return res.status(400).json({ 
          error: 'Invalid data submitted. Please check your information.' 
        })
      } else if (error.message.includes('status: 404')) {
        return res.status(502).json({ 
          error: 'Registration service not found. Please contact support.' 
        })
      } else if (error.message.includes('status: 5')) {
        return res.status(502).json({ 
          error: 'External server error. Please try again later.' 
        })
      } else {
        return res.status(500).json({ 
          error: `Registration failed: ${error.message}. Please try again.` 
        })
      }
    } else {
      return res.status(500).json({ 
        error: 'Internal server error. Please try again.' 
      })
    }
  }
} 