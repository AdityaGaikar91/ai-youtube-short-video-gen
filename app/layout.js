import { Outfit,Orbitron } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

export const metadata = {
  title: "AI YouTube Short Video Generator - Create Viral Shorts with Genvid",
  description: "Generate viral YouTube Shorts and short videos instantly with our AI video generator. Genvid helps you create engaging content with AI text to video technology.",
  keywords: ["youtube shorts", "short video", "ai video generator", "genvid", "ai video creation", "text to video", "viral shorts", "content creation"],
  metadataBase: new URL('https://ai-youtube-short-video-gen.vercel.app'), // Replace with actual domain if different
  openGraph: {
    title: "AI YouTube Short Video Generator - Genvid",
    description: "Create engaging YouTube Shorts in seconds with AI. Turn text into viral videos.",
    url: 'https://ai-youtube-short-video-gen.vercel.app',
    siteName: 'Genvid',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI YouTube Short Video Generator - Genvid",
    description: "Create engaging YouTube Shorts in seconds with AI. Turn text into viral videos.",
  },
  alternates: {
    canonical: '/',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Genvid - AI YouTube Short Video Generator',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  description: 'An AI-powered tool to generate YouTube Shorts and short videos from text.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const outfit = Outfit({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
       className={outfit.className}
       suppressHydrationWarning={true}
      >
        <ConvexClientProvider>
        {children}
        </ConvexClientProvider>
        
      </body>
    </html>
  );
}

