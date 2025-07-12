// lib/sanity.ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'k0dxt5dl', // Your Sanity project ID
  dataset: 'production',
  useCdn: false, // Important: set to false for development
  apiVersion: '2023-05-03',
  perspective: 'published',
  token: process.env.SANITY_API_TOKEN, // API token for write operations
})

const builder = imageUrlBuilder(client)
export const urlFor = (source: Record<string, unknown>) => builder.image(source)

// Database service functions
export const SanityService = {
  // Get all active categories
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

  // Get single category with its subcategories
  async getCategoryWithProducts(slug: string) {
    try {
      const category = await client.fetch(
        '*[_type == "category" && slug.current == $slug && isActive == true][0] { _id, name, "slug": slug.current, description, "image_url": image.asset->url, "image_alt": image.alt, bgColor, "subcategories": *[_type == "subcategory" && references(^._id) && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, "image_url": image.asset->url, "image_alt": image.alt, description, minOrderQuantity, isFeatured, sortOrder } }',
        { slug } as Record<string, unknown>
      )
      return { data: category, error: null }
    } catch (err) {
      console.error('Error fetching category:', err)
      return { data: null, error: err }
    }
  },

  // Get single product/subcategory with all options and pricing
  async getProduct(slug: string) {
    try {
      const product = await client.fetch(
        '*[_type == "subcategory" && slug.current == $slug && isActive == true][0] { _id, name, "slug": slug.current, description, "image_url": image.asset->url, "image_alt": image.alt, deliveryOptions, productOptions, pricingTiers, specifications, minOrderQuantity, isFeatured, "category": category->{ _id, name, "slug": slug.current } }',
        { slug } as Record<string, unknown>
      )
      return { data: product, error: null }
    } catch (err) {
      console.error('Error fetching product:', err)
      return { data: null, error: err }
    }
  },

  // Get featured products
  async getFeaturedProducts() {
    try {
      const products = await client.fetch(
        '*[_type == "subcategory" && isFeatured == true && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, "image_url": image.asset->url, "image_alt": image.alt, minOrderQuantity, "category": category->{ name, "slug": slug.current }, "startingPrice": pricingTiers[0].pricePerUnit }'
      )
      return { data: products, error: null }
    } catch (err) {
      console.error('Error fetching featured products:', err)
      return { data: null, error: err }
    }
  },

  // Search products
  async searchProducts(searchQuery: string) {
    try {
      const products = await client.fetch(
        '*[_type == "subcategory" && (name match $query || category->name match $query) && isActive == true] | order(sortOrder asc) { _id, name, "slug": slug.current, "image_url": image.asset->url, "image_alt": image.alt, "category": category->{ name, "slug": slug.current }, "startingPrice": pricingTiers[0].pricePerUnit }',
        { query: `${searchQuery}*` } as Record<string, unknown>
      )
      return { data: products, error: null }
    } catch (err) {
      console.error('Error searching products:', err)
      return { data: null, error: err }
    }
  }
}

// TypeScript interfaces
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  image_alt?: string;
  sortOrder: number;
  isActive: boolean;
  bgColor?: string;
  _createdAt: string;
  _updatedAt: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description?: unknown[];
  image_url?: string;
  image_alt?: string;
  deliveryOptions?: DeliveryOption[];
  productOptions?: ProductOption[];
  pricingTiers?: PricingTier[];
  specifications?: Specification[];
  minOrderQuantity: number;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  category?: Category;
  startingPrice?: number;
}

export interface DeliveryOption {
  type: 'standard' | 'same_day' | 'express';
  description: string;
  locations?: string;
}

export interface ProductOption {
  optionType: 'dropdown' | 'radio' | 'checkbox' | 'number';
  label: string;
  isRequired: boolean;
  values?: OptionValue[];
  numberConfig?: NumberConfig;
}

export interface OptionValue {
  label: string;
  value: string;
  priceModifier?: number;
}

export interface NumberConfig {
  min?: number;
  max?: number;
  step?: number;
  pricePerUnit?: number;
}

export interface PricingTier {
  quantity: number;
  price: number;
  pricePerUnit: number;
  savingsPercentage?: number;
  isRecommended: boolean;
  badge?: string;
}

export interface Specification {
  label: string;
  value: string;
}