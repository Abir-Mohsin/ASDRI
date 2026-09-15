import { MetadataRoute } from 'next';
import { fetchAllCourses } from '@/lib/coursesData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://asdri.edu.bd';
  const locales = ['en', 'bn', 'ar'];
  const staticRoutes = [
    '',
    '/about',
    '/admission',
    '/courses',
    '/library',
    '/research',
    '/alumni',
    '/login',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add localized static pages
  for (const locale of locales) {
    for (const route of staticRoutes) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  // Add course pages
  try {
    const courses = await fetchAllCourses();
    for (const locale of locales) {
      for (const course of courses) {
        if (course.id) {
          sitemapEntries.push({
            url: `${baseUrl}/${locale}/courses/${course.id}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch courses for sitemap generator:', err);
  }

  return sitemapEntries;
}
