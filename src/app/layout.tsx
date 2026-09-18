import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AuthProvider } from "@/features/auth/AuthContext";
import { getSession } from "@/features/auth/session";
import { userRepo } from "@/server/repositories";

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
    default: "Ungal Nesavalan · Handloom Sarees",
    template: "%s · Ungal Nesavalan"
  },
  description:
    "Handcrafted sarees from India's finest weaving clusters — Kanjivaram, Banarasi, Chanderi, Patola and more.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const user = session ? await userRepo.findById(session.userId) : null;
  const initialUser = user ? (({ passwordHash: _pw, ...rest }) => rest)(user) : null;

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
      </body>
    </html>
  );
}
