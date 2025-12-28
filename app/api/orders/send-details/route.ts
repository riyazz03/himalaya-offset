import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'
import os from 'os'

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()

    // Extract form fields
    const description = formData.get('description') as string
    const orderId = formData.get('orderId') as string
    const productName = formData.get('productName') as string
    const userEmail = formData.get('userEmail') as string
    const userName = formData.get('userName') as string
    const userPhone = formData.get('userPhone') as string
    const userAddress = formData.get('userAddress') as string
    const userCity = formData.get('userCity') as string
    const userState = formData.get('userState') as string
    const userPincode = formData.get('userPincode') as string
    const totalAmount = formData.get('totalAmount') as string

    // Validate required fields
    if (!orderId || !productName || !userEmail || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Extract files from form data
    const files: Array<{ name: string; data: Buffer }> = []
    const tempDir = path.join(os.tmpdir(), `order-${orderId}`)

    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Process uploaded files
    let fileCount = 0
    let hasFiles = false
    
    for (let i = 0; i < 10; i++) {
      const file = formData.get(`file_${i}`) as File
      if (!file) break
      
      hasFiles = true

      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileName = `${i + 1}_${file.name}`
        const filePath = path.join(tempDir, fileName)

        // Save file temporarily
        fs.writeFileSync(filePath, buffer)
        files.push({
          name: fileName,
          data: buffer,
        })

        fileCount++
      } catch (fileError) {
        console.error(`Error processing file ${i}:`, fileError)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    // Prepare email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2067ff 0%, #1a52cc 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">New Order Received!</h1>
          <p style="margin: 5px 0 0 0;">Order ID: ${orderId}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a1a1a; margin-top: 0;">Customer Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; color: #1a1a1a;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; color: #1a1a1a;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; color: #1a1a1a;">${userPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Address:</strong></td>
              <td style="padding: 8px 0; color: #1a1a1a;">${userAddress}, ${userCity}, ${userState} - ${userPincode}</td>
            </tr>
          </table>

          <h2 style="color: #1a1a1a; margin-top: 20px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Product:</strong></td>
              <td style="padding: 8px 0; color: #1a1a1a;">${productName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Amount:</strong></td>
              <td style="padding: 8px 0; color: #1a1a1a;">₹${totalAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;"><strong>Files Uploaded:</strong></td>
              <td style="padding: 8px 0; color: #1a1a1a;">${files.length} file(s)</td>
            </tr>
          </table>

          <h2 style="color: #1a1a1a; margin-top: 20px;">Customer Notes</h2>
          <p style="background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #2067ff; color: #1a1a1a; margin: 0;">
            ${description.replace(/\n/g, '<br />')}
          </p>

          <div style="background: white; padding: 12px; border-radius: 6px; margin-top: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              <strong>Order ID:</strong> ${orderId}<br />
              <strong>Files:</strong> ${fileCount} file(s) attached
            </p>
          </div>
        </div>
      </div>
    `

    // Prepare attachments
    const attachments = files.map(file => ({
      filename: file.name,
      content: file.data,
    }))

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'himalayaoffsetvlr1@gmail.com'

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `New Order #${orderId} - ${productName}`,
        html: emailHtml,
        attachments: attachments,
      })
      console.log('✅ Email sent to admin successfully')
    } catch (emailError) {
      console.warn('⚠️ Email sending failed:', emailError)
      // Continue anyway - files were processed
    }

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2067ff 0%, #1a52cc 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Order Confirmation!</h1>
          <p style="margin: 5px 0 0 0;">Thank you for your order</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
          <p style="color: #1a1a1a;">Hi ${userName},</p>
          <p style="color: #6b7280;">We have received your order for <strong>${productName}</strong>. Our team will review your files and get back to you soon.</p>
          
          <div style="background: white; padding: 12px; border-radius: 6px; margin-top: 20px; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; color: #6b7280;"><strong>Order Details</strong></p>
            <p style="margin: 0; color: #1a1a1a;"><strong>Order ID:</strong> ${orderId}</p>
            <p style="margin: 0; color: #1a1a1a;"><strong>Amount:</strong> ₹${totalAmount}</p>
          </div>

          <p style="color: #6b7280; margin-top: 20px;">Thank you for choosing us!</p>
        </div>
      </div>
    `

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Order Confirmation #${orderId}`,
        html: customerEmailHtml,
      })
      console.log('✅ Confirmation email sent to customer')
    } catch (error) {
      console.warn('⚠️ Failed to send customer confirmation email:', error)
    }

    // Clean up temp files after sending
    setTimeout(() => {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true })
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up temp directory:', cleanupError)
      }
    }, 5000)

    return NextResponse.json(
      {
        success: true,
        message: 'Order details received successfully',
        orderId: orderId,
        filesUploaded: fileCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Order send-details error:', error)

    let errorMessage = 'Failed to process order'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}