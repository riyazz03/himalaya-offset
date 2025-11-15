import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import imageUrlBuilder from '@sanity/image-url';

const imageBuilder = imageUrlBuilder(client);

interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryName?: string;
  image_url?: string | null;
  startingPrice?: number;
  minOrderQuantity?: number;
  _createdAt?: string;
  image?: {
    _type: string;
    asset?: {
      _ref: string;
    };
  };
}

function getImageUrl(source: Product['image']): string | null {
  if (!source) return null;
  
  try {
    return imageBuilder.image(source).width(500).height(500).url();
  } catch (error) {
    console.error('Error building image URL:', error);
    return null;
  }
}

export async function GET() {
  try {
    const products = await client.fetch(
      `*[_type == "subcategory"] | order(_createdAt desc) {
        _id,
        name,
        "slug": slug.current,
        "categoryName": category->name,
        image,
        image_url,
        startingPrice,
        minOrderQuantity,
        _createdAt
      }`
    );

    const productsWithImages: Product[] = products.map((product: Product) => {
      // Prefer image_url if available, otherwise build from image field
      let finalImageUrl = product.image_url;
      
      if (!finalImageUrl && product.image) {
        finalImageUrl = getImageUrl(product.image);
      }

      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        categoryName: product.categoryName,
        image_url: finalImageUrl || null,
        startingPrice: product.startingPrice,
        minOrderQuantity: product.minOrderQuantity,
        _createdAt: product._createdAt
      };
    });

    return NextResponse.json(
      { data: productsWithImages },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { data: [], error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}