import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AuthProvider } from "@/features/auth/AuthContext";
import { getSession } from "@/features/auth/session";
import { userRepo } from "@/server/repositories";
import { WishlistBoot } from "@/features/wishlist/WishlistBoot";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlausibleScript } from "@/features/analytics/PlausibleScript";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Ungal Nesavalan · Elampillai Sarees",
    template: "%s · Ungal Nesavalan"
  },
  description:
    "Silk-cotton sarees woven on our own looms in Elampillai, Tamil Nadu — direct from our looms to your drape.",
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Ungal Nesavalan",
    title: "Ungal Nesavalan — Direct from Our Elampillai Looms",
    description:
      "Elampillai silk-cotton sarees crafted on our own looms in Tamil Nadu. Pure handloom, own manufacturing, honest pricing.",
    url: SITE_URL
  },
  twitter: {
    card: "summary_large_image",
    title: "Ungal Nesavalan — Direct from Our Elampillai Looms",
    description:
      "Elampillai silk-cotton sarees crafted on our own looms in Tamil Nadu. Pure handloom, own manufacturing, honest pricing."
  }
};

export const viewport: Viewport = {
  themeColor: "#f5eddc"
};

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ungal Nesavalan",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  sameAs: [] as string[]
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const user = session ? await userRepo.findById(session.userId) : null;
  const initialUser = user ? (({ passwordHash: _pw, ...rest }) => rest)(user) : null;

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <JsonLd data={ORGANIZATION_JSONLD} />
        <PlausibleScript />
      </head>
      <body className="min-h-screen bg-cream text-ink antialiased" suppressHydrationWarning>
        <AuthProvider initialUser={initialUser}>
          <WishlistBoot />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
