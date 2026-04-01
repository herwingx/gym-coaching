import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/client/", "/api/", "/_next/", "/login", "/signup"],
      },
    ],
    sitemap: "https://ru-coach.app/sitemap.xml",
  };
}
