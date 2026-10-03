import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { userRepo } from "@/server/repositories";

function requiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (v) return v;
  // Next.js evaluates route modules during `next build` to collect page data;
  // fail soft there and let runtime surface the missing var.
  if (process.env.NEXT_PHASE === "phase-production-build") return "";
  throw new Error(`${name} is not set`);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: requiredEnv("AUTH_GOOGLE_ID"),
      clientSecret: requiredEnv("AUTH_GOOGLE_SECRET")
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        console.log("[auth/signIn] rejecting non-google provider=%s", account?.provider);
        return false;
      }
      const googleId = profile?.sub;
      const email = typeof profile?.email === "string" ? profile.email.trim().toLowerCase() : null;
      if (!googleId || !email) {
        console.log("[auth/signIn] missing googleId or email; googleId=%s email=%s", googleId, email);
        return false;
      }

      const existingByGoogle = await userRepo.findByGoogleId(googleId);
      if (existingByGoogle) {
        console.log("[auth/signIn] existing user by googleId; email=%s", email);
        return true;
      }

      const existingByEmail = await userRepo.findByEmail(email);
      if (existingByEmail) {
        console.log("[auth/signIn] linking google to existing email account; email=%s", email);
        await userRepo.update(existingByEmail.id, {
          googleId,
          image: existingByEmail.image ?? (typeof profile?.picture === "string" ? profile.picture : undefined)
        });
        return true;
      }

      const name =
        (typeof profile?.name === "string" && profile.name.trim()) ||
        email.split("@")[0];
      const image = typeof profile?.picture === "string" ? profile.picture : undefined;
      const created = await userRepo.create({
        email,
        name,
        role: "customer",
        googleId,
        image
      });
      console.log("[auth/signIn] created new user id=%s email=%s", created.id, email);
      return true;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
});
