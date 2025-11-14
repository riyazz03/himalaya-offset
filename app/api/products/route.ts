import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import imageUrlBuilder from '@sanity/image-url';

const imageBuilder = imageUrlBuilder(client);

function getImageUrl(source: any): string | undefined {
  if (!source) return undefined;
  
  try {
    return imageBuilder.image(source).width(500).height(500).url();
  } catch (error) {
    console.error('Error building image URL:', error);
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching products from Sanity...');
    
    const products = await client.fetch(
      `*[_type == "subcategory"] {
        _id,
        name,
        "slug": slug.current,
        "categoryName": category->name,
        "categorySlug": category->slug.current,
        image,
        image_url,
        startingPrice,
        minOrderQuantity,
        _createdAt
      } | order(_createdAt desc)`
    );

    console.log('Products fetched:', products?.length || 0);

    const productsWithImages = products.map((product: any) => ({
      ...product,
      image_url: product.image_url || getImageUrl(product.image) || null
    }));

    if (productsWithImages && productsWithImages.length > 0) {
      console.log('First product:', JSON.stringify(productsWithImages[0], null, 2));
      const withImages = productsWithImages.filter((p: any) => p.image_url);
      console.log(`Products with images: ${withImages.length}/${productsWithImages.length}`);
    }

    if (!productsWithImages || productsWithImages.length === 0) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: productsWithImages });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}