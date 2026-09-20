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
  title: 'Maison Glint — Modernist Chromeware',
  description: 'Forging liquid geometry into permanent domestic sculpture. Introducing The Glint Plate, Object 01.',
  openGraph: {
    title: 'Maison Glint — Modernist Chromeware',
    description: 'Forging liquid geometry into permanent domestic sculpture. Introducing The Glint Plate, Object 01.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Glint — Modernist Chromeware',
    description: 'Forging liquid geometry into permanent domestic sculpture. Introducing The Glint Plate, Object 01.',
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
        />
        <link
          rel="preload"
          as="image"
          href="/primary_logo_sm.svg"
          type="image/svg+xml"
        />
        <link
          rel="preload"
          as="image"
          href="/primary_logo_light.svg"
          type="image/svg+xml"
        />
      </head>
      <body className="bg-[#f9f9f7] text-[#111111] antialiased selection:bg-[#111111] selection:text-[#f9f9f7]" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

