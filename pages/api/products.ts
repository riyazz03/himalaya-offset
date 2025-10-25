import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/lib/sanity';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Fetching products from Sanity...');
    
    const products = await client.fetch(
      `*[_type == "subcategory"] {
        _id,
        name,
        "categoryName": category->name,
        image_url,
        startingPrice,
        minOrderQuantity,
        _createdAt
      } | order(_createdAt desc)`
    );

    console.log('Products fetched:', products?.length || 0);

    if (!products || products.length === 0) {
      return res.status(200).json({ data: [] });
    }

    return res.status(200).json({ data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}