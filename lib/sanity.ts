import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'k0dxt5dl',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  perspective: 'published',
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)
export const urlFor = (source: Record<string, unknown>) => builder.image(source)

export const SanityService = {
  async getCategories() {
    try {
      const categories = await client.fetch(
        '*[_type == "category" && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, description, "image_url": image.asset->url, "image_alt": image.alt, sortOrder, isActive, bgColor, _createdAt, _updatedAt }'
      )
      return { data: categories, error: null }
    } catch (err) {
      console.error('Error fetching categories:', err)
      return { data: null, error: err }
    }
  },

  async getCategoryWithProducts(slug: string) {
    try {
      const category = await client.fetch(
        '*[_type == "category" && slug.current == $slug && isActive == true][0] { _id, name, "slug": slug.current, description, "image_url": image.asset->url, "image_alt": image.alt, bgColor, "subcategories": *[_type == "subcategory" && references(^._id) && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, "image_url": image.asset->url, "image_alt": image.alt, "images": images[] { "asset": asset->url, "alt": alt }, description, minOrderQuantity, isFeatured, sortOrder, "pricingTiers": quantityTiers[] { "quantity": label, "price": basePrice, "pricePerUnit": basePrice, savingsPercentage, badge, isRecommended } } }',
        { slug } as Record<string, unknown>
      )
      return { data: category, error: null }
    } catch (err) {
      console.error('Error fetching category:', err)
      return { data: null, error: err }
    }
  },

  async getAllCategoriesWithSubcategories() {
    try {
      const categories = await client.fetch(
        '*[_type == "category" && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, description, "image_url": image.asset->url, "image_alt": image.alt, sortOrder, isActive, bgColor, _createdAt, _updatedAt, "subcategories": *[_type == "subcategory" && references(^._id) && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, "image_url": image.asset->url, "image_alt": image.alt, "images": images[] { "asset": asset->url, "alt": alt }, description, minOrderQuantity, isFeatured, sortOrder, "pricingTiers": quantityTiers[] { "quantity": label, "price": basePrice, "pricePerUnit": basePrice, savingsPercentage, badge, isRecommended } } }'
      )
      return { data: categories, error: null }
    } catch (err) {
      console.error('Error fetching all categories with subcategories:', err)
      return { data: null, error: err }
    }
  },

  async getProduct(slug: string) {
    try {
      const product = await client.fetch(
        `*[_type == "subcategory" && slug.current == $slug && isActive == true][0] {
          _id,
          name,
          "slug": slug.current,
          description,
          instructions,
          "image_url": image.asset->url,
          "image_alt": image.alt,
          "images": images[] {
            "asset": asset->url,
            "alt": alt
          },
          deliveryOptions[] {
            type,
            description,
            locations
          },
          productOptions[] {
            label,
            optionType,
            isRequired,
            values[] {
              label,
              value,
              basePrice,
              priceByTier[] {
                tierLabel,
                price
              }
            },
            numberConfig {
              min,
              max,
              step,
              basePricePerUnit,
              priceByTier[] {
                tierLabel,
                pricePerUnit
              }
            }
          },
          "pricingTiers": quantityTiers[] {
            "quantity": label,
            "price": basePrice,
            "pricePerUnit": basePrice,
            savingsPercentage,
            badge,
            isRecommended
          },
          specifications[] {
            label,
            value
          },
          minOrderQuantity,
          isFeatured,
          "category": category-> {
            _id,
            name,
            "slug": slug.current
          }
        }`,
        { slug } as Record<string, unknown>
      )
      return { data: product, error: null }
    } catch (err) {
      console.error('Error fetching product:', err)
      return { data: null, error: err }
    }
  },

  async getFeaturedProducts() {
    try {
      const products = await client.fetch(
        '*[_type == "subcategory" && isFeatured == true && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, "image_url": image.asset->url, "image_alt": image.alt, "images": images[] { "asset": asset->url, "alt": alt }, minOrderQuantity, "category": category->{ name, "slug": slug.current }, "pricingTiers": quantityTiers[] { "quantity": label, "price": basePrice, "pricePerUnit": basePrice, savingsPercentage, badge, isRecommended }, "startingPrice": quantityTiers[0].basePrice }'
      )
      return { data: products, error: null }
    } catch (err) {
      console.error('Error fetching featured products:', err)
      return { data: null, error: err }
    }
  },

  async searchProducts(searchQuery: string) {
    try {
      const products = await client.fetch(
        '*[_type == "subcategory" && (name match $query || category->name match $query) && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, "image_url": image.asset->url, "image_alt": image.alt, "images": images[] { "asset": asset->url, "alt": alt }, "category": category->{ name, "slug": slug.current }, "pricingTiers": quantityTiers[] { "quantity": label, "price": basePrice, "pricePerUnit": basePrice, savingsPercentage, badge, isRecommended }, "startingPrice": quantityTiers[0].basePrice }',
        { query: `${searchQuery}*` } as Record<string, unknown>
      )
      return { data: products, error: null }
    } catch (err) {
      console.error('Error searching products:', err)
      return { data: null, error: err }
    }
  },

  async getAllProducts() {
    try {
      const products = await client.fetch(
        `*[_type == "subcategory" && isActive == true] | order(_createdAt desc) {
          _id,
          name,
          "slug": slug.current,
          "image_url": image.asset->url,
          "image_alt": image.alt,
          "images": images[] { "asset": asset->url, "alt": alt },
          "categoryName": category->name,
          "categorySlug": category->slug.current,
          minOrderQuantity,
          "pricingTiers": quantityTiers[] {
            "quantity": label,
            "price": basePrice,
            "pricePerUnit": basePrice,
            savingsPercentage,
            badge,
            isRecommended
          },
          _createdAt
        }`
      )

      const productsWithPrice = products.map((product: Subcategory) => ({
        ...product,
        startingPrice: product.pricingTiers?.[0]?.pricePerUnit || null
      }))

      return { data: productsWithPrice, error: null }
    } catch (err) {
      console.error('Error fetching all products:', err)
      return { data: null, error: 'Failed to fetch products' }
    }
  },

  // ===== ORDER FUNCTIONS =====

  async getOrderById(orderId: string) {
    try {
      const order = await client.fetch(
        `*[_type == "order" && orderId == $orderId][0] {
          _id,
          orderId,
          status,
          "customer": customer->{
            _id,
            firstName,
            lastName,
            email
          },
          customerDetails,
          deliveryAddress,
          "product": product->{
            _id,
            name,
            "slug": slug.current
          },
          productSnapshot,
          quantity,
          selectedTier,
          selectedOptions,
          pricing,
          payment,
          customerNotes,
          "designFiles": designFiles[]{
            fileName,
            fileUrl,
            fileType,
            fileSize,
            uploadedAt
          },
          deliveryInfo,
          adminNotes,
          internalTags,
          createdAt,
          updatedAt,
          completedAt
        }`,
        { orderId } as Record<string, unknown>
      )
      return { data: order, error: null }
    } catch (err) {
      console.error('Error fetching order:', err)
      return { data: null, error: err }
    }
  },

  async getOrdersByCustomerId(customerId: string) {
    try {
      const orders = await client.fetch(
        `*[_type == "order" && customer._ref == $customerId] | order(createdAt desc) {
          _id,
          orderId,
          status,
          productSnapshot {
            name,
            "image": productImage
          },
          pricing {
            totalPrice
          },
          payment {
            paymentStatus
          },
          createdAt,
          updatedAt
        }`,
        { customerId } as Record<string, unknown>
      )
      return { data: orders, error: null }
    } catch (err) {
      console.error('Error fetching customer orders:', err)
      return { data: null, error: err }
    }
  },

  async getAllOrders(limit: number = 100, offset: number = 0) {
    try {
      const orders = await client.fetch(
        `*[_type == "order"] | order(createdAt desc)[${offset}...${offset + limit}] {
          _id,
          orderId,
          status,
          "customerName": customerDetails.firstName,
          "productName": productSnapshot.name,
          pricing {
            totalPrice
          },
          payment {
            paymentStatus
          },
          createdAt,
          updatedAt
        }`
      )
      return { data: orders, error: null }
    } catch (err) {
      console.error('Error fetching all orders:', err)
      return { data: null, error: err }
    }
  },

  async getOrdersByStatus(status: string) {
    try {
      const orders = await client.fetch(
        `*[_type == "order" && status == $status] | order(createdAt desc) {
          _id,
          orderId,
          status,
          "customerName": customerDetails.firstName,
          "productName": productSnapshot.name,
          pricing {
            totalPrice
          },
          createdAt
        }`,
        { status } as Record<string, unknown>
      )
      return { data: orders, error: null }
    } catch (err) {
      console.error('Error fetching orders by status:', err)
      return { data: null, error: err }
    }
  },

  async createOrder(orderData: OrderInput) {
    try {
      const order = await client.create({
        _type: 'order',
        orderId: orderData.orderId,
        status: orderData.status || 'pending',
        customer: {
          _type: 'reference',
          _ref: orderData.customerId
        },
        customerDetails: orderData.customerDetails,
        deliveryAddress: orderData.deliveryAddress,
        product: {
          _type: 'reference',
          _ref: orderData.productId
        },
        productSnapshot: orderData.productSnapshot,
        quantity: orderData.quantity,
        selectedTier: orderData.selectedTier,
        selectedOptions: orderData.selectedOptions,
        pricing: orderData.pricing,
        payment: orderData.payment,
        customerNotes: orderData.customerNotes,
        designFiles: orderData.designFiles,
        deliveryInfo: orderData.deliveryInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      return { data: order, error: null }
    } catch (err) {
      console.error('Error creating order:', err)
      return { data: null, error: err }
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const order = await client.patch(orderId).set({ status, updatedAt: new Date().toISOString() }).commit()
      return { data: order, error: null }
    } catch (err) {
      console.error('Error updating order status:', err)
      return { data: null, error: err }
    }
  },

  async updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
    try {
      const order = await client.patch(orderId).set({ 'payment.paymentStatus': paymentStatus, updatedAt: new Date().toISOString() }).commit()
      return { data: order, error: null }
    } catch (err) {
      console.error('Error updating payment status:', err)
      return { data: null, error: err }
    }
  },

  async addAdminNotes(orderId: string, notes: string) {
    try {
      const order = await client.patch(orderId).set({ adminNotes: notes, updatedAt: new Date().toISOString() }).commit()
      return { data: order, error: null }
    } catch (err) {
      console.error('Error adding admin notes:', err)
      return { data: null, error: err }
    }
  },

  async addInternalTag(orderId: string, tag: string) {
    try {
      const order = await client.patch(orderId).insert('after', 'internalTags[-1]', [tag]).commit()
      return { data: order, error: null }
    } catch (err) {
      console.error('Error adding tag:', err)
      return { data: null, error: err }
    }
  },

  async updateDeliveryInfo(orderId: string, deliveryInfo: Partial<DeliveryInfo>) {
    try {
      const order = await client.patch(orderId).set({ deliveryInfo, updatedAt: new Date().toISOString() }).commit()
      return { data: order, error: null }
    } catch (err) {
      console.error('Error updating delivery info:', err)
      return { data: null, error: err }
    }
  },

  async completeOrder(orderId: string) {
    try {
      const order = await client.patch(orderId).set({ status: 'delivered', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }).commit()
      return { data: order, error: null }
    } catch (err) {
      console.error('Error completing order:', err)
      return { data: null, error: err }
    }
  }
}

// ===== INTERFACES =====

export interface Category {
  _id: string
  name: string
  slug: string
  description?: unknown[]
  image_url?: string
  image_alt?: string
  sortOrder: number
  isActive: boolean
  bgColor?: string
  _createdAt: string
  _updatedAt: string
  subcategories?: Subcategory[]
}

export interface ProductImage {
  asset: string
  alt?: string
}

export interface DeliveryOption {
  type: 'standard' | 'same_day' | 'express'
  description: string
  locations?: string
}

export interface ProductOption {
  label: string
  optionType: 'dropdown' | 'radio' | 'checkbox' | 'number'
  isRequired: boolean
  values?: OptionValue[]
  numberConfig?: NumberConfig
}

export interface OptionValue {
  label: string
  value: string
  basePrice?: number
  priceByTier?: Array<{
    tierLabel: string
    price?: number
  }>
}

export interface NumberConfig {
  min?: number
  max?: number
  step?: number
  basePricePerUnit?: number
  priceByTier?: Array<{
    tierLabel: string
    pricePerUnit?: number
  }>
}

export interface PricingTier {
  quantity: number
  price: number
  pricePerUnit: number
  savingsPercentage?: number
  badge?: string
  isRecommended: boolean
}

export interface Specification {
  label: string
  value: string
}

export interface Subcategory {
  _id: string
  name: string
  slug: string
  description?: unknown[]
  instructions?: unknown[]
  image_url?: string
  image_alt?: string
  images?: ProductImage[]
  deliveryOptions?: DeliveryOption[]
  productOptions?: ProductOption[]
  pricingTiers?: PricingTier[]
  specifications?: Specification[]
  minOrderQuantity: number
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  category?: Category
  startingPrice?: number
  categoryName?: string
  categorySlug?: string
}

// ===== ORDER INTERFACES =====

export interface CustomerDetails {
  firstName: string
  lastName?: string
  email: string
  phone: string
}

export interface DeliveryAddress {
  address: string
  city: string
  state: string
  pincode: string
}

export interface SelectedOption {
  optionLabel: string
  selectedValue: string
  priceAdded: number
}

export interface Pricing {
  basePrice: number
  optionsPrice: number
  totalPrice: number
  pricePerUnit: number
  discount?: number
  discountPercentage?: number
}

export interface Payment {
  paymentMethod: 'razorpay' | 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'other'
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  amountPaid: number
  paymentDate: string
}

export interface DesignFile {
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedAt: string
}

export interface DeliveryInfo {
  deliveryType?: 'standard' | 'express' | 'same_day'
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  trackingNumber?: string
  shippingProvider?: string
}

export interface SelectedTier {
  tierLabel: string
  quantity: number
  price: number
  basePrice: number
  savingsPercentage?: number
  badge?: string
}

export interface ProductSnapshot {
  name: string
  slug: string
  description?: string
  productImage?: {
    asset?: string
  }
}

export interface OrderInput {
  orderId: string
  customerId: string
  productId: string
  customerDetails: CustomerDetails
  deliveryAddress: DeliveryAddress
  productSnapshot: ProductSnapshot
  quantity: number
  selectedTier: SelectedTier
  selectedOptions?: SelectedOption[]
  pricing: Pricing
  payment: Payment
  customerNotes?: string
  designFiles?: DesignFile[]
  deliveryInfo?: DeliveryInfo
  status?: string
}

export interface Order extends OrderInput {
  _id: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}