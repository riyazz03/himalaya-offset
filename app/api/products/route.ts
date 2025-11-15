import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

interface Product {
  _id: string;
  name: string;
  slug: string;
  categoryName?: string;
  image_url?: string;
  startingPrice?: number;
  minOrderQuantity?: number;
  _createdAt?: string;
}

export async function GET() {
  try {
    const products = await client.fetch(
      `*[_type == "subcategory"] | order(_createdAt desc) {
        _id,
        name,
        "slug": slug.current,
        "categoryName": category->name,
        image_url,
        startingPrice,
        minOrderQuantity,
        _createdAt
      }`,
      {},
      { 
        cache: 'force-cache',
        next: { revalidate: 3600 }
      }
    );

    const productsWithImages: Product[] = products.map((product: Product) => ({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      categoryName: product.categoryName,
      image_url: product.image_url || null,
      startingPrice: product.startingPrice,
      minOrderQuantity: product.minOrderQuantity,
      _createdAt: product._createdAt
    }));

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