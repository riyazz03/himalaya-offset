import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

interface Product {
  _id: string;
  name: string;
  slug: string;
  image?: unknown;
  image_url?: string;
  description?: string;
  startingPrice?: number;
  minOrderQuantity?: number;
  categoryName?: string;
  _createdAt?: string;
}

export async function GET(
  _request: unknown,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await client.fetch(
      `*[_type == "subcategory" && slug.current == $slug][0] {
        _id,
        name,
        "slug": slug.current,
        image,
        image_url,
        description,
        startingPrice,
        minOrderQuantity,
        "categoryName": category->name,
        _createdAt
      }`,
      { slug }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productWithImage: Product = {
      ...product,
      image_url: product.image_url || null
    };

    return NextResponse.json({ data: productWithImage });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}