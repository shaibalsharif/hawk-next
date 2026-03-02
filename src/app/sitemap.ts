import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://hawk-beta.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                   lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/about`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/services`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/portfolio`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
  ]

  const [categories, items] = await Promise.all([
    prisma.portfolioCategory.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.portfolioItem.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/portfolio/${cat.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const itemRoutes: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${BASE_URL}/portfolio/${item.categoryId}/${item.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...itemRoutes]
}
