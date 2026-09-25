import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
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
