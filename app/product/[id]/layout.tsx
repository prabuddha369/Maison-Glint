import type { Metadata } from 'next';
import { INITIAL_PRODUCTS } from '@/lib/products';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product =
    INITIAL_PRODUCTS.find(
      (p) =>
        p.id === id ||
        p.id.startsWith(id) ||
        p.name.toLowerCase().includes(id.toLowerCase())
    ) || INITIAL_PRODUCTS[0];

  const title = product ? product.name : 'Technical Monograph';
  const description =
    product?.description ||
    'Modernist chromeware and architectural tableware crafted in mirror-polished austenitic stainless steel.';
  const image = product?.images?.[0] || '/og-image.jpg';
  const canonicalUrl = `https://www.maisonglint.com/product/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Maison Glint',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 900,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function ProductLayout({ children, params }: Props) {
  const { id } = await params;
  const product =
    INITIAL_PRODUCTS.find(
      (p) =>
        p.id === id ||
        p.id.startsWith(id) ||
        p.name.toLowerCase().includes(id.toLowerCase())
    ) || INITIAL_PRODUCTS[0];

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images?.map((img) =>
          img.startsWith('http') ? img : `https://www.maisonglint.com${img}`
        ),
        brand: {
          '@type': 'Brand',
          name: 'Maison Glint',
        },
        material: product.specifications?.gauge || 'AISI 304 Stainless Steel',
        offers: {
          '@type': 'Offer',
          url: `https://www.maisonglint.com/product/${id}`,
          priceCurrency: product.currency || 'USD',
          price: product.price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
