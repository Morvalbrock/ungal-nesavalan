import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { userRepo } from "@/server/repositories";

function requiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`${name} is not set`);
  return v;
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
      if (account?.provider !== "google") return false;
      const googleId = profile?.sub;
      const email = typeof profile?.email === "string" ? profile.email.trim().toLowerCase() : null;
      if (!googleId || !email) return false;

      const existingByGoogle = await userRepo.findByGoogleId(googleId);
      if (existingByGoogle) return true;

      const existingByEmail = await userRepo.findByEmail(email);
      if (existingByEmail) {
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
      await userRepo.create({
        email,
        name,
        role: "customer",
        googleId,
        image
      });
      return true;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  }
});
