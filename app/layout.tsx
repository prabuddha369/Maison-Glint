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
    default: 'Maison Glint — Modernist Centerpiece Platters & Tablescape Trays',
    template: '%s | Maison Glint',
  },
  description:
    'Sculptural, mirror-polished architectural centerpiece platters and decorative trays. Handcrafted in heavy-gauge stainless steel for seasonal tablescapes, holiday decor, and refined living spaces.',
  keywords: [
    'Maison Glint',
    'Centerpiece Platter',
    'Decorative Tray',
    'Modern Tablescape Tray',
    'Holiday Centerpiece',
    'Mirror Chrome Decor',
    'Architectural Tray',
    'Coffee Table Catchall',
    'Seasonal Staging Tray',
    'Stainless Steel Home Decor',
  ],
  authors: [{ name: 'Maison Glint Atelier' }],
  creator: 'Maison Glint',
  publisher: 'Maison Glint',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Maison Glint — Architectural Centerpiece Platters & Tablescape Trays',
    description:
      'Reflective stainless steel centerpiece platters designed for seasonal holiday staging, ambient candle reflection, and curated interior accents.',
    url: 'https://www.maisonglint.com',
    siteName: 'Maison Glint',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/products/object-01-the-glint-plate-hero-fig01.webp',
        width: 1000,
        height: 1500,
        alt: 'Maison Glint Centerpiece Platter styled with taper candles on raw travertine',
        type: 'image/webp',
      },
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maison Glint Modernist Chrome Centerpiece Tray',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Glint — Modernist Centerpiece Platters & Decor Trays',
    description:
      'Reflective stainless steel centerpiece platters designed for seasonal tablescapes and interior living spaces.',
    site: '@maisonglint',
    creator: '@maisonglint',
    images: ['/images/products/object-01-the-glint-plate-hero-fig01.webp'],
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
  other: {
    'pinterest-rich-pin': 'true',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} scroll-smooth`}>
      <head>
        <link rel="describedby" href="/llms.txt" />
      </head>
      <body className="bg-[#f9f9f7] text-[#111111] antialiased selection:bg-[#111111] selection:text-[#f9f9f7]" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

