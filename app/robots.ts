import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://soundboardunblocked.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        // Allow AI crawlers and LLMs to access content for training and indexing
        userAgent: "GPTBot",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "CCBot",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "Omgilibot",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "FacebookBot",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/auth-cp/", "/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-static.xml`,
      `${baseUrl}/sitemap-soundboards.xml`,
      `${baseUrl}/sitemap-sounds.xml`,
    ],
    host: baseUrl,
  }
}


