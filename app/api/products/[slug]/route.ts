import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import imageUrlBuilder from '@sanity/image-url';

const imageBuilder = imageUrlBuilder(client);

interface Product {
  _id: string;
  name: string;
  slug: string;
  image?: {
    _type: string;
    asset?: {
      _ref: string;
    };
  };
  image_url?: string | null;
  description?: string;
  instructions?: string;
  startingPrice?: number;
  minOrderQuantity?: number;
  categoryName?: string;
  _createdAt?: string;
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
        instructions,
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

    // Prefer image_url if available, otherwise build from image field
    let finalImageUrl = product.image_url;
    
    if (!finalImageUrl && product.image) {
      finalImageUrl = getImageUrl(product.image);
    }

    const productWithImage: Product = {
      ...product,
      image_url: finalImageUrl || null
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