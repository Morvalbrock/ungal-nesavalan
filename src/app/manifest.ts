import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ungal Nesavalan · Elampillai Sarees",
    short_name: "Ungal Nesavalan",
    description: "Silk-cotton sarees direct from our Elampillai looms.",
    start_url: "/",
    display: "standalone",
    background_color: "#2D083B",
    theme_color: "#3C124D",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
