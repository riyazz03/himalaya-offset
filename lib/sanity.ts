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
  }
}

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