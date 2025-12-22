export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: 'https://ai-youtube-short-video-gen.vercel.app/sitemap.xml',
  };
}
