import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@sanity/client'

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'k0dxt5dl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
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

    if (!orderId || !productName || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('📁 Uploading files for order:', orderId)

    const designFiles: Array<{
      fileName: string
      fileSize: number
      fileUrl: string
      fileType: string
      uploadedAt: string
    }> = []

    // Process uploaded files
    for (let i = 0; i < 10; i++) {
      const file = formData.get(`file_${i}`) as File
      if (!file) break

      try {
        console.log(`📤 Uploading file: ${file.name}`)
        
        const buffer = Buffer.from(await file.arrayBuffer())

        const asset = await sanityClient.assets.upload('file', buffer, {
          filename: `${orderId}_${i + 1}_${file.name}`,
          description: `Order ${orderId} - File ${i + 1}`,
        })

        console.log(`✅ File uploaded: ${file.name}`)

        designFiles.push({
          fileName: file.name,
          fileSize: file.size / (1024 * 1024),
          fileUrl: asset.url,
          fileType: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
        })
      } catch (fileError) {
        console.error(`❌ Error uploading file ${i}:`, fileError)
      }
    }

    if (designFiles.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    console.log(`✅ Successfully uploaded ${designFiles.length} files`)

    // Find and update the order
    try {
      const existingOrderId = await sanityClient.fetch(
        `*[_type == "order" && orderId == $orderId][0]._id`,
        { orderId }
      )

      if (existingOrderId) {
        console.log(`📁 Updating order ${existingOrderId} with files and delivery details...`)
        
        // ✅ Add _key to each file (required by Sanity)
        const designFilesWithKeys = designFiles.map((file, index) => ({
          _key: `file_${Date.now()}_${index}`,
          ...file,
        }))

        // ✅ Update order with files AND delivery address details
        await sanityClient
          .patch(existingOrderId)
          .set({
            // Files
            designFiles: designFilesWithKeys,
            
            // ✅ NEW: Update delivery address
            deliveryAddress: {
              address: userAddress || '',
              city: userCity || '',
              state: userState || '',
              pincode: userPincode || '',
            },
            
            // ✅ NEW: Update customer details with phone
            customerDetails: {
              firstName: userName?.split(' ')[0] || 'Customer',
              lastName: userName?.split(' ')[1] || '',
              email: userEmail || '',
              phone: userPhone || '',  // ✅ NOW UPDATES!
            },
            
            // Notes
            customerNotes: description,
            updatedAt: new Date().toISOString(),
          })
          .commit()

        console.log(`✅ Order updated with files and delivery details!`)
        console.log('✅ Delivery address saved!')
        console.log('✅ Phone number saved!')
      } else {
        console.error(`❌ Order not found: ${orderId}`)
        throw new Error(`Order ${orderId} not found`)
      }
    } catch (sanityError) {
      console.error('❌ Error updating order:', sanityError)
      throw sanityError
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Files uploaded and delivery details saved',
        orderId: orderId,
        filesUploaded: designFiles.length,
        files: designFiles,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error:', error)

    let errorMessage = 'Failed to upload files'
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}