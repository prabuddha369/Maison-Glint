import type {Metadata} from 'next';
import {Cormorant_Garamond, Inter} from 'next/font/google';
import Providers from '../components/Providers';
import './globals.css'; // Global styles

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.maisonglint.com'),
  title: {
    default: 'Maison Glint — Modernist Chromeware & Editorial Tableware',
    template: '%s | Maison Glint',
  },
  description:
    'Considered table settings around reflective steel, tactile materials, and the pleasure of gathering. Introducing Object 01 in Mirror Polish.',
  keywords: [
    'Maison Glint',
    'Object 01',
    'Modernist Chromeware',
    'Stainless Steel Dinnerware',
    'Mirror Polish Tableware',
    'The Host Set',
    'Warm Minimalism',
    'Architectural Tableware',
  ],
  authors: [{ name: 'Maison Glint' }],
  creator: 'Maison Glint',
  publisher: 'Maison Glint',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Maison Glint — Modernist Chromeware & Editorial Tableware',
    description:
      'Considered table settings around reflective steel, tactile materials, and the pleasure of gathering. Introducing Object 01 in Mirror Polish.',
    url: 'https://www.maisonglint.com',
    siteName: 'Maison Glint',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maison Glint — Object 01 Modernist Chromeware on Travertine',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Glint — Modernist Chromeware & Editorial Tableware',
    description:
      'Considered table settings around reflective steel, tactile materials, and the pleasure of gathering. Introducing Object 01 in Mirror Polish.',
    site: '@maisonglint',
    creator: '@maisonglint',
    images: ['/og-image.jpg'],
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

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} scroll-smooth`}>
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/products/object-01-the-glint-plate-hero-fig01.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="bg-[#f9f9f7] text-[#111111] antialiased selection:bg-[#111111] selection:text-[#f9f9f7]" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

