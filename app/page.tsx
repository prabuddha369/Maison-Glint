import HomeClient from '@/components/HomeClient';

// JSON-LD Structured Data for SEO
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Maison Glint',
  url: 'https://www.maisonglint.com',
  logo: 'https://www.maisonglint.com/primary_logo_light.svg',
  description: 'Modernist chromeware and editorial tableware. Considered table settings around reflective steel, tactile materials, and the pleasure of gathering.',
  sameAs: [],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Maison Glint',
  url: 'https://www.maisonglint.com',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.maisonglint.com',
    },
  ],
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Object 01 — The Glint Plate',
  description: 'A considered table setting in mirror-polished stainless steel. Hand-finished, serialized atelier edition.',
  image: 'https://www.maisonglint.com/images/products/object-01-the-glint-plate-hero-fig01.webp',
  brand: {
    '@type': 'Brand',
    name: 'Maison Glint',
  },
  material: 'Grade 316 Stainless Steel',
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/LimitedAvailability',
    priceCurrency: 'USD',
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <HomeClient />
    </>
  );
}
