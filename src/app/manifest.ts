import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ungal Nesavalan · Handloom Sarees",
    short_name: "Ungal Nesavalan",
    description: "Handloom sarees from India's finest weaving clusters.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5eddc",
    theme_color: "#f5eddc",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
