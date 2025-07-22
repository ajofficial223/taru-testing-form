import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test the webhook with minimal data
    const testData = {
      fullName: 'Test User',
      guardianName: 'Test Guardian',
      classGrade: '10th Grade',
      language: 'English',
      location: 'Test Location',
      emailAddress: 'test@example.com',
      password: 'testpass123'
    }

    console.log('Testing webhook with data:', testData)

    const response = await axios.post(
      'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY-MAIN',
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    )

    console.log('Webhook test successful:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    })

    return res.status(200).json({
      success: true,
      message: 'Webhook test successful',
      webhookStatus: response.status,
      webhookData: response.data
    })

  } catch (error) {
    console.error('Webhook test failed:', error)

    if (axios.isAxiosError(error)) {
      console.error('Webhook Error Details:', {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })

      return res.status(500).json({
        success: false,
        error: 'Webhook test failed',
        details: {
          code: error.code,
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      })
    } else {
      return res.status(500).json({
        success: false,
        error: 'Unknown error during webhook test',
        details: String(error)
      })
    }
  }
} 