import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://beehive.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
  ];

  // Agrega aqui tus rutas dinamicas (ej: blog posts, productos)
  // const posts = await fetchPosts();
  // const dynamicRoutes = posts.map(p => ({
  //   url: `${BASE_URL}/posts/${p.slug}`,
  //   lastModified: new Date(p.updatedAt),
  //   changeFrequency: "weekly" as const,
  //   priority: 0.8,
  // }));

  return [...staticRoutes];
}
