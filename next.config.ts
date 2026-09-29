import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ws", "@neondatabase/serverless"],
  allowedDevOrigins: ["192.168.1.4"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  }
};

const withPwa = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  register: true,
  cacheOnFrontEndNav: true,
  workboxOptions: {
    disableDevLogs: true
  }
});

export default withPwa(nextConfig);
