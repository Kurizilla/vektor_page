import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const lastModified = new Date();
  return [
    { url: `${baseUrl}/`, lastModified },
    { url: `${baseUrl}/#servicios`, lastModified },
    { url: `${baseUrl}/#proyectos`, lastModified },
    { url: `${baseUrl}/#valor`, lastModified }
  ];
}


