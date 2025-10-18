import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/chat/", "/profile/"],
    },
    sitemap: "https://chatbattles.ai/sitemap.xml",
  };
}

