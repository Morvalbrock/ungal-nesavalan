import { jwtVerify, createRemoteJWKSet } from "jose";

const GOOGLE_JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const JWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

export interface VerifiedFirebaseToken {
  uid: string;
  phone?: string;
  email?: string;
  name?: string;
}

/**
 * Verifies a Firebase ID token using Google's public x509/JWKS certificates.
 * Does not require a service account private key, only the Firebase Project ID.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken> {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    // If running in development without Firebase keys and client sent a dev token:
    // Accept "dev-token:+91XXXXXXXXXX" and extract the phone directly.
    if (idToken.startsWith("dev-token:")) {
      const phone = idToken.slice("dev-token:".length);
      return { uid: `dev_${phone}`, phone };
    }
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not configured in environment variables");
  }

  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId
    });

    return {
      uid: (payload.sub as string) || (payload.user_id as string),
      phone: payload.phone_number as string | undefined,
      email: payload.email as string | undefined,
      name: payload.name as string | undefined
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Firebase token verification failed: ${message}`);
  }
}
